import { useState, useMemo } from 'react';
import { Play, Sparkles, Loader2, MapPin, Zap, AlertTriangle } from 'lucide-react';
import { getLeads, getCPL, number, percent, classifyAdPerformance, median } from '../utils/format';
import { useI18n } from '../hooks/useI18n';
import { useCurrency } from '../hooks/useCurrency';
import { useInView } from '../hooks/useInView';
import AdFilters from './AdFilters';
import AdDetailDrawer from './AdDetailDrawer';

const extractSrc = (html) => {
  const match = html?.match(/src="([^"]+)"/);
  return match ? match[1].replace(/&amp;/g, '&') : null;
};

const PERF_PILL = {
  good:     { Icon: Sparkles,       cls: 'bg-emerald/10 border-emerald/25 text-emerald' },
  watch:    { Icon: Zap,             cls: 'bg-amber-500/10 border-amber-500/25 text-amber-300' },
  critical: { Icon: AlertTriangle,   cls: 'bg-red-500/10 border-red-500/25 text-red-300' }
};

const STATUS_PILL = {
  ACTIVE:   'bg-emerald/8 border-emerald/20 text-emerald/90',
  PAUSED:   'bg-white/[0.05] border-white/15 text-white/55',
  DISABLED: 'bg-red-500/8 border-red-500/20 text-red-300/80'
};

function LocationBadge({ locations = [] }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  if (!locations.length) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] font-medium text-white/40">
        <MapPin className="w-2.5 h-2.5" strokeWidth={2.5} />
        {t('locationUnavailable')}
      </span>
    );
  }

  if (locations.length === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald/8 border border-emerald/20 text-[9px] font-semibold text-emerald/90">
        <MapPin className="w-2.5 h-2.5" strokeWidth={2.5} />
        {locations[0]}
      </span>
    );
  }

  return (
    <span
      className="relative inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald/8 border border-emerald/20 text-[9px] font-semibold text-emerald/90 cursor-help"
      onMouseEnter={(e) => { e.stopPropagation(); setOpen(true); }}
      onMouseLeave={() => setOpen(false)}
    >
      <MapPin className="w-2.5 h-2.5" strokeWidth={2.5} />
      {t('multipleLocations')} ({locations.length})
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-30 min-w-[160px] max-w-[240px] p-2 rounded-lg bg-ink-900/95 border border-white/[0.12] backdrop-blur-xl shadow-2xl pointer-events-none"
          style={{ background: 'rgba(16,16,18,0.96)' }}
        >
          <ul className="text-[10px] text-white/80 space-y-0.5 normal-case">
            {locations.slice(0, 8).map((loc, i) => (
              <li key={i} className="truncate">• {loc}</li>
            ))}
            {locations.length > 8 && (
              <li className="text-white/40 italic">+ {locations.length - 8}</li>
            )}
          </ul>
        </div>
      )}
    </span>
  );
}

function AdRow({ ad, rank, performance, onOpen }) {
  const { t } = useI18n();
  const { currency } = useCurrency();
  const [thumbRef, inView] = useInView({ rootMargin: '300px', once: true });
  const src = extractSrc(ad.preview);
  const ins = ad.insights;

  const leads = ins ? getLeads(ins.actions, ins.cost_per_result) : 0;
  const spend = ins ? parseFloat(ins.spend || 0) : 0;
  const cpl   = ins ? getCPL(ins.cost_per_result, spend, leads) : 0;
  const ctr   = ins ? parseFloat(ins.ctr || 0) : 0;
  const freq  = ins ? parseFloat(ins.frequency || 0) : 0;

  const perfCfg = PERF_PILL[performance] || PERF_PILL.watch;
  const PerfIcon = perfCfg.Icon;

  const status = ad.effective_status || ad.status || 'UNKNOWN';
  const statusCls = STATUS_PILL[status] || STATUS_PILL.PAUSED;
  const statusLabel = t(`status_${status.toLowerCase()}`) || status;

  return (
    <div
      onClick={() => onOpen(ad, performance)}
      className="group flex gap-3 p-3 rounded-xl border border-transparent hover:border-white/[0.08] hover:bg-white/[0.02] transition cursor-pointer"
    >
      <div ref={thumbRef} className="relative w-[68px] h-[88px] rounded-lg overflow-hidden bg-ink-800 flex-shrink-0 border border-white/[0.06]">
        {src && inView ? (
          <>
            <iframe
              src={src}
              scrolling="no"
              title={ad.name}
              tabIndex={-1}
              loading="lazy"
              className="w-[476px] h-[680px] origin-top-left scale-[0.143] pointer-events-none border-0 absolute"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
              <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition fill-white" />
            </div>
          </>
        ) : src ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-4 h-4 text-white/30 fill-white/30" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/30">
            N/A
          </div>
        )}
        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur text-[9px] font-bold num text-emerald">
          #{rank}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 gap-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-[12.5px] font-semibold truncate leading-tight flex-1 min-w-0" title={ad.name}>
              {ad.name}
            </p>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-semibold flex-shrink-0 ${perfCfg.cls}`}>
              <PerfIcon className="w-2.5 h-2.5" strokeWidth={3} />
              {t(`perf_${performance}`)}
            </span>
            <span className={`inline-flex px-1.5 py-0.5 rounded-md border text-[9px] font-semibold flex-shrink-0 uppercase ${statusCls}`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <LocationBadge locations={ad.locations} />
            {ad.adset_name && (
              <span className="text-[10px] text-white/35 truncate" title={ad.adset_name}>
                · {ad.adset_name}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          <div>
            <p className="text-[9px] uppercase font-semibold text-white/35 tracking-wider">{t('leads')}</p>
            <p className="text-[12px] font-bold text-emerald num">{number(leads)}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase font-semibold text-white/35 tracking-wider">{t('cpl')}</p>
            <p className="text-[12px] font-bold num">{cpl > 0 ? currency(cpl) : '—'}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase font-semibold text-white/35 tracking-wider">{t('ctr')}</p>
            <p className="text-[12px] font-bold num">{percent(ctr)}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase font-semibold text-white/35 tracking-wider">{t('spend')}</p>
            <p className="text-[12px] font-bold num">{currency(spend)}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase font-semibold text-white/35 tracking-wider">{t('frequency')}</p>
            <p className="text-[12px] font-bold num">{freq > 0 ? freq.toFixed(2) : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdPreviews({ datePreset, ads = [], loading, error, rateLimited, tokenExpired }) {
  const { t } = useI18n();

  // Filtros
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('leads');
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Drawer
  const [openAd, setOpenAd] = useState(null);
  const [openPerformance, setOpenPerformance] = useState(null);

  // Stats agregadas para classificar performance
  const stats = useMemo(() => {
    const cpls = [];
    const ctrs = [];
    for (const ad of ads) {
      const ins = ad.insights;
      if (!ins) continue;
      const leads = getLeads(ins.actions, ins.cost_per_result);
      const spend = parseFloat(ins.spend || 0);
      const cpl = getCPL(ins.cost_per_result, spend, leads);
      if (cpl > 0) cpls.push(cpl);
      const ctr = parseFloat(ins.ctr || 0);
      if (ctr > 0) ctrs.push(ctr);
    }
    return { medianCpl: median(cpls), medianCtr: median(ctrs) };
  }, [ads]);

  // Lista de localizações disponíveis (para o select)
  const allLocations = useMemo(() => {
    const set = new Set();
    for (const ad of ads) {
      for (const loc of ad.locations || []) set.add(loc);
    }
    return [...set].sort();
  }, [ads]);

  // Lista de statuses disponíveis (para o select)
  const allStatuses = useMemo(() => {
    const set = new Set();
    for (const ad of ads) {
      const s = ad.effective_status || ad.status;
      if (s) set.add(s);
    }
    return [...set];
  }, [ads]);

  // Aplica filtros + ordenação
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return ads.filter(ad => {
      if (term && !(ad.name || '').toLowerCase().includes(term)) return false;
      if (locationFilter !== 'all' && !(ad.locations || []).includes(locationFilter)) return false;
      const s = ad.effective_status || ad.status;
      if (statusFilter !== 'all' && s !== statusFilter) return false;
      return true;
    });
  }, [ads, search, locationFilter, statusFilter]);

  const ranked = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const ma = metricForSort(a, sort);
      const mb = metricForSort(b, sort);
      if (sort === 'cpl') {
        // CPL: menor é melhor (zero vai para o final)
        if (ma === 0) return 1;
        if (mb === 0) return -1;
        return ma - mb;
      }
      return mb - ma;
    });
    return arr;
  }, [filtered, sort]);

  const handleClearFilters = () => {
    setSearch('');
    setSort('leads');
    setLocationFilter('all');
    setStatusFilter('all');
  };

  const handleOpen = (ad, performance) => {
    setOpenAd(ad);
    setOpenPerformance(performance);
  };

  return (
    <div className="glass-strong min-h-[320px] flex flex-col rounded-2xl">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald" strokeWidth={2.5} />
          <h2 className="text-sm font-semibold tracking-tight">{t('topPerformingAds')}</h2>
        </div>
        {!loading && ads.length > 0 && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald/10 border border-emerald/20 text-emerald num">
            {ads.length} {t('active')}
          </span>
        )}
      </div>

      {ads.length > 0 && (
        <AdFilters
          search={search} onSearch={setSearch}
          sort={sort} onSort={setSort}
          location={locationFilter} onLocation={setLocationFilter} locations={allLocations}
          status={statusFilter} onStatus={setStatusFilter} statuses={allStatuses}
          onClear={handleClearFilters}
        />
      )}

      <div className="flex-1 overflow-y-auto scroll-thin px-2 py-2">
        {loading && ads.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-white/40">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-xs">{t('loadingAds')}</p>
          </div>
        )}

        {tokenExpired && ads.length === 0 && (
          <div className="m-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
            <p className="font-semibold mb-1">{t('tokenExpiredTitle')}</p>
            <p className="text-amber-200/70">{t('tokenExpiredDesc')}</p>
          </div>
        )}

        {rateLimited && ads.length === 0 && !tokenExpired && (
          <div className="m-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
            <p className="font-semibold mb-1">{t('rateLimitTitle')}</p>
            <p className="text-amber-200/70">{t('rateLimitDesc')}</p>
          </div>
        )}

        {error && !rateLimited && !tokenExpired && (
          <div className="m-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && !rateLimited && ads.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs text-white/40 px-4 text-center">
            {t('noActiveAds')}
          </div>
        )}

        {ads.length > 0 && ranked.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs text-white/40 px-4 text-center py-12">
            {t('noResultsAds')}
          </div>
        )}

        {ranked.length > 0 && (
          <div className="space-y-1">
            {ranked.map((ad, i) => (
              <AdRow
                key={ad.id}
                ad={ad}
                rank={i + 1}
                performance={classifyAdPerformance(ad, stats)}
                onOpen={handleOpen}
              />
            ))}
          </div>
        )}
      </div>

      {openAd && (
        <AdDetailDrawer
          ad={openAd}
          performance={openPerformance}
          datePresetLabel={t(datePreset)}
          onClose={() => { setOpenAd(null); setOpenPerformance(null); }}
        />
      )}
    </div>
  );
}

function metricForSort(ad, sort) {
  const ins = ad.insights;
  if (!ins) return 0;
  if (sort === 'leads') return getLeads(ins.actions, ins.cost_per_result);
  if (sort === 'cpl') {
    const leads = getLeads(ins.actions, ins.cost_per_result);
    const spend = parseFloat(ins.spend || 0);
    return getCPL(ins.cost_per_result, spend, leads);
  }
  if (sort === 'ctr') return parseFloat(ins.ctr || 0);
  if (sort === 'spend') return parseFloat(ins.spend || 0);
  return 0;
}
