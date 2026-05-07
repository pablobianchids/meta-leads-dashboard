import { useState, useEffect, useCallback } from 'react';
import { fetchOverview, fetchCampaigns, fetchDaily, fetchGeo } from '../services/api';
import { getLeads, getCPL, computeTrend } from '../utils/format';
import { getCoords } from '../utils/geo';
import { useI18n } from './useI18n';

const buildOverview = (raw) => {
  if (!raw?.data?.[0]) return null;
  const d = raw.data[0];
  const spend = parseFloat(d.spend || 0);
  const leads = getLeads(d.actions, d.cost_per_result);
  return {
    impressions: parseInt(d.impressions || 0),
    reach: parseInt(d.reach || 0),
    clicks: parseInt(d.clicks || 0),
    spend,
    leads,
    cpl: getCPL(d.cost_per_result, spend, leads),
    ctr: parseFloat(d.ctr || 0),
    cpc: parseFloat(d.cpc || 0),
    frequency: parseFloat(d.frequency || 0),
  };
};

const calcTrend = (current, previous) => {
  // Sem qualquer dado anterior → todas as métricas viram 'no-base'
  if (!previous) {
    const empty = { kind: 'no-base' };
    return { leads: empty, cpl: empty, spend: empty, ctr: empty, impressions: empty, reach: empty };
  }
  const trend = (k) => computeTrend(current?.[k], previous?.[k]);
  return {
    leads: trend('leads'),
    cpl: trend('cpl'),
    spend: trend('spend'),
    ctr: trend('ctr'),
    impressions: trend('impressions'),
    reach: trend('reach')
  };
};

const processCampaigns = (data) => {
  if (!data?.data) return [];
  return data.data.map(d => {
    const spend = parseFloat(d.spend || 0);
    const leads = getLeads(d.actions, d.cost_per_result);
    return {
      id: d.campaign_id,
      name: d.campaign_name,
      impressions: parseInt(d.impressions || 0),
      reach: parseInt(d.reach || 0),
      clicks: parseInt(d.clicks || 0),
      spend,
      leads,
      cpl: getCPL(d.cost_per_result, spend, leads),
      ctr: parseFloat(d.ctr || 0),
      frequency: parseFloat(d.frequency || 0),
    };
  });
};

const processDaily = (data) => {
  if (!data?.data) return [];
  return data.data.map(d => ({
    date: d.date_start,
    leads: getLeads(d.actions, d.cost_per_result),
    spend: parseFloat(d.spend || 0),
    impressions: parseInt(d.impressions || 0),
    clicks: parseInt(d.clicks || 0),
  }));
};

const processGeo = (data) => {
  if (!data?.data) return [];
  return data.data
    .map(d => {
      const spend = parseFloat(d.spend || 0);
      const leads = getLeads(d.actions, d.cost_per_result);
      const coords = getCoords(d.region);
      if (!coords || leads === 0) return null;
      const clicks = parseInt(d.clicks || 0);
      const impressions = parseInt(d.impressions || 0);
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      return {
        region: d.region,
        coords,
        leads,
        spend,
        clicks,
        impressions,
        ctr,
        cpl: getCPL(d.cost_per_result, spend, leads)
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.leads - a.leads);
};

export const useDashboard = (datePreset, client, customRange) => {
  const { t } = useI18n();
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [daily, setDaily] = useState([]);
  const [geo, setGeo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!client) return;
    setError(null);
    try {
      const [ov, ca, da, ge] = await Promise.all([
        fetchOverview(datePreset, client, customRange),
        fetchCampaigns(datePreset, client, customRange),
        fetchDaily(datePreset, client, customRange),
        fetchGeo(datePreset, client, customRange)
      ]);

      if (ov.error) {
        if (ov.error.rateLimited) {
          setError(t('rateLimitWarning'));
          return;
        }
        if (ov.error.tokenExpired) {
          setError(`${t('tokenExpiredTitle')} — ${t('tokenExpiredDesc')}`);
          return;
        }
        throw new Error(ov.error.message || JSON.stringify(ov.error));
      }

      const current = buildOverview(ov.current);
      const previous = buildOverview(ov.previous);

      setOverview(current);
      setTrend(calcTrend(current, previous));
      setCampaigns(processCampaigns(ca));
      setDaily(processDaily(da));
      setGeo(processGeo(ge));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [datePreset, client, customRange?.since, customRange?.until, t]);

  useEffect(() => {
    if (!client) return;
    // Limpa dados ao trocar cliente (evita "fantasma" do cliente anterior)
    setOverview(null);
    setTrend({});
    setCampaigns([]);
    setDaily([]);
    setGeo([]);
    setLoading(true);
    fetchAll();
    const interval = setInterval(fetchAll, 300000);
    return () => clearInterval(interval);
  }, [fetchAll, client]);

  return { overview, trend, campaigns, daily, geo, loading, error, lastUpdated, refetch: fetchAll };
};
