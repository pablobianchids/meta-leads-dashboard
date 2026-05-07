import { useState, useRef, useEffect } from 'react';
import { RefreshCw, Activity, ChevronDown, Check } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import DateRangePicker from './DateRangePicker';

const LANGS = [
  { code: 'pt', flag: '🇧🇷', label: 'PT' },
  { code: 'en', flag: '🇺🇸', label: 'EN' }
];

function LanguageSwitcher({ lang, onChange, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGS.find(l => l.code === lang) || LANGS[0];

  // Fechar ao clicar fora ou pressionar Escape
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="glass flex items-center gap-2 pl-2.5 pr-2 py-2 text-sm font-medium text-white/90 cursor-pointer outline-none focus-visible:border-emerald/50 hover:border-white/[0.18] transition rounded-xl"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base leading-none" aria-hidden="true">{current.flag}</span>
        <span className="text-[12px] font-bold tracking-wide">{current.label}</span>
        <ChevronDown className={`w-3 h-3 text-white/50 transition ${open ? 'rotate-180' : ''}`} strokeWidth={2.5} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 top-full mt-1.5 z-30 min-w-[120px] rounded-xl border border-white/[0.08] bg-ink-900/95 backdrop-blur-xl shadow-2xl py-1 animate-[fadeIn_.12s_ease]"
          style={{ background: 'rgba(16,16,18,0.96)' }}
        >
          {LANGS.map(l => {
            const isActive = l.code === lang;
            return (
              <li key={l.code} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => { onChange(l.code); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition
                    ${isActive ? 'text-emerald' : 'text-white/80 hover:bg-white/[0.04] hover:text-white'}
                  `}
                >
                  <span className="text-base leading-none" aria-hidden="true">{l.flag}</span>
                  <span className="text-[12px] font-bold tracking-wide flex-1">{l.label}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-emerald" strokeWidth={3} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function Header({ clientName, datePreset, customRange, onDateChange, lastUpdated, loading, onRefresh }) {
  const { t, lang, setLang } = useI18n();

  const formatTime = (d) =>
    d?.toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-7 mb-6 border-b border-white/[0.06]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-11 h-11 rounded-2xl bg-emerald/10 border border-emerald/30 flex items-center justify-center flex-shrink-0">
          <Activity className="w-5 h-5 text-emerald" strokeWidth={2.5} />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald animate-pulse" />
        </div>
        <div className="min-w-0">
          <h1 className="text-[19px] font-bold tracking-tight truncate">{clientName}</h1>
          <p className="text-xs text-white/40 font-medium tracking-wide uppercase">{t('performanceDashboard')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        <DateRangePicker
          preset={datePreset}
          customRange={customRange}
          onChange={onDateChange}
        />

        <LanguageSwitcher lang={lang} onChange={setLang} label={t('language')} />

        {lastUpdated && (
          <span className="hidden md:inline text-[11px] text-white/40 num">
            {t('updatedAt')} {formatTime(lastUpdated)}
          </span>
        )}

        <button
          onClick={onRefresh}
          disabled={loading}
          className="glass w-10 h-10 flex items-center justify-center text-white/60 hover:text-emerald hover:border-emerald/40 transition disabled:opacity-50"
          title={t('refresh')}
          aria-label={t('refresh')}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}
