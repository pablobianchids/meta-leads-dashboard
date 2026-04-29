import { useState, useEffect, useCallback } from 'react';
import { fetchOverview, fetchCampaigns, fetchDaily } from '../services/api';
import { getLeads, getCPL } from '../utils/format';

const processOverview = (data) => {
  if (!data?.data?.[0]) return null;
  const d = data.data[0];
  return {
    impressions: parseInt(d.impressions || 0),
    reach: parseInt(d.reach || 0),
    clicks: parseInt(d.clicks || 0),
    spend: parseFloat(d.spend || 0),
    leads: getLeads(d.actions, d.cost_per_result),
    cpl: getCPL(d.cost_per_result),
    ctr: parseFloat(d.ctr || 0),
    cpc: parseFloat(d.cpc || 0),
    frequency: parseFloat(d.frequency || 0),
  };
};

const processCampaigns = (data) => {
  if (!data?.data) return [];
  return data.data.map(d => ({
    id: d.campaign_id,
    name: d.campaign_name,
    impressions: parseInt(d.impressions || 0),
    reach: parseInt(d.reach || 0),
    clicks: parseInt(d.clicks || 0),
    spend: parseFloat(d.spend || 0),
    leads: getLeads(d.actions, d.cost_per_result),
    cpl: getCPL(d.cost_per_result),
    ctr: parseFloat(d.ctr || 0),
    frequency: parseFloat(d.frequency || 0),
  }));
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

export const useDashboard = (datePreset) => {
  const [overview, setOverview] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [ov, ca, da] = await Promise.all([
        fetchOverview(datePreset),
        fetchCampaigns(datePreset),
        fetchDaily(datePreset)
      ]);

      if (ov.error) throw new Error(ov.error.message || JSON.stringify(ov.error));

      setOverview(processOverview(ov));
      setCampaigns(processCampaigns(ca));
      setDaily(processDaily(da));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [datePreset]);

  useEffect(() => {
    setLoading(true);
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { overview, campaigns, daily, loading, error, lastUpdated, refetch: fetchAll };
};
