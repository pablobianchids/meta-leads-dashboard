// Service layer da Clinicorp. Agrega chamadas em métricas que o frontend consome.
// Mantém cache por (cliente, período) para preservar o rate-limit (25 req/h).

const { callClinicorp } = require('./client');

// Cache mais agressivo: 30 min (rate limit baixo da Clinicorp)
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

/**
 * Busca métricas operacionais do Clinicorp para um intervalo {since, until}.
 * Retorna estrutura unificada que o frontend consome via /api/operations.
 *
 * STATUS: stub. Quando a doc da Clinicorp for confirmada:
 *  1. Ajustar `DEFAULT_BASE` e auth em ./client.js
 *  2. Implementar fetchAppointments() chamando o endpoint correto
 *  3. Mapear status (agendado/realizado/cancelado/falta) via TRANSFORMER
 */
async function getOperationsOverview(client, { since, until }) {
  const cacheKey = `operations:${client.user}:${since}:${until}`;
  const cached = getCached(cacheKey);
  if (cached) return { ...cached, _cached: true };

  // TODO: substituir por chamadas reais quando a doc for confirmada
  const result = {
    appointments_scheduled: null,
    appointments_completed: null,
    appointments_cancelled: null,
    new_patients: null,
    total_visits: null,
    attendance_rate: null,
    _stub: true,
    _message: 'Aguardando documentação da API Clinicorp para implementação'
  };

  setCached(cacheKey, result);
  return result;
}

module.exports = { getOperationsOverview };
