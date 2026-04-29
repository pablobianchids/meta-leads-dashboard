// Extrai o action_type que a Meta usa como "resultado" da campanha (mesmo critério do Ads Manager)
const getResultActionType = (cost_per_result) => {
  if (!Array.isArray(cost_per_result) || !cost_per_result[0]) return null;
  // indicator vem como "actions:onsite_conversion.messaging_conversation_started_7d"
  return cost_per_result[0].indicator?.replace('actions:', '') || null;
};

export const getCPL = (cost_per_result) => {
  if (!Array.isArray(cost_per_result) || !cost_per_result[0]) return 0;
  return parseFloat(cost_per_result[0].values?.[0]?.value || 0);
};

export const getLeads = (actions, cost_per_result) => {
  const actionType = getResultActionType(cost_per_result);
  if (!Array.isArray(actions)) return 0;

  if (actionType) {
    const match = actions.find(x => x.action_type === actionType);
    if (match) return parseInt(match.value);
  }

  // fallback para tipos comuns de lead
  const FALLBACK = ['lead', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead'];
  const fallback = actions.find(x => FALLBACK.includes(x.action_type));
  return parseInt(fallback?.value || 0);
};

export const currency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);

export const number = (v) =>
  new Intl.NumberFormat('pt-BR').format(v || 0);

export const percent = (v) =>
  `${parseFloat(v || 0).toFixed(2)}%`;

export const shortDate = (dateStr) => {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
};
