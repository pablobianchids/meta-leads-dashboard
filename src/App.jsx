import { useState } from 'react';
import Header from './components/Header';
import KPICard from './components/KPICard';
import LeadsChart from './components/LeadsChart';
import CampaignTable from './components/CampaignTable';
import { useDashboard } from './hooks/useDashboard';
import { currency, number, percent } from './utils/format';

const buildKPIs = (ov) => [
  {
    title: 'Leads Gerados',
    value: number(ov?.leads),
    subtitle: 'Total no período',
    color: '#1877F2',
    icon: '👤'
  },
  {
    title: 'Custo por Lead',
    value: ov?.cpl > 0 ? currency(ov.cpl) : '—',
    subtitle: 'CPL médio',
    color: '#00c853',
    icon: '💰'
  },
  {
    title: 'Gasto Total',
    value: currency(ov?.spend),
    subtitle: 'Investimento no período',
    color: '#ffb300',
    icon: '📊'
  },
  {
    title: 'CTR',
    value: percent(ov?.ctr),
    subtitle: 'Taxa de clique',
    color: '#7c4dff',
    icon: '🖱️'
  },
  {
    title: 'Impressões',
    value: number(ov?.impressions),
    subtitle: 'Total de exibições',
    color: '#00bcd4',
    icon: '👁️'
  },
  {
    title: 'Alcance',
    value: number(ov?.reach),
    subtitle: 'Pessoas únicas impactadas',
    color: '#ff6b6b',
    icon: '📡'
  },
];

export default function App() {
  const [datePreset, setDatePreset] = useState('last_30d');
  const { overview, campaigns, daily, loading, error, lastUpdated, refetch } = useDashboard(datePreset);

  return (
    <div className="app">
      <Header
        datePreset={datePreset}
        onDateChange={setDatePreset}
        lastUpdated={lastUpdated}
        loading={loading}
        onRefresh={refetch}
      />

      <main className="dashboard">
        {error && (
          <div className="error-banner">
            <strong>Erro ao carregar dados:</strong> {error}
          </div>
        )}

        {loading && !overview ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Carregando dados da Meta API...</p>
          </div>
        ) : (
          <>
            <div className="kpi-grid">
              {buildKPIs(overview).map(kpi => (
                <KPICard key={kpi.title} {...kpi} />
              ))}
            </div>

            <LeadsChart data={daily} />

            <CampaignTable campaigns={campaigns} />
          </>
        )}
      </main>
    </div>
  );
}
