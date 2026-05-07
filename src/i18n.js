export const TRANSLATIONS = {
  pt: {
    // Header
    performanceDashboard: 'Performance Dashboard',
    updatedAt: 'Atualizado às',
    refresh: 'Atualizar',
    language: 'Idioma',

    // Date presets
    today: 'Hoje',
    yesterday: 'Ontem',
    last_7d: 'Últimos 7 dias',
    last_30d: 'Últimos 30 dias',
    this_week_mon_sun: 'Esta semana',
    last_week_mon_sun: 'Semana passada',
    this_month: 'Este mês',
    last_month: 'Mês passado',
    this_quarter: 'Este trimestre',
    this_year: 'Este ano',
    customRange: 'Período personalizado',
    selectRange: 'Selecione um período',
    apply: 'Aplicar',
    cancel: 'Cancelar',
    quickRanges: 'Atalhos rápidos',
    pickStart: 'Selecione a data inicial',
    pickEnd: 'Selecione a data final',

    // Sidebar
    clients: 'Clientes',
    clientsActive: 'cliente ativo',
    clientsActivePlural: 'clientes ativos',

    // KPI titles (curtos!)
    kpi_leads_title: 'Leads',
    kpi_cpl_title: 'CPL',
    kpi_spend_title: 'Investimento',
    kpi_ctr_title: 'CTR',
    kpi_impressions_title: 'Impressões',
    kpi_reach_title: 'Alcance',

    // KPI tooltips
    kpi_leads_help: 'Número total de contatos ou oportunidades geradas no período. Analise junto ao CPL e à qualidade dos leads.',
    kpi_cpl_help: 'Custo por Lead. Valor médio investido para gerar cada lead. Quanto menor, melhor — desde que a qualidade continue boa.',
    kpi_spend_help: 'Investimento total em anúncios no período. Aumento só é positivo se vier acompanhado de crescimento proporcional em leads ou CPL.',
    kpi_ctr_help: 'Taxa de cliques sobre impressões. Indica o quanto o criativo está chamando atenção do público.',
    kpi_impressions_help: 'Número total de vezes que os anúncios foram exibidos. Uma mesma pessoa pode ver mais de uma vez.',
    kpi_reach_help: 'Estimativa de pessoas únicas impactadas pelos anúncios no período.',

    // Trend
    vsPreviousPeriod: 'vs. período anterior',
    noPreviousData: 'Sem base anterior',
    new: 'Novo',
    noChange: 'Sem variação',
    highGrowth: 'Crescimento alto',
    highDrop: 'Queda acentuada',

    // Map / Geo
    geographicCoverage: 'Cobertura Geográfica',
    geoUnavailable: 'Dados geográficos indisponíveis',
    leads: 'Leads',
    spend: 'Investimento',
    cpl: 'CPL',
    location: 'Localização',
    locationsByPerformance: 'Performance por Localização',

    // Top Ads
    topPerformingAds: 'Top Performing Ads',
    active: 'ATIVOS',
    loadingAds: 'Carregando criativos...',
    noActiveAds: 'Nenhum criativo ativo',
    noResultsAds: 'Nenhum anúncio corresponde aos filtros',
    rateLimitTitle: '⏱ Limite da Meta API atingido',
    rateLimitDesc: 'Aguarde ~5 minutos. O sistema fará retry automaticamente.',
    locationUnavailable: 'Localização indisponível',
    multipleLocations: 'Múltiplas localizações',
    ctr: 'CTR',
    frequency: 'Freq.',
    status: 'Status',
    campaign: 'Campanha',
    adset: 'Conjunto',
    performance: 'Performance',
    perf_good: 'Excelente',
    perf_watch: 'Acompanhar',
    perf_critical: 'Atenção',
    status_active: 'Ativo',
    status_paused: 'Pausado',
    status_disabled: 'Desativado',
    status_unknown: '—',

    // Filtros
    searchAds: 'Buscar anúncio...',
    sortBy: 'Ordenar',
    sort_leads: 'Mais leads',
    sort_cpl: 'Menor CPL',
    sort_ctr: 'Maior CTR',
    sort_spend: 'Maior investimento',
    filterLocation: 'Localização',
    filterStatus: 'Status',
    allLocations: 'Todas',
    allStatuses: 'Todos',
    clearFilters: 'Limpar filtros',

    // Detail drawer
    closeDetails: 'Fechar',
    fullMetrics: 'Métricas completas',
    period: 'Período',
    recommendation: 'Recomendação',
    rec_scaleUp: 'Escalar este anúncio. Boa performance e custo por lead saudável.',
    rec_optimize: 'Acompanhar de perto. Performance dentro da média do conjunto.',
    rec_pauseOrFix: 'Avaliar pausa ou nova versão criativa. CPL acima do esperado.',
    rec_lowVolume: 'Volume baixo. Considere aumentar investimento se a qualidade dos leads for boa.',
    impressions: 'Impressões',
    reach: 'Alcance',
    clicks: 'Cliques',

    // Insights
    insightsTitle: 'Insights automáticos',
    insight_summary_title: 'Resumo do período',
    insight_summary_desc: '{leads} leads gerados, CPL médio de {cpl}, com investimento total de {spend}.',
    insight_topAd_title: 'Melhor anúncio',
    insight_topAd_desc: '{name} liderou com {leads} leads e CPL de {cpl}.',
    insight_topAd_empty: 'Sem anúncios ativos no período.',
    insight_alert_title: 'Principal alerta',
    insight_alert_freq: 'Frequência alta em {name} ({freq}x). Risco de saturação do público.',
    insight_alert_cpl: '{name} com CPL {cpl}, acima da média ({avg}). Avaliar criativo ou segmentação.',
    insight_alert_none: 'Nenhum alerta crítico no momento.',
    insight_opp_title: 'Oportunidade',
    insight_opp_ctr: '{name} tem CTR alto ({ctr}) com pouco investimento. Considere escalar.',
    insight_opp_none: 'Sem oportunidades evidentes para destacar agora.',

    // Campaigns table
    campaigns: 'Performance por Campanha',
    campaignsCount: 'campanhas',
    campaignName: 'Campanha',

    // Loading / Errors
    loadingMeta: 'Carregando dados da Meta API...',
    error: 'Erro:',
    rateLimitWarning: '⏱ Meta API atingiu limite. Tentando novamente em 5 min.',
    noData: 'Sem dados',
    tokenExpiredTitle: '🔑 Token expirado',
    tokenExpiredDesc: 'O token de acesso à Meta API deste cliente expirou. Gere um novo token e atualize a configuração.'
  },
  en: {
    // Header
    performanceDashboard: 'Performance Dashboard',
    updatedAt: 'Updated at',
    refresh: 'Refresh',
    language: 'Language',

    // Date presets
    today: 'Today',
    yesterday: 'Yesterday',
    last_7d: 'Last 7 days',
    last_30d: 'Last 30 days',
    this_week_mon_sun: 'This week',
    last_week_mon_sun: 'Last week',
    this_month: 'This month',
    last_month: 'Last month',
    this_quarter: 'This quarter',
    this_year: 'This year',
    customRange: 'Custom range',
    selectRange: 'Select a date range',
    apply: 'Apply',
    cancel: 'Cancel',
    quickRanges: 'Quick ranges',
    pickStart: 'Pick start date',
    pickEnd: 'Pick end date',

    // Sidebar
    clients: 'Clients',
    clientsActive: 'active client',
    clientsActivePlural: 'active clients',

    // KPI titles (short!)
    kpi_leads_title: 'Leads',
    kpi_cpl_title: 'CPL',
    kpi_spend_title: 'Spend',
    kpi_ctr_title: 'CTR',
    kpi_impressions_title: 'Impressions',
    kpi_reach_title: 'Reach',

    // KPI tooltips
    kpi_leads_help: 'Total number of contacts or opportunities generated in the period. Analyze alongside CPL and lead quality.',
    kpi_cpl_help: 'Cost per Lead. Average amount invested to generate each lead. Lower is better — as long as quality stays high.',
    kpi_spend_help: 'Total amount invested in ads during the period. Increase is only positive if accompanied by proportional growth in leads or CPL.',
    kpi_ctr_help: 'Click-through rate over impressions. Indicates how well the creative is catching the audience attention.',
    kpi_impressions_help: 'Total number of times ads were displayed. The same person may see them multiple times.',
    kpi_reach_help: 'Estimated unique people reached by the ads during the period.',

    // Trend
    vsPreviousPeriod: 'vs. previous period',
    noPreviousData: 'No previous data',
    new: 'New',
    noChange: 'No change',
    highGrowth: 'High growth',
    highDrop: 'Sharp drop',

    // Map / Geo
    geographicCoverage: 'Geographic Coverage',
    geoUnavailable: 'Geographic data unavailable',
    leads: 'Leads',
    spend: 'Spend',
    cpl: 'CPL',
    location: 'Location',
    locationsByPerformance: 'Performance by Location',

    // Top Ads
    topPerformingAds: 'Top Performing Ads',
    active: 'ACTIVE',
    loadingAds: 'Loading creatives...',
    noActiveAds: 'No active creatives',
    noResultsAds: 'No ads match the filters',
    rateLimitTitle: '⏱ Meta API rate limit reached',
    rateLimitDesc: 'Wait ~5 minutes. The system will retry automatically.',
    locationUnavailable: 'Location unavailable',
    multipleLocations: 'Multiple locations',
    ctr: 'CTR',
    frequency: 'Freq.',
    status: 'Status',
    campaign: 'Campaign',
    adset: 'Ad set',
    performance: 'Performance',
    perf_good: 'Good',
    perf_watch: 'Watch',
    perf_critical: 'Critical',
    status_active: 'Active',
    status_paused: 'Paused',
    status_disabled: 'Disabled',
    status_unknown: '—',

    // Filters
    searchAds: 'Search ad...',
    sortBy: 'Sort by',
    sort_leads: 'Most leads',
    sort_cpl: 'Lowest CPL',
    sort_ctr: 'Highest CTR',
    sort_spend: 'Highest spend',
    filterLocation: 'Location',
    filterStatus: 'Status',
    allLocations: 'All',
    allStatuses: 'All',
    clearFilters: 'Clear filters',

    // Detail drawer
    closeDetails: 'Close',
    fullMetrics: 'Full metrics',
    period: 'Period',
    recommendation: 'Recommendation',
    rec_scaleUp: 'Scale this ad. Good performance and healthy CPL.',
    rec_optimize: 'Watch closely. Performance within set average.',
    rec_pauseOrFix: 'Consider pausing or trying a new creative. CPL above expected range.',
    rec_lowVolume: 'Low volume. Consider increasing spend if lead quality is good.',
    impressions: 'Impressions',
    reach: 'Reach',
    clicks: 'Clicks',

    // Insights
    insightsTitle: 'Automated insights',
    insight_summary_title: 'Period summary',
    insight_summary_desc: '{leads} leads generated at an average CPL of {cpl}, with total spend of {spend}.',
    insight_topAd_title: 'Best ad',
    insight_topAd_desc: '{name} led with {leads} leads at {cpl} CPL.',
    insight_topAd_empty: 'No active ads in period.',
    insight_alert_title: 'Top alert',
    insight_alert_freq: 'High frequency on {name} ({freq}x). Audience saturation risk.',
    insight_alert_cpl: '{name} CPL {cpl} above average ({avg}). Review creative or targeting.',
    insight_alert_none: 'No critical alerts at the moment.',
    insight_opp_title: 'Opportunity',
    insight_opp_ctr: '{name} shows high CTR ({ctr}) with low spend. Consider scaling.',
    insight_opp_none: 'No clear opportunities to highlight right now.',

    // Campaigns table
    campaigns: 'Campaign Performance',
    campaignsCount: 'campaigns',
    campaignName: 'Campaign',

    // Loading / Errors
    loadingMeta: 'Loading data from Meta API...',
    error: 'Error:',
    rateLimitWarning: '⏱ Meta API rate limit reached. Retrying in 5 min.',
    noData: 'No data',
    tokenExpiredTitle: '🔑 Token expired',
    tokenExpiredDesc: 'This client\'s Meta API access token has expired. Generate a new token and update the configuration.'
  }
};

export const DEFAULT_LANG = 'pt';

export const getInitialLang = () => {
  if (typeof localStorage === 'undefined') return DEFAULT_LANG;
  const saved = localStorage.getItem('dashboardLang');
  return TRANSLATIONS[saved] ? saved : DEFAULT_LANG;
};

// Substituição simples de placeholders {key} em uma string traduzida
export const interpolate = (str, vars = {}) => {
  if (typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
};
