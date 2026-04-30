const DATE_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'last_7d', label: 'Últimos 7 dias' },
  { value: 'last_30d', label: 'Últimos 30 dias' },
  { value: 'this_month', label: 'Este mês' },
  { value: 'last_month', label: 'Mês anterior' },
];

export default function Header({ clientName, datePreset, onDateChange, lastUpdated, loading, onRefresh }) {
  const formatTime = (d) =>
    d?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="header-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#1877F2" />
            <path
              d="M17.5 9h-3C12.6 9 11 10.6 11 12.5V14H9v3h2v8h3v-8h2.5l.5-3H14v-1.5c0-.6.4-1 1-1h2V9h-.5z"
              fill="white"
            />
          </svg>
          <div>
            <h1>{clientName}</h1>
            <p>Geração de Leads em tempo real</p>
          </div>
        </div>
      </div>

      <div className="header-right">
        <select
          className="date-select"
          value={datePreset}
          onChange={e => onDateChange(e.target.value)}
        >
          {DATE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div className="header-status">
          {lastUpdated && (
            <span className="last-updated">
              Atualizado às {formatTime(lastUpdated)}
            </span>
          )}
          <button
            className={`refresh-btn${loading ? ' loading' : ''}`}
            onClick={onRefresh}
            disabled={loading}
            title="Atualizar agora"
          >
            ↻
          </button>
        </div>
      </div>
    </header>
  );
}
