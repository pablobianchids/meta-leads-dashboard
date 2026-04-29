require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = 'v19.0';
const BASE = `https://graph.facebook.com/${API_VERSION}`;
const TOKEN = process.env.META_ACCESS_TOKEN;
const ACCOUNT = process.env.META_AD_ACCOUNT_ID;

app.use(cors());
app.use(express.json());

const INSIGHT_FIELDS = [
  'impressions',
  'reach',
  'clicks',
  'spend',
  'actions',
  'cost_per_action_type',
  'cost_per_result',
  'ctr',
  'cpc',
  'frequency'
].join(',');

app.get('/api/overview', async (req, res) => {
  const { date_preset = 'last_30d' } = req.query;
  try {
    const { data } = await axios.get(`${BASE}/act_${ACCOUNT}/insights`, {
      params: {
        access_token: TOKEN,
        fields: INSIGHT_FIELDS,
        date_preset,
        level: 'account'
      }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error || err.message });
  }
});

app.get('/api/campaigns', async (req, res) => {
  const { date_preset = 'last_30d' } = req.query;
  try {
    const { data } = await axios.get(`${BASE}/act_${ACCOUNT}/insights`, {
      params: {
        access_token: TOKEN,
        fields: `campaign_name,campaign_id,${INSIGHT_FIELDS}`,
        date_preset,
        level: 'campaign',
        limit: 50
      }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error || err.message });
  }
});

app.get('/api/daily', async (req, res) => {
  const { date_preset = 'last_30d' } = req.query;
  try {
    const { data } = await axios.get(`${BASE}/act_${ACCOUNT}/insights`, {
      params: {
        access_token: TOKEN,
        fields: `${INSIGHT_FIELDS},date_start`,
        date_preset,
        level: 'account',
        time_increment: 1
      }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error || err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    configured: !!(TOKEN && ACCOUNT),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
  if (!TOKEN || !ACCOUNT) {
    console.warn('AVISO: META_ACCESS_TOKEN ou META_AD_ACCOUNT_ID não configurados no .env');
  }
});
