export const fetchOverview = (datePreset) =>
  fetch(`/api/overview?date_preset=${datePreset}`).then(r => r.json());

export const fetchCampaigns = (datePreset) =>
  fetch(`/api/campaigns?date_preset=${datePreset}`).then(r => r.json());

export const fetchDaily = (datePreset) =>
  fetch(`/api/daily?date_preset=${datePreset}`).then(r => r.json());
