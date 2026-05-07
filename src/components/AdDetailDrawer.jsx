import { useEffect } from 'react';
import { X, Sparkles, Zap, AlertTriangle, Eye, MousePointerClick, Users, DollarSign, Wallet, Activity, Layers, MapPin } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { getLeads, getCPL, currency, number, percent } from '../utils/format';

const extractSrc = (html) => {
  const match = html?.match(/src="([^"]+)"/);
  return match ? match[1].replace(/&amp;/g, '&') : null;
};

const PERF_CONFIG = {
  good:     { Icon: Sparkles,       cls: 'bg-emerald/10 border-emerald/30 text-emerald' },
  watch:    { Icon: Zap,             cls: 'bg-amber-500/10 border-amber-500/30 text-amber-300' },
  critical: { Icon: AlertTriangle,   cls: 'bg-red-500/10 border-red-500/30 text-red-300' }
};

const REC_KEY = {
  good: 'rec_scaleUp',
  watch: 'rec_optimize',
  critical: 'rec_pauseOrFix',
  lowVolume: 'rec_lowVolume'
};

function MetricRow({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-2 text-white/55 text-[11px] uppercase font-semibold tracking-wider">
        <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
        {label}
      </div>
      <span className={`text-[14px] font-bold num ${accent ? 'text-emerald' : 'text-white/90'}`}>
        {value}
      </span>
    </div>
  );
}

export default function AdDetailDrawer({ ad, performance, onClose, datePresetLabel }) {
  const { t } = useI18n();

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!ad) return null;

  const src = extractSrc(ad.preview);
  const ins = ad.insights;

  const leads = ins ? getLeads(ins.actions, ins.cost_per_result) : 0;
  const spend = ins ? parseFloat(ins.spend || 0) : 0;
  const cpl   = ins ? getCPL(ins.cost_per_result, spend, leads) : 0;
  const ctr   = ins ? parseFloat(ins.ctr || 0) : 0;
  const impressions = ins ? parseInt(ins.impressions || 0) : 0;
  const reach = ins ? parseInt(ins.reach || 0) : 0;
  const clicks = ins ? parseInt(ins.clicks || 0) : 0;
  const frequency = ins ? parseFloat(ins.frequency || 0) : 0;

  // Recomendação automática: baseada na performance + volume
  const recKey = leads === 0
    ? 'lowVolume'
    : REC_KEY[performance] || 'watch';

  const perfCfg = PERF_CONFIG[performance] || PERF_CONFIG.watch;
  const PerfIcon = perfCfg.Icon;

  const statusKey = `status_${(ad.effective_status || ad.status || 'unknown').toLowerCase()}`;
  const statusLabel = t(statusKey);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-[fadeIn_.15s_ease]"
        onClick={onClose}
      />
      <aside
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[460px] glass-strong rounded-none sm:rounded-l-3xl border-l border-white/[0.08] flex flex-col animate-[slideInRight_.25s_ease]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">{t('fullMetrics')}</p>
            <h2 className="text-sm font-bold tracking-tight truncate" title={ad.name}>{ad.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition flex items-center justify-center flex-shrink-0"
            aria-label={t('closeDetails')}
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin px-5 py-4 space-y-4">
          {src && (
            <div className="relative w-full rounded-xl overflow-hidden bg-ink-800 border border-white/[0.06]">
              <iframe
                src={src}
                title={ad.name}
                scrolling="yes"
                className="w-full h-[440px] border-0"
                allowFullScreen
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className={`p-2.5 rounded-xl border ${perfCfg.cls} flex items-center gap-2`}>
              <PerfIcon className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider opacity-70 font-semibold">{t('performance')}</p>
                <p className="text-[12px] font-bold truncate">{t(`perf_${performance || 'watch'}`)}</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-center gap-2">
              <Activity className="w-4 h-4 flex-shrink-0 text-white/60" strokeWidth={2.5} />
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider text-white/50 font-semibold">{t('status')}</p>
                <p className="text-[12px] font-bold truncate">{statusLabel}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">{t('fullMetrics')}</p>
            <div className="glass p-4 rounded-xl">
              <MetricRow icon={Users}             label={t('leads')}       value={number(leads)} accent />
              <MetricRow icon={DollarSign}        label={t('cpl')}         value={cpl > 0 ? currency(cpl) : '—'} />
              <MetricRow icon={Wallet}            label={t('spend')}       value={currency(spend)} />
              <MetricRow icon={MousePointerClick} label={t('ctr')}         value={percent(ctr)} />
              <MetricRow icon={Eye}               label={t('impressions')} value={number(impressions)} />
              <MetricRow icon={Users}             label={t('reach')}       value={number(reach)} />
              <MetricRow icon={MousePointerClick} label={t('clicks')}      value={number(clicks)} />
              <MetricRow icon={Activity}          label={t('frequency')}   value={frequency.toFixed(2)} />
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Contexto</p>
            <div className="glass p-4 rounded-xl space-y-2.5">
              {ad.campaign_name && (
                <div className="flex items-start gap-2 text-[12px]">
                  <Layers className="w-3.5 h-3.5 text-white/40 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{t('campaign')}</p>
                    <p className="text-white/85 font-medium truncate" title={ad.campaign_name}>{ad.campaign_name}</p>
                  </div>
                </div>
              )}
              {ad.adset_name && (
                <div className="flex items-start gap-2 text-[12px]">
                  <Layers className="w-3.5 h-3.5 text-white/40 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{t('adset')}</p>
                    <p className="text-white/85 font-medium truncate" title={ad.adset_name}>{ad.adset_name}</p>
                  </div>
                </div>
              )}
              {ad.locations && ad.locations.length > 0 && (
                <div className="flex items-start gap-2 text-[12px]">
                  <MapPin className="w-3.5 h-3.5 text-white/40 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{t('location')}</p>
                    <p className="text-white/85 font-medium">{ad.locations.join(', ')}</p>
                  </div>
                </div>
              )}
              {datePresetLabel && (
                <div className="flex items-start gap-2 text-[12px]">
                  <Activity className="w-3.5 h-3.5 text-white/40 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{t('period')}</p>
                    <p className="text-white/85 font-medium">{datePresetLabel}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${perfCfg.cls}`}>
            <p className="text-[10px] uppercase tracking-wider opacity-70 font-bold mb-1.5">{t('recommendation')}</p>
            <p className="text-[12px] leading-relaxed font-medium">{t(REC_KEY[recKey] || 'rec_optimize')}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
