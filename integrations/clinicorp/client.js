// Cliente HTTP da Clinicorp.
//
// API REST documentada em https://sistema.clinicorp.com/api-docs/
// Servidor: https://api.clinicorp.com/rest/v1
// Auth: HTTP Basic com (Usuário API, Token API).
// Todas as rotas exigem o param `subscriber_id` (slug da assinatura).

const axios = require('axios');

const BASE_URL = process.env.CLINICORP_BASE_URL || 'https://api.clinicorp.com/rest/v1';

/**
 * Faz uma chamada GET autenticada à Clinicorp.
 * @param {Object} cfg - { user, token, subscriberId } vindo do env do cliente
 * @param {string} path - rota relativa (ex: '/appointment/list')
 * @param {Object} params - querystring extra
 */
async function callClinicorp(cfg, path, params = {}) {
  if (!cfg?.user || !cfg?.token || !cfg?.subscriberId) {
    throw new Error('Clinicorp credentials missing (user/token/subscriberId)');
  }
  const auth = Buffer.from(`${cfg.user}:${cfg.token}`).toString('base64');
  const url = `${BASE_URL}${path}`;
  const { data } = await axios.get(url, {
    params: { subscriber_id: cfg.subscriberId, ...params },
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    },
    timeout: 20000
  });
  return data;
}

module.exports = { callClinicorp, BASE_URL };
