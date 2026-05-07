import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Users, DollarSign, Wallet, MousePointerClick, Eye, Target, Loader2 } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KPICard from './components/KPICard';
import InsightsCards from './components/InsightsCards';
import GeoTable from './components/GeoTable';
import CampaignTable from './components/CampaignTable';
import AdPreviews from './components/AdPreviews';

// MapChart é pesado (~1MB do maplibre-gl), lazy-load reduz o bundle inicial
const MapChart = lazy(() => import('./components/MapChart'));
import { useDashboard } from './hooks/useDashboard';
import { useAds } from './hooks/useAds';
import { useI18n } from './hooks/useI18n';
import { CurrencyProvider, useCurrency } from './hooks/useCurrency';
import { fetchClients } from './services/api';
import { number, percent } from './utils/format';

// Restaura preset/range salvos para sobreviver entre sessões
const initialDateState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('dateState') || 'null');
    if (saved?.preset) return saved;
  } catch {}
  return { preset: 'last_30d', customRange: null };
};

// Conteúdo do dashboard, separado para que possa consumir useCurrency dentro do Provider
function DashboardContent({
  datePreset, customRange, onDateChange,
  selectedClient, currentClient,
  clients, sidebarCollapsed, toggleSidebar, handleSelectClient
}) {
  const { t } = useI18n();
  const { currency } = useCurrency();

  // KPI_DEFS depende da função currency contextual — recomputado quando troca de moeda
  const KPI_DEFS = useMemo(() => [
    { titleKey: 'kpi_leads_title',       helpKey: 'kpi_leads_help',       icon: Users,             metricKind: 'higher-better', valueKey: 'leads',       format: number },
    { titleKey: 'kpi_cpl_title',         helpKey: 'kpi_cpl_help',         icon: DollarSign,        metricKind: 'lower-better',  valueKey: 'cpl',         format: (v) => v > 0 ? currency(v) : '—' },
    { titleKey: 'kpi_spend_title',       helpKey: 'kpi_spend_help',       icon: Wallet,            metricKind: 'neutral',       valueKey: 'spend',       format: currency },
    { titleKey: 'kpi_ctr_title',         helpKey: 'kpi_ctr_help',         icon: MousePointerClick, metricKind: 'higher-better', valueKey: 'ctr',         format: percent },
    { titleKey: 'kpi_impressions_title', helpKey: 'kpi_impressions_help', icon: Eye,               metricKind: 'higher-better', valueKey: 'impressions', format: number },
    { titleKey: 'kpi_reach_title',       helpKey: 'kpi_reach_help',       icon: Target,            metricKind: 'higher-better', valueKey: 'reach',       format: number }
  ], [currency]);

  const { overview, trend, campaigns, geo, loading, error, lastUpdated, refetch } = useDashboard(datePreset, selectedClient, customRange);
  const { ads, loading: adsLoading, error: adsError, rateLimited: adsRateLimited, tokenExpired: adsTokenExpired } = useAds(datePreset, selectedClient, customRange);

  const isTokenExpired = adsTokenExpired || (error && error.includes(t('tokenExpiredTitle')));

  return (
    <div className="relative min-h-screen z-10">
      <Sidebar
        clients={clients}
        selected={selectedClient}
        onSelect={handleSelectClient}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <div
        className={`max-w-[1480px] px-4 lg:px-6 pt-16 lg:pt-0 pb-12 transition-[margin] duration-300 ease-out ${
          sidebarCollapsed ? 'lg:ml-[64px]' : 'lg:ml-[240px]'
        }`}
      >
        <Header
          clientName={currentClient?.name || 'Performance'}
          datePreset={datePreset}
          customRange={customRange}
          onDateChange={onDateChange}
          lastUpdated={lastUpdated}
          loading={loading}
          onRefresh={refetch}
        />

        <main className="space-y-5">
          {isTokenExpired ? (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🔑</span>
              <div>
                <p className="font-bold mb-1">{t('tokenExpiredTitle')}</p>
                <p className="text-amber-200/80 text-[13px] leading-relaxed">{t('tokenExpiredDesc')}</p>
                <p className="text-amber-200/60 text-[12px] mt-2">
                  Cliente: <strong>{currentClient?.name || selectedClient}</strong>
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-500/8 border border-red-500/30 text-sm text-red-300">
              <strong className="font-semibold">{t('error')}</strong> {error}
            </div>
          ) : null}

          {loading && !overview ? (
            <div className="flex flex-col items-center justify-center gap-4 py-32 text-white/40">
              <Loader2 className="w-7 h-7 animate-spin text-emerald" />
              <p className="text-sm">{t('loadingMeta')}</p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {KPI_DEFS.map(def => (
                  <KPICard
                    key={def.titleKey}
                    titleKey={def.titleKey}
                    helpKey={def.helpKey}
                    icon={def.icon}
                    metricKind={def.metricKind}
                    value={overview ? def.format(overview[def.valueKey]) : null}
                    trend={trend?.[def.valueKey]}
                  />
                ))}
              </div>

              <InsightsCards overview={overview} ads={ads} />

              <div className="grid gap-4 grid-cols-1 lg:grid-cols-10">
                <div className="lg:col-span-3">
                  <Suspense fallback={
                    <div className="glass-strong rounded-3xl h-[320px] flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-white/30" />
                    </div>
                  }>
                    <MapChart regions={geo} />
                  </Suspense>
                </div>
                <div className="lg:col-span-7">
                  <AdPreviews
                    datePreset={datePreset}
                    ads={ads}
                    loading={adsLoading}
                    error={adsError}
                    rateLimited={adsRateLimited}
                    tokenExpired={adsTokenExpired}
                  />
                </div>
              </div>

              {geo && geo.length > 0 && <GeoTable regions={geo} />}

              <CampaignTable campaigns={campaigns} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [{ preset: datePreset, customRange }, setDateState] = useState(initialDateState);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(() => localStorage.getItem('selectedClient'));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === '1'
  );

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('sidebarCollapsed', next ? '1' : '0'); } catch {}
      return next;
    });
  };

  const handleDateChange = ({ preset, customRange }) => {
    const next = { preset, customRange };
    setDateState(next);
    try { localStorage.setItem('dateState', JSON.stringify(next)); } catch {}
  };

  useEffect(() => {
    fetchClients().then(d => {
      const list = d.clients || [];
      setClients(list);
      if (!selectedClient || !list.find(c => c.slug === selectedClient)) {
        const initial = d.default || list[0]?.slug;
        if (initial) {
          setSelectedClient(initial);
          localStorage.setItem('selectedClient', initial);
        }
      }
    });
  }, []);

  const handleSelectClient = (slug) => {
    setSelectedClient(slug);
    localStorage.setItem('selectedClient', slug);
  };

  const currentClient = clients.find(c => c.slug === selectedClient);
  const currencyCode = currentClient?.currency || 'USD';

  return (
    <CurrencyProvider code={currencyCode}>
      <DashboardContent
        datePreset={datePreset}
        customRange={customRange}
        onDateChange={handleDateChange}
        selectedClient={selectedClient}
        currentClient={currentClient}
        clients={clients}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        handleSelectClient={handleSelectClient}
      />
    </CurrencyProvider>
  );
}
