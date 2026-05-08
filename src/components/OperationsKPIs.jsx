import { Calendar, CheckCircle2, XCircle, UserPlus, Stethoscope, Activity, Stethoscope as Steth } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { number, percent } from '../utils/format';

/**
 * Card de KPI operacional. Estado vazio (`value === null`) mostra "—" elegante.
 * Loading skeleton via prop `loading`.
 */
function OperationCard({ icon: Icon, titleKey, value, loading }) {
  const { t } = useI18n();
  return (
    <div className="glass p-5 hover:border-white/[0.12] transition group relative">
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex items-center gap-1.5 text-white/50 min-w-0">
          {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />}
          <span className="text-[11px] font-semibold uppercase tracking-wider truncate">
            {t(titleKey)}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-[28px] w-24 rounded-lg bg-white/[0.05] animate-pulse" />
      ) : (
        <div className="text-[28px] font-bold tracking-tight num leading-none">
          {value ?? '—'}
        </div>
      )}
    </div>
  );
}

/**
 * Seção de KPIs operacionais (Clinicorp). Renderiza condicionalmente.
 * Layout no mesmo padrão dos KPIs de Meta — grid 6 colunas em desktop.
 */
export default function OperationsKPIs({ data, loading, error, enabled }) {
  const { t } = useI18n();

  if (!enabled) return null;

  // Estado de erro: card único com mensagem amigável
  if (error) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope className="w-3.5 h-3.5 text-emerald" strokeWidth={2.5} />
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-white/60">
            {t('operationsTitle')}
          </h2>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/8 border border-amber-500/25 text-xs text-amber-200">
          {t('operationsError')}: {error}
        </div>
      </section>
    );
  }

  const formatCount = (v) => v == null ? null : number(v);
  const formatPct = (v) => v == null ? null : percent(v);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Stethoscope className="w-3.5 h-3.5 text-emerald" strokeWidth={2.5} />
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-white/60">
          {t('operationsTitle')}
        </h2>
        {data?._stub && (
          <span className="text-[10px] uppercase tracking-wider text-amber-300/70 font-bold">
            (em breve)
          </span>
        )}
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <OperationCard icon={Calendar}      titleKey="op_scheduled"     value={formatCount(data?.appointments_scheduled)} loading={loading} />
        <OperationCard icon={CheckCircle2}  titleKey="op_completed"     value={formatCount(data?.appointments_completed)} loading={loading} />
        <OperationCard icon={XCircle}       titleKey="op_cancelled"     value={formatCount(data?.appointments_cancelled)} loading={loading} />
        <OperationCard icon={UserPlus}      titleKey="op_new_patients"  value={formatCount(data?.new_patients)}           loading={loading} />
        <OperationCard icon={Activity}      titleKey="op_total_visits"  value={formatCount(data?.total_visits)}           loading={loading} />
        <OperationCard icon={Steth}         titleKey="op_attendance"    value={formatPct(data?.attendance_rate)}          loading={loading} />
      </div>
    </section>
  );
}
