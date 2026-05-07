import { useState } from 'react';
import { ArrowUp, ArrowDown, Layers } from 'lucide-react';
import { number, percent } from '../utils/format';
import { useI18n } from '../hooks/useI18n';
import { useCurrency } from '../hooks/useCurrency';

const COLUMN_DEFS = [
  { key: 'name',        labelKey: 'campaignName', sortable: false, align: 'left'  },
  { key: 'leads',       labelKey: 'leads',        sortable: true,  align: 'right' },
  { key: 'cpl',         labelKey: 'cpl',          sortable: true,  align: 'right' },
  { key: 'spend',       labelKey: 'spend',        sortable: true,  align: 'right' },
  { key: 'ctr',         labelKey: 'ctr',          sortable: true,  align: 'right' },
  { key: 'impressions', labelKey: 'impressions',  sortable: true,  align: 'right' },
  { key: 'frequency',   labelKey: null,           sortable: true,  align: 'right', staticLabel: 'Freq.' },
];

export default function CampaignTable({ campaigns }) {
  const { t } = useI18n();
  const { currency } = useCurrency();
  const [sortKey, setSortKey] = useState('leads');
  const [sortDir, setSortDir] = useState('desc');

  const sorted = [...campaigns].sort((a, b) => {
    const mult = sortDir === 'desc' ? -1 : 1;
    return mult * (a[sortKey] > b[sortKey] ? 1 : -1);
  });

  const handleSort = (key) => {
    if (key === sortKey) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortArrow = sortDir === 'desc' ? ArrowDown : ArrowUp;

  return (
    <div className="glass-strong">
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
        <Layers className="w-4 h-4 text-emerald" strokeWidth={2.5} />
        <h2 className="text-sm font-semibold tracking-tight">{t('campaigns')}</h2>
        <span className="ml-auto text-[10px] font-semibold text-white/40 num">
          {sorted.length} {t('campaignsCount')}
        </span>
      </div>

      <div className="overflow-x-auto scroll-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {COLUMN_DEFS.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={[
                    'px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-white/40 select-none',
                    col.align === 'right' ? 'text-right' : 'text-left',
                    col.sortable ? 'cursor-pointer hover:text-white transition' : ''
                  ].join(' ')}
                >
                  <span className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'flex-row-reverse' : ''}`}>
                    {col.staticLabel || t(col.labelKey)}
                    {col.sortable && sortKey === col.key && (
                      <SortArrow className="w-3 h-3 text-emerald" strokeWidth={3} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-white/40">
                  —
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={row.id || i}
                  className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition"
                >
                  <td className="px-5 py-3.5 text-[13px] font-medium max-w-[340px] truncate" title={row.name}>
                    {row.name}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="font-mono text-[13.5px] font-bold text-emerald">
                      {number(row.leads)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[12.5px] text-white/85">
                    {row.cpl > 0 ? currency(row.cpl) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[12.5px] text-white/85">
                    {currency(row.spend)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[12.5px] text-white/85">
                    {percent(row.ctr)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[12.5px] text-white/65">
                    {number(row.impressions)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[12.5px] text-white/65">
                    {parseFloat(row.frequency || 0).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
