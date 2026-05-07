const buildUrl = (path, params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  ).toString();
  return qs ? `${path}?${qs}` : path;
};

// Aceita preset ('last_30d') OU custom range ({since, until}).
// Quando custom, ignora o preset.
const dateParams = (datePreset, customRange) => {
  if (datePreset === 'custom' && customRange?.since && customRange?.until) {
    return { since: customRange.since, until: customRange.until };
  }
  return { date_preset: datePreset || 'last_30d' };
};

export const fetchClients = () =>
  fetch('/api/clients').then(r => r.json());

export const fetchOverview = (datePreset, client, customRange) =>
  fetch(buildUrl('/api/overview', { ...dateParams(datePreset, customRange), client })).then(r => r.json());

export const fetchCampaigns = (datePreset, client, customRange) =>
  fetch(buildUrl('/api/campaigns', { ...dateParams(datePreset, customRange), client })).then(r => r.json());

export const fetchDaily = (datePreset, client, customRange) =>
  fetch(buildUrl('/api/daily', { ...dateParams(datePreset, customRange), client })).then(r => r.json());

export const fetchAds = (datePreset, client, customRange) =>
  fetch(buildUrl('/api/ads', { ...dateParams(datePreset, customRange), client })).then(r => r.json());

export const fetchGeo = (datePreset, client, customRange) =>
  fetch(buildUrl('/api/geo', { ...dateParams(datePreset, customRange), client })).then(r => r.json());

export const fetchConfig = (client) =>
  fetch(buildUrl('/api/health', { client })).then(r => r.json());
