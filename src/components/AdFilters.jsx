import { Search, ArrowDownAZ, MapPin, Activity, X } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const SORT_KEYS = ['leads', 'cpl', 'ctr', 'spend'];

export default function AdFilters({
  search, onSearch,
  sort, onSort,
  location, onLocation, locations,
  status, onStatus, statuses,
  onClear
}) {
  const { t } = useI18n();
  const hasFilters = search || location !== 'all' || status !== 'all' || sort !== 'leads';

  return (
    <div className="px-4 py-3 border-b border-white/[0.06] flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t('searchAds')}
          className="glass w-full pl-9 pr-3 py-2 text-[12px] text-white/90 placeholder:text-white/30 outline-none focus:border-emerald/40 transition rounded-lg"
        />
      </div>

      <div className="relative">
        <ArrowDownAZ className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="glass appearance-none pl-8 pr-7 py-2 text-[11px] font-medium text-white/90 cursor-pointer outline-none focus:border-emerald/40 rounded-lg"
          aria-label={t('sortBy')}
        >
          {SORT_KEYS.map(k => (
            <option key={k} value={k} className="bg-ink-800">{t(`sort_${k}`)}</option>
          ))}
        </select>
      </div>

      {locations.length > 0 && (
        <div className="relative">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
          <select
            value={location}
            onChange={(e) => onLocation(e.target.value)}
            className="glass appearance-none pl-8 pr-7 py-2 text-[11px] font-medium text-white/90 cursor-pointer outline-none focus:border-emerald/40 rounded-lg max-w-[150px]"
            aria-label={t('filterLocation')}
          >
            <option value="all" className="bg-ink-800">{t('allLocations')}</option>
            {locations.map(loc => (
              <option key={loc} value={loc} className="bg-ink-800">{loc}</option>
            ))}
          </select>
        </div>
      )}

      {statuses.length > 1 && (
        <div className="relative">
          <Activity className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value)}
            className="glass appearance-none pl-8 pr-7 py-2 text-[11px] font-medium text-white/90 cursor-pointer outline-none focus:border-emerald/40 rounded-lg"
            aria-label={t('filterStatus')}
          >
            <option value="all" className="bg-ink-800">{t('allStatuses')}</option>
            {statuses.map(s => (
              <option key={s} value={s} className="bg-ink-800">{t(`status_${s.toLowerCase()}`) || s}</option>
            ))}
          </select>
        </div>
      )}

      {hasFilters && (
        <button
          onClick={onClear}
          className="px-2.5 py-2 rounded-lg text-[11px] text-white/50 hover:text-white border border-white/10 hover:border-white/30 transition flex items-center gap-1"
          title={t('clearFilters')}
        >
          <X className="w-3 h-3" strokeWidth={2.5} />
          <span className="hidden sm:inline">{t('clearFilters')}</span>
        </button>
      )}
    </div>
  );
}
