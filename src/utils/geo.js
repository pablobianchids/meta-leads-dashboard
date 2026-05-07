// Coordenadas dos estados brasileiros, países e cidades da Florida para plotagem no mapa
const REGIONS = {
  // Cidades principais da Florida (para Lumina Dental)
  'Pompano Beach': [-80.0755, 26.2350],
  'Miami': [-80.1918, 25.7617],
  'Miami-Dade': [-80.1918, 25.7617],
  'Fort Lauderdale': [-80.1406, 26.1224],
  'Broward': [-80.1406, 26.1224],
  'West Palm Beach': [-80.0534, 26.7153],
  'Palm Beach': [-80.0534, 26.7153],
  'Tampa': [-82.4584, 27.9506],
  'Hillsborough': [-82.4584, 27.9506],
  'Orlando': [-81.3792, 28.5421],
  'Orange': [-81.3792, 28.5421],
  'Jacksonville': [-81.6557, 30.3322],
  'Duval': [-81.6557, 30.3322],
  'Miami Beach': [-80.1306, 25.7907],
  'Coral Gables': [-80.2734, 25.7417],
  'Boca Raton': [-80.0839, 26.3683],
  'Deerfield Beach': [-80.1266, 26.3186],
  'Sunrise': [-80.2269, 26.1650],
  'Pembroke Pines': [-80.2898, 26.0066],
  'Hollywood': [-80.1480, 26.0112],
  'Florida': [-81.5158, 27.6648],
  'US': [-95.71, 37.09],

  // Estados brasileiros (Meta retorna nomes em português)
  'Acre': [-67.8243, -8.7771],
  'Alagoas': [-36.7820, -9.5713],
  'Amapá': [-51.0664, 1.4144],
  'Amapa': [-51.0664, 1.4144],
  'Amazonas': [-65.0680, -3.4168],
  'Bahia': [-41.7007, -12.5797],
  'Ceará': [-39.5421, -5.4984],
  'Ceara': [-39.5421, -5.4984],
  'Distrito Federal': [-47.7984, -15.7998],
  'Espírito Santo': [-40.3128, -19.1834],
  'Espirito Santo': [-40.3128, -19.1834],
  'Goiás': [-49.6502, -16.0656],
  'Goias': [-49.6502, -16.0656],
  'Maranhão': [-44.3068, -5.4116],
  'Maranhao': [-44.3068, -5.4116],
  'Mato Grosso': [-55.4192, -12.6818],
  'Mato Grosso do Sul': [-54.5460, -20.7722],
  'Minas Gerais': [-44.5550, -18.5122],
  'Pará': [-52.4838, -3.4168],
  'Para': [-52.4838, -3.4168],
  'Paraíba': [-36.5520, -7.2400],
  'Paraiba': [-36.5520, -7.2400],
  'Paraná': [-51.5550, -24.5100],
  'Parana': [-51.5550, -24.5100],
  'Pernambuco': [-37.5510, -8.8137],
  'Piauí': [-42.7160, -7.7183],
  'Piaui': [-42.7160, -7.7183],
  'Rio de Janeiro': [-43.4133, -22.9099],
  'Rio Grande do Norte': [-36.5510, -5.7945],
  'Rio Grande do Sul': [-53.4140, -30.0346],
  'Rondônia': [-63.5800, -10.8290],
  'Rondonia': [-63.5800, -10.8290],
  'Roraima': [-61.4170, 1.9981],
  'Santa Catarina': [-50.2189, -27.2423],
  'São Paulo': [-46.6333, -23.5505],
  'Sao Paulo': [-46.6333, -23.5505],
  'Sergipe': [-37.0520, -10.5741],
  'Tocantins': [-48.3290, -10.1830],

  // Estados/regiões comuns no exterior
  'California': [-119.4179, 36.7783],
  'Florida': [-81.5158, 27.6648],
  'New York': [-75.4999, 43.0000],
  'Texas': [-100.0000, 31.0000],
  'Lisbon': [-9.1393, 38.7223],
  'Lisboa': [-9.1393, 38.7223],
  'Porto': [-8.6291, 41.1579],

  // Países (ISO-2) — fallback quando breakdown=region é bloqueado
  'BR': [-51.92, -14.24],
  'US': [-95.71, 37.09],
  'PT': [-8.22, 39.39],
  'AR': [-63.61, -38.41],
  'MX': [-102.55, 23.63],
  'CL': [-71.54, -35.68],
  'CO': [-74.30, 4.57],
  'PE': [-75.02, -9.19],
  'UY': [-55.77, -32.52],
  'PY': [-58.44, -23.44],
  'CA': [-106.35, 56.13],
  'GB': [-3.44, 55.38],
  'ES': [-3.75, 40.46],
  'FR': [2.21, 46.23],
  'DE': [10.45, 51.17],
  'IT': [12.57, 41.87],
  'JP': [138.25, 36.20]
};

// Aliases comuns que a Meta retorna em inglês ou com sufixos
const ALIASES = {
  'Federal District': 'Distrito Federal',
  'Rio de Janeiro (state)': 'Rio de Janeiro',
  'São Paulo (state)': 'São Paulo',
  'Acre (state)': 'Acre',
  'Pernambuco (state)': 'Pernambuco',
  'Bahia (state)': 'Bahia',
  'Amazonas (state)': 'Amazonas',
  'Ceará (state)': 'Ceará',
  'Goiás (state)': 'Goiás',
  'Maranhão (state)': 'Maranhão',
  'Pará (state)': 'Pará',
  'Paraná (state)': 'Paraná',
  'Paraíba (state)': 'Paraíba',
  'Rondônia (state)': 'Rondônia',
  'Roraima (state)': 'Roraima',
  'Sergipe (state)': 'Sergipe',
  'Tocantins (state)': 'Tocantins',
  'Alagoas (state)': 'Alagoas',
  'Amapá (state)': 'Amapá',
  'Espírito Santo (state)': 'Espírito Santo',
  'Mato Grosso (state)': 'Mato Grosso',
  'Mato Grosso do Sul (state)': 'Mato Grosso do Sul',
  'Minas Gerais (state)': 'Minas Gerais',
  'Piauí (state)': 'Piauí',
  'Rio Grande do Norte (state)': 'Rio Grande do Norte',
  'Rio Grande do Sul (state)': 'Rio Grande do Sul',
  'Santa Catarina (state)': 'Santa Catarina'
};

export const getCoords = (regionName) => {
  if (!regionName) return null;
  // Match direto
  if (REGIONS[regionName]) return REGIONS[regionName];
  // Match via alias
  const aliased = ALIASES[regionName];
  if (aliased && REGIONS[aliased]) return REGIONS[aliased];
  // Tenta sem sufixo " (state)" / " (region)"
  const stripped = regionName.replace(/\s*\((state|region|province)\)\s*$/i, '').trim();
  if (REGIONS[stripped]) return REGIONS[stripped];
  return null;
};

// Centro do Brasil para zoom inicial
export const BRAZIL_CENTER = { longitude: -51.92, latitude: -14.24, zoom: 3.6 };
