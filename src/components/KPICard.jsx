export default function KPICard({ title, value, subtitle, color, icon }) {
  return (
    <div className="kpi-card" style={{ '--accent': color }}>
      <div className="kpi-card__header">
        <span className="kpi-card__icon">{icon}</span>
        <span className="kpi-card__title">{title}</span>
      </div>
      <div className="kpi-card__value">{value ?? '—'}</div>
      {subtitle && <div className="kpi-card__subtitle">{subtitle}</div>}
    </div>
  );
}
