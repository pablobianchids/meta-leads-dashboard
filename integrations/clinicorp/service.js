// Service layer da Clinicorp. Agrega `/appointment/list` em métricas que o
// frontend consome. Mantém cache agressivo (30 min) por causa do rate limit
// baixo da Clinicorp (25 req/h por padrão).

const { callClinicorp } = require('./client');

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map();

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCached = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Cache do mapeamento Type → StatusId (raramente muda, TTL longo)
const STATUS_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const statusCache = new Map();

/**
 * Busca status_list e cacheia mapa { CHECKOUT: id, MISSED: id, ... }.
 */
async function getStatusMap(cfg) {
  const key = `status:${cfg.subscriberId}`;
  const entry = statusCache.get(key);
  if (entry && Date.now() - entry.timestamp < STATUS_TTL_MS) {
    return entry.data;
  }
  const data = await callClinicorp(cfg, '/appointment/status_list');
  const list = data?.list || data || [];
  const map = {};
  for (const s of list) {
    if (s.Type && s.id) map[s.Type] = s.id;
  }
  statusCache.set(key, { data: map, timestamp: Date.now() });
  return map;
}

/**
 * Busca métricas operacionais agregadas para um intervalo {since, until}.
 *
 * Como a Primordialle não fecha agendamentos manualmente como CHECKOUT,
 * usamos uma heurística pragmática:
 *  - "Realizadas" = agendamentos cuja data já passou e que NÃO estão MISSED
 *  - "Faltas/Não compareceu" = StatusId === MISSED
 *  - "Agendadas" = total de agendamentos no período (não-deletados)
 *
 * `upcoming` separa os ainda futuros (não conta na taxa de comparecimento).
 * `FirstAppointment === 'X'` marca novo paciente.
 */
// Whitelist: se includeOnly tiver itens, SÓ categorias que contêm alguma
// dessas keywords contam. Senão, aceita tudo (e a exclusão entra em ação).
const matchesIncludeOnly = (appointment, includeOnlyKeywords) => {
  if (!includeOnlyKeywords?.length) return true;
  const cat = (appointment.CategoryDescription || '').toLowerCase();
  return includeOnlyKeywords.some(kw => cat.includes(kw));
};

// Filtra agendamentos cuja categoria contém qualquer uma das keywords.
const isExcludedCategory = (appointment, excludeKeywords) => {
  if (!excludeKeywords?.length) return false;
  const cat = (appointment.CategoryDescription || '').toLowerCase();
  return excludeKeywords.some(kw => cat.includes(kw));
};

// Filtra agendamentos cuja Notes contém qualquer uma das keywords.
// Pega compromissos internos sob uma categoria de dentista (treinamento,
// bikefit, barbearia, calls comerciais, etc).
const isExcludedByNotes = (appointment, excludeKeywords) => {
  if (!excludeKeywords?.length) return false;
  const notes = (appointment.Notes || '').toLowerCase();
  if (!notes) return false;
  return excludeKeywords.some(kw => notes.includes(kw));
};

async function getOperationsOverview(cfg, { since, until }) {
  if (!cfg) throw new Error('Clinicorp config missing');

  const cacheKey = `operations:${cfg.subscriberId}:${since}:${until}:${(cfg.includeOnlyCategories || []).join('|')}:${(cfg.excludeCategories || []).join('|')}:${(cfg.excludeNoteKeywords || []).join('|')}`;
  const cached = getCached(cacheKey);
  if (cached) return { ...cached, _cached: true };

  const [statusMap, appointments] = await Promise.all([
    getStatusMap(cfg),
    callClinicorp(cfg, '/appointment/list', { from: since, to: until })
  ]);

  const list = Array.isArray(appointments) ? appointments : (appointments?.list || []);
  const missedId = statusMap.MISSED;

  // Considera "passado" pelo dia (sem hora). Compara com data local de hoje.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let scheduled = 0;
  let completed = 0;
  let missed = 0;
  let upcoming = 0;
  let newPatients = 0;
  let excluded = 0;

  for (const a of list) {
    if (a.Deleted === 'X') continue;
    // Whitelist primeiro (se setada): só categorias permitidas continuam.
    // Depois excluir por categoria/notes (sob a whitelist, casos específicos).
    if (!matchesIncludeOnly(a, cfg.includeOnlyCategories) ||
        isExcludedCategory(a, cfg.excludeCategories) ||
        isExcludedByNotes(a, cfg.excludeNoteKeywords)) {
      excluded++;
      continue;
    }
    scheduled++;

    const date = a.date ? new Date(a.date) : null;
    const isPast = date && date < today;
    const isMissed = a.StatusId === missedId;

    if (isMissed) missed++;
    else if (isPast) completed++;
    else upcoming++;

    if (a.FirstAppointment === 'X') newPatients++;
  }

  const attendanceBase = completed + missed;
  const attendanceRate = attendanceBase > 0 ? (completed / attendanceBase) * 100 : null;

  const result = {
    appointments_scheduled: scheduled,
    appointments_completed: completed,
    appointments_cancelled: missed,
    appointments_upcoming: upcoming,
    new_patients: newPatients,
    total_visits: completed,
    attendance_rate: attendanceRate,
    excluded_count: excluded,
    period: { since, until }
  };

  setCached(cacheKey, result);
  return result;
}

module.exports = { getOperationsOverview };
