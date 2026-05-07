import { useState } from 'react';
import { TrendingUp, TrendingDown, Info, Minus } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { isTrendGood } from '../utils/format';

const renderTrend = (trend, t) => {
  if (!trend) return null;
  if (trend.kind === 'no-base') return { label: t('noPreviousData'), Icon: Minus, tone: 'neutral' };
  if (trend.kind === 'new') return { label: t('new'), Icon: TrendingUp, tone: 'good' };
  if (trend.kind === 'no-change') return { label: '0.0%', Icon: Minus, tone: 'neutral' };
  const isPositive = trend.value > 0;
  // Variações estouradas (>999%) viram label semântico em vez de "+999%+"
  if (trend.capped) {
    return {
      label: isPositive ? t('highGrowth') : t('highDrop'),
      Icon: isPositive ? TrendingUp : TrendingDown,
      tone: null
    };
  }
  const sign = isPositive ? '+' : '';
  return {
    label: `${sign}${trend.value.toFixed(1)}%`,
    Icon: isPositive ? TrendingUp : TrendingDown,
    tone: null
  };
};

const TONE_STYLES = {
  good: 'bg-emerald/10 border-emerald/20 text-emerald',
  bad: 'bg-red-500/10 border-red-500/20 text-red-400',
  neutral: 'bg-white/5 border-white/10 text-white/50'
};

/**
 * metricKind:
 *   - 'higher-better' (leads, CTR, impressions, reach)
 *   - 'lower-better'  (CPL)
 *   - 'neutral'       (spend — não pinta automaticamente)
 */
export default function KPICard({ titleKey, value, icon: Icon, trend, helpKey, metricKind = 'higher-better' }) {
  const { t } = useI18n();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const trendInfo = renderTrend(trend, t);
  let tone = trendInfo?.tone;
  if (tone === null && trend?.kind === 'percent') {
    const good = isTrendGood(trend, metricKind);
    tone = good === null ? 'neutral' : good ? 'good' : 'bad';
  }

  return (
    <div className="glass p-5 hover:border-white/[0.12] transition group relative">
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex items-center gap-1.5 text-white/50 min-w-0">
          {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />}
          <span className="text-[11px] font-semibold uppercase tracking-wider truncate">
            {t(titleKey)}
          </span>
          {helpKey && (
            <button
              type="button"
              className="relative flex-shrink-0 text-white/30 hover:text-emerald transition"
              onMouseEnter={() => setTooltipOpen(true)}
              onMouseLeave={() => setTooltipOpen(false)}
              onFocus={() => setTooltipOpen(true)}
              onBlur={() => setTooltipOpen(false)}
              onClick={() => setTooltipOpen(o => !o)}
              aria-label="Info"
            >
              <Info className="w-3 h-3" strokeWidth={2.5} />
              {tooltipOpen && (
                <div
                  role="tooltip"
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30 w-[240px] p-3 rounded-xl bg-ink-900/95 border border-white/[0.12] backdrop-blur-xl text-[11px] text-white/80 leading-relaxed text-left shadow-2xl pointer-events-none normal-case tracking-normal font-normal"
                  style={{ background: 'rgba(16,16,18,0.96)' }}
                >
                  {t(helpKey)}
                </div>
              )}
            </button>
          )}
        </div>

        {trendInfo && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border flex-shrink-0 ${TONE_STYLES[tone] || TONE_STYLES.neutral}`}>
            <trendInfo.Icon className="w-3 h-3" strokeWidth={3} />
            <span className="text-[10px] font-bold num whitespace-nowrap">{trendInfo.label}</span>
          </div>
        )}
      </div>

      <div className="text-[28px] font-bold tracking-tight num leading-none">
        {value ?? '—'}
      </div>

      {trend?.kind === 'percent' && (
        <p className="text-[11px] text-white/35 mt-2 font-medium">
          {t('vsPreviousPeriod')}
        </p>
      )}
    </div>
  );
}
