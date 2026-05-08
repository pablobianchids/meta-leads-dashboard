// Cliente HTTP da Clinicorp. Isola autenticação e baixo nível.
// Quando a documentação for confirmada, ajustar BASE_URL e cabeçalhos aqui.

const axios = require('axios');

// Hipótese de URL base (a confirmar na doc oficial). Sobrescrevível via env.
const DEFAULT_BASE = process.env.CLINICORP_BASE_URL || 'https://api.clinicorp.com.br/v1';

/**
 * Faz uma chamada autenticada à Clinicorp.
 * @param {Object} client - { user, token } do CLINICORP_* do env
 * @param {string} path - rota relativa (ex: '/appointments')
 * @param {Object} params - querystring
 */
async function callClinicorp(client, path, params = {}) {
  if (!client?.user || !client?.token) {
    throw new Error('Clinicorp credentials missing');
  }
  // Hipótese: Basic Auth com user:token. Confirmar na doc.
  const auth = Buffer.from(`${client.user}:${client.token}`).toString('base64');
  const url = `${DEFAULT_BASE}${path}`;
  const { data } = await axios.get(url, {
    params,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    },
    timeout: 15000
  });
  return data;
}

module.exports = { callClinicorp, DEFAULT_BASE };
