import { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import {
  PRESETS, presetRange, formatRange, buildMonthGrid,
  fmt, parse, sameDay, isBetween, today as todayFn
} from '../utils/dateRange';

/**
 * DateRangePicker premium dark.
 * Aceita preset ('last_30d') ou custom range ({since, until}).
 *
 * Estado externo (controlado):
 *  preset: string (PRESET key) | 'custom'
 *  customRange: { since, until } | null
 *
 * Callbacks:
 *  onChange({ preset, customRange })
 */
export default function DateRangePicker({ preset, customRange, onChange }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Estado interno do calendário
  const [viewMonth, setViewMonth] = useState(() => {
    const d = customRange?.since ? parse(customRange.since) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [pickStart, setPickStart] = useState(null);
  const [pickEnd, setPickEnd] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  // Reseta seleção ao abrir, baseado no estado atual
  useEffect(() => {
    if (open) {
      if (preset === 'custom' && customRange?.since) {
        setPickStart(parse(customRange.since));
        setPickEnd(customRange.until ? parse(customRange.until) : null);
        setViewMonth(new Date(parse(customRange.since).getFullYear(), parse(customRange.since).getMonth(), 1));
      } else {
        const r = presetRange(preset || 'last_30d');
        setPickStart(parse(r.since));
        setPickEnd(parse(r.until));
      }
      setHoverDate(null);
    }
  }, [open]);

  // Click fora / ESC + bloqueio de scroll no mobile (bottom sheet)
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    // Bloqueia scroll no mobile (largura de tela < 640px)
    const isMobile = window.innerWidth < 640;
    if (isMobile) document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  // Label do botão principal
  const buttonLabel = useMemo(() => {
    if (preset === 'custom' && customRange?.since && customRange?.until) {
      return formatRange(customRange.since, customRange.until, lang);
    }
    return t(preset || 'last_30d');
  }, [preset, customRange, lang, t]);

  // Handlers
  const handlePreset = (key) => {
    onChange({ preset: key, customRange: null });
    setOpen(false);
  };

  const handleDayClick = (date) => {
    if (date > todayFn()) return; // bloqueia datas futuras
    if (!pickStart || (pickStart && pickEnd)) {
      // Inicia novo range
      setPickStart(date);
      setPickEnd(null);
      setHoverDate(null);
      return;
    }
    // Tem pickStart sem pickEnd: define o final
    if (date < pickStart) {
      setPickEnd(pickStart);
      setPickStart(date);
    } else {
      setPickEnd(date);
    }
  };

  const handleApply = () => {
    if (!pickStart || !pickEnd) return;
    onChange({
      preset: 'custom',
      customRange: { since: fmt(pickStart), until: fmt(pickEnd) }
    });
    setOpen(false);
  };

  const handleCancel = () => setOpen(false);

  const goPrevMonth = () => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goNextMonth = () => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const grid = useMemo(
    () => buildMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth()),
    [viewMonth]
  );

  const monthLabel = useMemo(() => {
    const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(viewMonth);
  }, [viewMonth, lang]);

  // Dias da semana abreviados (segunda primeiro)
  const weekDays = useMemo(() => {
    const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
    const fmtDay = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    // Pega 7 datas consecutivas começando numa segunda conhecida
    const ref = new Date(2024, 0, 1); // 01/01/2024 = segunda
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ref);
      d.setDate(d.getDate() + i);
      return fmtDay.format(d).replace('.', '').slice(0, 2).toUpperCase();
    });
  }, [lang]);

  // Determina o range visualmente exibido (com hover preview)
  const previewEnd = !pickEnd && hoverDate && pickStart && hoverDate >= pickStart ? hoverDate : pickEnd;
  const previewStart = !pickEnd && hoverDate && pickStart && hoverDate < pickStart ? hoverDate : pickStart;
  const effectiveEnd = previewEnd || (hoverDate && hoverDate < pickStart ? pickStart : null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="glass flex items-center gap-2 pl-3 pr-2.5 py-2 text-sm font-medium text-white/90 cursor-pointer outline-none focus-visible:border-emerald/50 hover:border-white/[0.18] transition rounded-xl"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('selectRange')}
      >
        <Calendar className="w-3.5 h-3.5 text-white/50" strokeWidth={2.5} />
        <span className="text-[12.5px] whitespace-nowrap">{buttonLabel}</span>
        <ChevronDown className={`w-3 h-3 text-white/50 transition ${open ? 'rotate-180' : ''}`} strokeWidth={2.5} />
      </button>

      {open && (
        <>
          {/* Backdrop apenas no mobile (bottom sheet) */}
          <div
            className="sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-[fadeIn_.12s_ease]"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-label={t('selectRange')}
            className="
              z-50 border-white/[0.08] shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col
              fixed inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl border-t animate-[slideUp_.2s_ease]
              sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:mt-2 sm:max-h-none sm:rounded-2xl sm:border sm:animate-[fadeIn_.12s_ease]
            "
            style={{ background: 'rgba(13,13,15,0.97)' }}
          >
            {/* Pull handle (mobile only) */}
            <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0">
              <span className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-y-auto scroll-thin">
              {/* Atalhos */}
              <div className="sm:w-[180px] p-2 sm:border-r border-b sm:border-b-0 border-white/[0.06] flex-shrink-0">
                <p className="px-2.5 pt-1.5 pb-2 text-[10px] uppercase tracking-wider font-bold text-white/35">
                  {t('quickRanges')}
                </p>
                <div className="grid grid-cols-2 sm:flex sm:flex-col gap-0.5">
                  {PRESETS.map(p => {
                    const isActive = preset === p.key;
                    return (
                      <button
                        key={p.key}
                        onClick={() => handlePreset(p.key)}
                        className={`text-left px-2.5 py-2 sm:py-1.5 rounded-lg text-[12px] font-medium transition flex items-center justify-between
                          ${isActive
                            ? 'bg-emerald/15 text-emerald'
                            : 'text-white/70 hover:bg-white/[0.04] hover:text-white'}
                        `}
                      >
                        <span className="truncate">{t(p.key)}</span>
                        {isActive && <Check className="w-3 h-3 flex-shrink-0 ml-1" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calendário */}
              <div className="p-3 w-full sm:w-[300px] flex-shrink-0">
                <div className="flex items-center justify-between mb-3 px-1">
                  <button
                    onClick={goPrevMonth}
                    className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg border border-white/10 hover:border-white/30 text-white/60 hover:text-white flex items-center justify-center transition"
                    aria-label="Mês anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                  <p className="text-[13px] font-bold tracking-tight capitalize">{monthLabel}</p>
                  <button
                    onClick={goNextMonth}
                    className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg border border-white/10 hover:border-white/30 text-white/60 hover:text-white flex items-center justify-center transition"
                    aria-label="Próximo mês"
                  >
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-y-1 mb-1">
                  {weekDays.map((d, i) => (
                    <div key={i} className="text-center text-[9px] font-bold uppercase tracking-wider text-white/35 py-1">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0">
                  {grid.flat().map((date, i) => {
                    const inCurrentMonth = date.getMonth() === viewMonth.getMonth();
                    const isToday = sameDay(date, todayFn());
                    const isStart = sameDay(date, previewStart);
                    const isEnd = sameDay(date, effectiveEnd);
                    const inRange = previewStart && effectiveEnd && isBetween(date, previewStart, effectiveEnd);
                    const isFuture = date > todayFn();

                    let cls = 'h-9 sm:h-8 w-full flex items-center justify-center text-[12px] font-medium relative transition select-none ';
                    if (isFuture) cls += 'text-white/20 cursor-not-allowed ';
                    else if (!inCurrentMonth) cls += 'text-white/25 hover:text-white/50 cursor-pointer ';
                    else cls += 'text-white/85 hover:text-white cursor-pointer ';

                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isFuture}
                        onClick={() => handleDayClick(date)}
                        onMouseEnter={() => !pickEnd && pickStart && setHoverDate(date)}
                        className={cls}
                        aria-label={fmt(date)}
                        aria-pressed={isStart || isEnd}
                      >
                        {inRange && !isStart && !isEnd && (
                          <span className="absolute inset-y-0.5 inset-x-0 bg-emerald/10" />
                        )}
                        {(isStart || isEnd) && inRange && (
                          <span className={`absolute inset-y-0.5 ${isStart ? 'left-1/2 right-0' : 'right-1/2 left-0'} bg-emerald/10`} />
                        )}
                        {(isStart || isEnd) && (
                          <span className="absolute inset-1 rounded-lg bg-emerald shadow-[0_0_12px_rgba(16,185,129,0.35)]" />
                        )}
                        <span className={`relative z-10 ${(isStart || isEnd) ? 'text-ink-900 font-bold' : ''}`}>
                          {date.getDate()}
                        </span>
                        {isToday && !(isStart || isEnd) && (
                          <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer fixo */}
            <div className="border-t border-white/[0.06] px-4 py-3 sm:px-3 sm:py-2.5 flex items-center justify-between gap-3 bg-white/[0.02] flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-2.5">
              <p className="text-[11px] text-white/55 num truncate flex-1 min-w-0">
                {pickStart && pickEnd
                  ? formatRange(fmt(pickStart), fmt(pickEnd), lang)
                  : pickStart
                    ? t('pickEnd')
                    : t('pickStart')}
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleCancel}
                  className="px-3.5 py-2 sm:py-1.5 rounded-lg text-[12px] font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleApply}
                  disabled={!pickStart || !pickEnd}
                  className="px-4 py-2 sm:py-1.5 rounded-lg text-[12px] font-bold bg-emerald text-ink-900 hover:bg-emerald-glow transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('apply')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
