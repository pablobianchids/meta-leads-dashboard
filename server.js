const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = 'v19.0';
const BASE = `https://graph.facebook.com/${API_VERSION}`;

// Carrega configs de todos os clientes em clients/*.env
const CLIENTS_DIR = path.resolve(__dirname, 'clients');
const CLIENTS = {};

if (fs.existsSync(CLIENTS_DIR)) {
  fs.readdirSync(CLIENTS_DIR)
    .filter(f => f.endsWith('.env') && f !== 'example.env')
    .forEach(file => {
      const slug = file.replace('.env', '');
      const parsed = dotenv.parse(fs.readFileSync(path.join(CLIENTS_DIR, file)));
      const token = parsed.META_ACCESS_TOKEN;
      const account = parsed.META_AD_ACCOUNT_ID;
      // Ignora templates: tokens válidos começam com "EAA" e account ID é numérico
      // Tokens da Meta começam com EA (EAA legacy, EAG/outros formatos)
      const isValidToken = token && token.startsWith('EA') && token.length > 50;
      const isValidAccount = account && /^\d+$/.test(account);
      if (isValidToken && isValidAccount) {
        CLIENTS[slug] = {
          slug,
          name: parsed.CLIENT_NAME || slug,
          token,
          account,
          currency: (parsed.CURRENCY || 'USD').toUpperCase()
        };
      }
    });
}

const DEFAULT_CLIENT = Object.keys(CLIENTS)[0];
console.log(`Clientes carregados: ${Object.keys(CLIENTS).join(', ') || 'nenhum'}`);

// Resolve qual cliente usar (?client=slug, fallback para default)
const resolveClient = (req) => {
  const slug = req.query.client || DEFAULT_CLIENT;
  return CLIENTS[slug] || null;
};

// Cache em memória: TTL de 5 minutos por (cliente, endpoint, params)
const CACHE_TTL_MS = 5 * 60 * 1000;
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

const isRateLimit = (err) => {
  const code = err.response?.data?.error?.code;
  return [17, 4, 32, 613].includes(code) ||
         err.response?.data?.error?.message?.toLowerCase().includes('limit');
};

// Token expirado/inválido (códigos 190, 102, 463 da Meta)
const isTokenError = (err) => {
  const code = err.response?.data?.error?.code;
  const msg = err.response?.data?.error?.message?.toLowerCase() || '';
  return [190, 102, 463].includes(code) ||
         msg.includes('expired') ||
         msg.includes('access token');
};

const errorResponse = (err) => {
  if (isRateLimit(err)) {
    return { status: 429, body: { error: { message: 'Rate limit', rateLimited: true } } };
  }
  if (isTokenError(err)) {
    return {
      status: 401,
      body: {
        error: {
          message: err.response?.data?.error?.message || 'Token inválido ou expirado',
          tokenExpired: true
        }
      }
    };
  }
  return {
    status: 500,
    body: { error: err.response?.data?.error || err.message }
  };
};

app.use(cors());
app.use(express.json());

const INSIGHT_FIELDS = [
  'impressions', 'reach', 'clicks', 'spend', 'actions',
  'cost_per_action_type', 'cost_per_result', 'ctr', 'cpc', 'frequency'
].join(',');

const fmtDate = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

function getPreviousRange(datePreset) {
  const today = new Date();
  switch (datePreset) {
    case 'today': {
      const y = addDays(today, -1);
      return { since: fmtDate(y), until: fmtDate(y) };
    }
    case 'yesterday': {
      const y = addDays(today, -2);
      return { since: fmtDate(y), until: fmtDate(y) };
    }
    case 'last_7d':
      return { since: fmtDate(addDays(today, -14)), until: fmtDate(addDays(today, -8)) };
    case 'last_30d':
      return { since: fmtDate(addDays(today, -60)), until: fmtDate(addDays(today, -31)) };
    case 'this_month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { since: fmtDate(start), until: fmtDate(end) };
    }
    case 'last_month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      const end = new Date(today.getFullYear(), today.getMonth() - 1, 0);
      return { since: fmtDate(start), until: fmtDate(end) };
    }
    default:
      return { since: fmtDate(addDays(today, -60)), until: fmtDate(addDays(today, -31)) };
  }
}

// Para um range custom {since, until}, retorna o intervalo anterior de
// mesma duração (ex: 7d atual → 7d anteriores ao primeiro dia do range).
function getPreviousFromRange(since, until) {
  const start = new Date(since);
  const end = new Date(until);
  const days = Math.round((end - start) / (24 * 3600 * 1000));
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -days);
  return { since: fmtDate(prevStart), until: fmtDate(prevEnd) };
}

// Helpers para gerar params da Meta API a partir da query do dashboard.
// Aceita {date_preset} OU {since, until} (custom range tem prioridade).
function buildDateParams(query) {
  const { date_preset, since, until } = query;
  if (since && until) return { time_range: JSON.stringify({ since, until }) };
  return { date_preset: date_preset || 'last_30d' };
}

function buildPreviousRange(query) {
  const { date_preset, since, until } = query;
  if (since && until) return getPreviousFromRange(since, until);
  return getPreviousRange(date_preset || 'last_30d');
}

function dateCacheKey(query) {
  const { date_preset, since, until } = query;
  if (since && until) return `range:${since}_${until}`;
  return `preset:${date_preset || 'last_30d'}`;
}

// Lista de clientes disponíveis (para o sidebar)
app.get('/api/clients', (req, res) => {
  const list = Object.values(CLIENTS).map(c => ({ slug: c.slug, name: c.name, currency: c.currency }));
  res.json({ clients: list, default: DEFAULT_CLIENT });
});

app.get('/api/health', (req, res) => {
  const client = resolveClient(req);
  res.json({
    status: 'ok',
    configured: !!client,
    clientName: client?.name || 'Meta Leads Dashboard',
    clientSlug: client?.slug || null,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/overview', async (req, res) => {
  const client = resolveClient(req);
  if (!client) return res.status(400).json({ error: { message: 'Cliente não encontrado' } });

  const cacheKey = `${client.slug}:overview:${dateCacheKey(req.query)}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ ...cached, _cached: true });

  try {
    const previous = buildPreviousRange(req.query);
    const dateParams = buildDateParams(req.query);
    const [current, prior] = await Promise.all([
      axios.get(`${BASE}/act_${client.account}/insights`, {
        params: { access_token: client.token, fields: INSIGHT_FIELDS, level: 'account', ...dateParams }
      }),
      axios.get(`${BASE}/act_${client.account}/insights`, {
        params: {
          access_token: client.token,
          fields: INSIGHT_FIELDS,
          time_range: JSON.stringify(previous),
          level: 'account'
        }
      })
    ]);
    const result = { current: current.data, previous: prior.data };
    setCached(cacheKey, result);
    res.json(result);
  } catch (err) {
    const { status, body } = errorResponse(err);
    res.status(status).json(body);
  }
});

app.get('/api/geo', async (req, res) => {
  const client = resolveClient(req);
  if (!client) return res.status(400).json({ error: { message: 'Cliente não encontrado' } });

  const cacheKey = `${client.slug}:geo:${dateCacheKey(req.query)}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ ...cached, _cached: true });

  const fields = 'spend,impressions,clicks,actions,cost_per_result';
  const dateParams = buildDateParams(req.query);

  const tryBreakdown = async (breakdown) => {
    const { data } = await axios.get(`${BASE}/act_${client.account}/insights`, {
      params: { access_token: client.token, fields, breakdowns: breakdown, level: 'account', limit: 200, ...dateParams }
    });
    return data;
  };

  try {
    const data = await tryBreakdown('region');
    const result = { ...data, breakdown: 'region' };
    setCached(cacheKey, result);
    return res.json(result);
  } catch (err) {
    if (isTokenError(err)) {
      return res.status(401).json({
        error: { message: err.response?.data?.error?.message || 'Token inválido', tokenExpired: true },
        data: []
      });
    }
    if (isRateLimit(err)) {
      return res.status(429).json({
        error: { message: 'Rate limit', rateLimited: true },
        data: []
      });
    }
    try {
      const data = await tryBreakdown('country');
      data.data = (data.data || []).map(d => ({ ...d, region: d.country }));
      const result = { ...data, breakdown: 'country' };
      setCached(cacheKey, result);
      return res.json(result);
    } catch (err2) {
      const result = { data: [], breakdown: 'none', warning: err.response?.data?.error?.message || err.message };
      setCached(cacheKey, result);
      return res.status(200).json(result);
    }
  }
});

app.get('/api/campaigns', async (req, res) => {
  const client = resolveClient(req);
  if (!client) return res.status(400).json({ error: { message: 'Cliente não encontrado' } });

  const cacheKey = `${client.slug}:campaigns:${dateCacheKey(req.query)}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ ...cached, _cached: true });

  try {
    const { data } = await axios.get(`${BASE}/act_${client.account}/insights`, {
      params: {
        access_token: client.token,
        fields: `campaign_name,campaign_id,${INSIGHT_FIELDS}`,
        level: 'campaign',
        limit: 50,
        ...buildDateParams(req.query)
      }
    });
    setCached(cacheKey, data);
    res.json(data);
  } catch (err) {
    const { status, body } = errorResponse(err);
    res.status(status).json(body);
  }
});

app.get('/api/daily', async (req, res) => {
  const client = resolveClient(req);
  if (!client) return res.status(400).json({ error: { message: 'Cliente não encontrado' } });

  const cacheKey = `${client.slug}:daily:${dateCacheKey(req.query)}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ ...cached, _cached: true });

  try {
    const { data } = await axios.get(`${BASE}/act_${client.account}/insights`, {
      params: {
        access_token: client.token,
        fields: `${INSIGHT_FIELDS},date_start`,
        level: 'account',
        time_increment: 1,
        ...buildDateParams(req.query)
      }
    });
    setCached(cacheKey, data);
    res.json(data);
  } catch (err) {
    const { status, body } = errorResponse(err);
    res.status(status).json(body);
  }
});

// Extrai uma lista compacta de localizações a partir de targeting.geo_locations
// Retorna um array de strings (ex: ['Miami', 'Pompano Beach']) ou [].
function extractLocations(geoLocations) {
  if (!geoLocations) return [];
  const out = [];
  if (Array.isArray(geoLocations.cities)) {
    for (const c of geoLocations.cities) out.push(c.name);
  }
  if (Array.isArray(geoLocations.regions)) {
    for (const r of geoLocations.regions) out.push(r.name);
  }
  if (Array.isArray(geoLocations.custom_locations)) {
    for (const cl of geoLocations.custom_locations) {
      if (cl.name) out.push(cl.name.split(',')[0]); // pega só a parte antes da vírgula
    }
  }
  if (Array.isArray(geoLocations.countries)) {
    for (const code of geoLocations.countries) out.push(code);
  }
  if (Array.isArray(geoLocations.zips)) {
    for (const z of geoLocations.zips) out.push(z.name || z.key);
  }
  // Dedup
  return [...new Set(out.filter(Boolean))];
}

app.get('/api/ads', async (req, res) => {
  const client = resolveClient(req);
  if (!client) return res.status(400).json({ error: { message: 'Cliente não encontrado' } });

  const cacheKey = `${client.slug}:ads:${dateCacheKey(req.query)}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ ...cached, _cached: true });

  try {
    const [adsData, insightsData] = await Promise.all([
      axios.get(`${BASE}/act_${client.account}/ads`, {
        params: {
          access_token: client.token,
          effective_status: JSON.stringify(['ACTIVE', 'PAUSED']),
          fields: 'id,name,status,effective_status,adset_id,adset_name,campaign_name,adset{targeting}',
          limit: 15
        }
      }),
      axios.get(`${BASE}/act_${client.account}/insights`, {
        params: {
          access_token: client.token,
          fields: `ad_id,impressions,reach,clicks,spend,actions,cost_per_result,ctr,frequency`,
          level: 'ad',
          ...buildDateParams(req.query)
        }
      })
    ]);

    const ads = adsData.data.data || [];

    const insightsMap = {};
    for (const item of insightsData.data.data || []) {
      insightsMap[item.ad_id] = item;
    }

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    const withData = [];
    for (const ad of ads) {
      let preview = null;
      try {
        const { data: prev } = await axios.get(`${BASE}/${ad.id}/previews`, {
          params: { access_token: client.token, ad_format: 'MOBILE_FEED_STANDARD' }
        });
        preview = prev.data?.[0]?.body || null;
      } catch (e) {
        if (isRateLimit(e)) break;
      }

      const locations = extractLocations(ad.adset?.targeting?.geo_locations);

      withData.push({
        id: ad.id,
        name: ad.name,
        status: ad.status || null,
        effective_status: ad.effective_status || null,
        adset_id: ad.adset_id,
        adset_name: ad.adset_name,
        campaign_name: ad.campaign_name,
        locations,
        preview,
        insights: insightsMap[ad.id] || null
      });
      await sleep(500);
    }

    const result = { data: withData };
    setCached(cacheKey, result);
    res.json(result);
  } catch (err) {
    if (isRateLimit(err)) {
      const stale = cache.get(cacheKey);
      if (stale) return res.json({ ...stale.data, _cached: true, _stale: true });
    }
    const { status, body } = errorResponse(err);
    res.status(status).json(body);
  }
});

// Em produção, servir o build estático do Vite
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    const vitePort = process.env.PORT === '3001' ? 5173 :
                     process.env.PORT === '3002' ? 5174 :
                     process.env.PORT === '3003' ? 5175 : 5000;
    return res.redirect(`http://localhost:${vitePort}`);
  });
}

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
  if (Object.keys(CLIENTS).length === 0) {
    console.warn('AVISO: Nenhum cliente configurado em clients/*.env');
  }
});
