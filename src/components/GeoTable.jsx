import { useState, useMemo } from 'react';
import { MapPin, ArrowDown, ArrowUp, Globe2 } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { useCurrency } from '../hooks/useCurrency';
import { number, percent } from '../utils/format';

const COLUMN_DEFS = [
  { key: 'region',      labelKey: 'location', sortable: false, align: 'left'  },
  { key: 'leads',       labelKey: 'leads',    sortable: true,  align: 'right' },
  { key: 'cpl',         labelKey: 'cpl',      sortable: true,  align: 'right' },
  { key: 'spend',       labelKey: 'spend',    sortable: true,  align: 'right' },
  { key: 'ctr',         labelKey: 'ctr',      sortable: true,  align: 'right' }
];

export default function GeoTable({ regions = [] }) {
  const { t } = useI18n();
  const { currency } = useCurrency();
  const [sortKey, setSortKey] = useState('leads');
  const [sortDir, setSortDir] = useState('desc');

  const sorted = useMemo(() => {
    const arr = [...regions];
    arr.sort((a, b) => {
      const mult = sortDir === 'desc' ? -1 : 1;
      const va = a[sortKey] ?? 0;
      const vb = b[sortKey] ?? 0;
      if (va === vb) return 0;
      return mult * (va > vb ? 1 : -1);
    });
    return arr;
  }, [regions, sortKey, sortDir]);

  const handleSort = (key) => {
    if (key === sortKey) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortArrow = sortDir === 'desc' ? ArrowDown : ArrowUp;

  if (!regions.length) return null;

  return (
    <div className="glass-strong rounded-2xl">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
        <Globe2 className="w-4 h-4 text-emerald" strokeWidth={2.5} />
        <h2 className="text-sm font-semibold tracking-tight">{t('locationsByPerformance')}</h2>
        <span className="ml-auto text-[10px] font-semibold text-white/40 num">
          {regions.length}
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
                    {t(col.labelKey)}
                    {col.sortable && sortKey === col.key && (
                      <SortArrow className="w-3 h-3 text-emerald" strokeWidth={3} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={`${row.region}-${i}`} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition">
                <td className="px-5 py-3 text-[13px] font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-emerald/70" strokeWidth={2.5} />
                    {row.region}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="font-mono text-[13px] font-bold text-emerald">{number(row.leads)}</span>
                </td>
                <td className="px-5 py-3 text-right font-mono text-[12.5px] text-white/85">
                  {row.cpl > 0 ? currency(row.cpl) : '—'}
                </td>
                <td className="px-5 py-3 text-right font-mono text-[12.5px] text-white/85">
                  {currency(row.spend)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-[12.5px] text-white/85">
                  {percent(row.ctr || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
