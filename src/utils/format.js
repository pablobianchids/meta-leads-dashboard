const getResultActionType = (cost_per_result) => {
  if (!Array.isArray(cost_per_result) || !cost_per_result[0]) return null;
  return cost_per_result[0].indicator?.replace('actions:', '') || null;
};

// Ordem de prioridade para identificar leads quando cost_per_result não está disponível
const LEAD_PRIORITY = [
  'lead',
  'onsite_conversion.lead_grouped',
  'offsite_conversion.fb_pixel_lead',
  'onsite_web_lead',
  'onsite_conversion.lead',
  'onsite_conversion.messaging_conversation_started_7d',
  'onsite_conversion.total_messaging_connection',
];

export const getLeads = (actions, cost_per_result) => {
  if (!Array.isArray(actions)) return 0;

  // 1. Usar o tipo que a Meta definiu como resultado da campanha
  const resultType = getResultActionType(cost_per_result);
  if (resultType) {
    const match = actions.find(x => x.action_type === resultType);
    if (match) return parseInt(match.value);
  }

  // 2. Fallback pela ordem de prioridade
  for (const type of LEAD_PRIORITY) {
    const match = actions.find(x => x.action_type === type);
    if (match) return parseInt(match.value);
  }

  return 0;
};

export const getCPL = (cost_per_result, spend, leads) => {
  // Usar o valor direto do cost_per_result quando disponível
  if (Array.isArray(cost_per_result) && cost_per_result[0]) {
    const val = parseFloat(cost_per_result[0].values?.[0]?.value || 0);
    if (val > 0) return val;
  }
  // Calcular manualmente: spend / leads
  if (spend > 0 && leads > 0) return spend / leads;
  return 0;
};

// Locale apropriado para a moeda. BRL → pt-BR (R$), USD → en-US ($).
const localeFor = (code) => (code === 'BRL' ? 'pt-BR' : 'en-US');

export const currency = (v, code = 'USD') =>
  new Intl.NumberFormat(localeFor(code), { style: 'currency', currency: code }).format(v || 0);

export const number = (v) =>
  new Intl.NumberFormat('pt-BR').format(v || 0);

export const percent = (v) =>
  `${parseFloat(v || 0).toFixed(2)}%`;

export const shortDate = (dateStr) => {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
};

// Limite visual para evitar números absurdos com base baixa
const TREND_CAP = 999;

/**
 * Computa o trend de uma métrica entre dois períodos.
 * Retorna um objeto descritivo em vez de só um número, pra cobrir todos os casos.
 *
 * Tipos:
 *  - 'no-base': sem dado anterior (null/undefined)
 *  - 'no-change': ambos zero
 *  - 'new': anterior=0, atual>0
 *  - 'percent': variação calculável; pode vir com `capped: true` quando >999%
 */
export const computeTrend = (current, previous) => {
  const c = Number.isFinite(current) ? current : null;
  const p = Number.isFinite(previous) ? previous : null;

  if (c === null || p === null) return { kind: 'no-base' };
  if (c === 0 && p === 0) return { kind: 'no-change', value: 0 };
  if (p === 0 && c > 0) return { kind: 'new' };

  const raw = ((c - p) / p) * 100;
  const capped = Math.abs(raw) > TREND_CAP;
  const value = capped ? Math.sign(raw) * TREND_CAP : raw;
  return { kind: 'percent', value, raw, capped };
};

/**
 * Decide se um trend é "bom" baseado no tipo de métrica.
 *  - kind=lower-better: menor é melhor (ex: CPL)
 *  - kind=higher-better: maior é melhor (ex: leads, CTR, alcance)
 *  - kind=neutral: gasto — sem cor automática
 */
export const isTrendGood = (trend, kind) => {
  if (trend?.kind !== 'percent') return null;
  if (kind === 'neutral') return null;
  if (kind === 'lower-better') return trend.value < 0;
  return trend.value > 0;
};

/**
 * Classifica o desempenho de um ad em good/watch/critical baseado no
 * CPL e CTR comparados à mediana do conjunto. Retorna 'watch' como fallback.
 */
export const classifyAdPerformance = (ad, stats) => {
  const ins = ad.insights;
  if (!ins) return 'watch';

  const leads = getLeads(ins.actions, ins.cost_per_result);
  const spend = parseFloat(ins.spend || 0);
  const cpl = getCPL(ins.cost_per_result, spend, leads);
  const ctr = parseFloat(ins.ctr || 0);
  const freq = parseFloat(ins.frequency || 0);

  const { medianCpl, medianCtr } = stats;

  // Critical: CPL muito acima da mediana, ou frequência alta, ou zero leads com gasto significativo
  if (medianCpl > 0 && cpl > 0 && cpl > medianCpl * 1.6) return 'critical';
  if (freq >= 4) return 'critical';
  if (leads === 0 && spend > medianCpl * 3) return 'critical';

  // Good: CPL abaixo da mediana e CTR acima
  if (medianCpl > 0 && cpl > 0 && cpl < medianCpl * 0.85 && (medianCtr === 0 || ctr >= medianCtr)) return 'good';

  return 'watch';
};

/**
 * Retorna a mediana de uma lista de números (filtra zeros e NaN).
 */
export const median = (arr) => {
  const sorted = arr.filter(v => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

