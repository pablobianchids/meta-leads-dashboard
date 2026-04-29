import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { shortDate, currency } from '../utils/format';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-date">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.dataKey === 'spend' ? currency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function LeadsChart({ data }) {
  const formatted = data.map(d => ({ ...d, date: shortDate(d.date) }));

  if (!formatted.length) {
    return (
      <div className="chart-card">
        <h2 className="card-title">Leads e Investimento por Dia</h2>
        <div className="empty-chart">Sem dados para o período selecionado</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h2 className="card-title">Leads e Investimento por Dia</h2>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
          <XAxis dataKey="date" tick={{ fill: '#8892b0', fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fill: '#8892b0', fontSize: 12 }} allowDecimals={false} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#8892b0', fontSize: 12 }}
            tickFormatter={v => `R$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: '#8892b0', fontSize: 13, paddingTop: 12 }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="leads"
            name="Leads"
            fill="#1877F220"
            stroke="#1877F2"
            strokeWidth={2}
            dot={{ fill: '#1877F2', r: 3 }}
          />
          <Bar
            yAxisId="right"
            dataKey="spend"
            name="Gasto (R$)"
            fill="#ffb30030"
            stroke="#ffb300"
            strokeWidth={1}
            radius={[2, 2, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
