import { useState } from 'react';
import { currency, number, percent } from '../utils/format';

const COLUMNS = [
  { key: 'name', label: 'Campanha', sortable: false },
  { key: 'leads', label: 'Leads', sortable: true },
  { key: 'cpl', label: 'CPL', sortable: true },
  { key: 'spend', label: 'Gasto', sortable: true },
  { key: 'ctr', label: 'CTR', sortable: true },
  { key: 'impressions', label: 'Impressões', sortable: true },
  { key: 'frequency', label: 'Freq.', sortable: true },
];

export default function CampaignTable({ campaigns }) {
  const [sortKey, setSortKey] = useState('leads');
  const [sortDir, setSortDir] = useState('desc');

  const sorted = [...campaigns].sort((a, b) => {
    const mult = sortDir === 'desc' ? -1 : 1;
    return mult * (a[sortKey] > b[sortKey] ? 1 : -1);
  });

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <div className="table-card">
      <h2 className="card-title">Performance por Campanha</h2>
      <div className="table-wrapper">
        <table className="campaign-table">
          <thead>
            <tr>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className={col.sortable ? 'sortable' : ''}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className="sort-arrow">{sortDir === 'desc' ? ' ↓' : ' ↑'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-row">Nenhuma campanha encontrada</td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr key={row.id || i}>
                  <td className="campaign-name" title={row.name}>{row.name}</td>
                  <td className="metric-leads">{number(row.leads)}</td>
                  <td>{row.cpl > 0 ? currency(row.cpl) : '—'}</td>
                  <td>{currency(row.spend)}</td>
                  <td>{percent(row.ctr)}</td>
                  <td>{number(row.impressions)}</td>
                  <td>{parseFloat(row.frequency || 0).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
