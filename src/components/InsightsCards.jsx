import { useMemo } from 'react';
import { Lightbulb, Trophy, AlertTriangle, Rocket, FileBarChart } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { useCurrency } from '../hooks/useCurrency';
import { getLeads, getCPL, number, percent, median } from '../utils/format';

const buildAdMetrics = (ad) => {
  const ins = ad.insights;
  const leads = ins ? getLeads(ins.actions, ins.cost_per_result) : 0;
  const spend = ins ? parseFloat(ins.spend || 0) : 0;
  const cpl = ins ? getCPL(ins.cost_per_result, spend, leads) : 0;
  const ctr = ins ? parseFloat(ins.ctr || 0) : 0;
  const freq = ins ? parseFloat(ins.frequency || 0) : 0;
  return { ad, leads, spend, cpl, ctr, freq };
};

/**
 * Heurísticas para gerar insights automáticos a partir do overview + ads.
 * Os dados aqui são derivados (não fazem novas chamadas).
 */
function computeInsights(overview, ads, t, currency) {
  const summary = {
    Icon: FileBarChart,
    title: t('insight_summary_title'),
    desc: overview ? t('insight_summary_desc', {
      leads: number(overview.leads || 0),
      cpl: overview.cpl > 0 ? currency(overview.cpl) : '—',
      spend: currency(overview.spend || 0)
    }) : t('noData'),
    tone: 'neutral'
  };

  const metrics = ads.map(buildAdMetrics);

  // Best ad: maior número de leads (ties → menor CPL)
  const sortedByLeads = [...metrics].filter(m => m.leads > 0).sort((a, b) => {
    if (b.leads !== a.leads) return b.leads - a.leads;
    return a.cpl - b.cpl;
  });
  const best = sortedByLeads[0];

  const topAd = {
    Icon: Trophy,
    title: t('insight_topAd_title'),
    desc: best
      ? t('insight_topAd_desc', {
          name: best.ad.name,
          leads: number(best.leads),
          cpl: best.cpl > 0 ? currency(best.cpl) : '—'
        })
      : t('insight_topAd_empty'),
    tone: best ? 'good' : 'neutral'
  };

  // Alert: frequência alta (≥4) OU CPL muito acima da mediana
  const cpls = metrics.map(m => m.cpl);
  const medianCpl = median(cpls);
  const highFreqAd = metrics.find(m => m.freq >= 4);
  const highCplAd = medianCpl > 0
    ? metrics.filter(m => m.cpl > medianCpl * 1.6)
        .sort((a, b) => b.cpl - a.cpl)[0]
    : null;

  let alert;
  if (highFreqAd) {
    alert = {
      Icon: AlertTriangle,
      title: t('insight_alert_title'),
      desc: t('insight_alert_freq', {
        name: highFreqAd.ad.name,
        freq: highFreqAd.freq.toFixed(2)
      }),
      tone: 'critical'
    };
  } else if (highCplAd) {
    alert = {
      Icon: AlertTriangle,
      title: t('insight_alert_title'),
      desc: t('insight_alert_cpl', {
        name: highCplAd.ad.name,
        cpl: currency(highCplAd.cpl),
        avg: currency(medianCpl)
      }),
      tone: 'critical'
    };
  } else {
    alert = {
      Icon: AlertTriangle,
      title: t('insight_alert_title'),
      desc: t('insight_alert_none'),
      tone: 'neutral'
    };
  }

  // Opportunity: CTR alto (top 25%) E spend baixo (bottom 50%) — pode escalar
  const ctrs = metrics.map(m => m.ctr).filter(v => v > 0);
  const sortedCtrs = [...ctrs].sort((a, b) => a - b);
  const ctrThreshold = sortedCtrs.length ? sortedCtrs[Math.floor(sortedCtrs.length * 0.75)] : 0;
  const totalSpend = metrics.reduce((s, m) => s + m.spend, 0);
  const avgSpend = metrics.length ? totalSpend / metrics.length : 0;
  const opportunityAd = metrics
    .filter(m => m.ctr > 0 && m.ctr >= ctrThreshold && m.spend > 0 && m.spend < avgSpend * 0.6)
    .sort((a, b) => b.ctr - a.ctr)[0];

  const opportunity = opportunityAd
    ? {
        Icon: Rocket,
        title: t('insight_opp_title'),
        desc: t('insight_opp_ctr', {
          name: opportunityAd.ad.name,
          ctr: percent(opportunityAd.ctr)
        }),
        tone: 'good'
      }
    : {
        Icon: Rocket,
        title: t('insight_opp_title'),
        desc: t('insight_opp_none'),
        tone: 'neutral'
      };

  return [summary, topAd, alert, opportunity];
}

const TONE = {
  good:     { ring: 'border-emerald/25 hover:border-emerald/40',    icon: 'bg-emerald/15 text-emerald' },
  critical: { ring: 'border-red-500/25 hover:border-red-500/40',    icon: 'bg-red-500/15 text-red-300' },
  neutral:  { ring: 'border-white/[0.06] hover:border-white/[0.15]', icon: 'bg-white/[0.05] text-white/55' }
};

function InsightCard({ Icon, title, desc, tone = 'neutral' }) {
  const cls = TONE[tone];
  return (
    <div className={`glass p-4 rounded-2xl flex flex-col gap-2.5 transition border ${cls.ring}`}>
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cls.icon}`}>
          <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
        </div>
        <p className="text-[10px] uppercase font-bold tracking-wider text-white/55 truncate">{title}</p>
      </div>
      <p className="text-[12.5px] text-white/85 leading-snug font-medium">{desc}</p>
    </div>
  );
}

export default function InsightsCards({ overview, ads }) {
  const { t } = useI18n();
  const { currency } = useCurrency();
  const insights = useMemo(() => computeInsights(overview, ads || [], t, currency), [overview, ads, t, currency]);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-3.5 h-3.5 text-emerald" strokeWidth={2.5} />
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-white/60">{t('insightsTitle')}</h2>
      </div>
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {insights.map((ins, i) => (
          <InsightCard key={i} {...ins} />
        ))}
      </div>
    </section>
  );
}
