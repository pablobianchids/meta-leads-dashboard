import { useState, useEffect } from 'react';
import { Building2, ChevronRight, Menu, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

// Inicial do cliente para o avatar quando a sidebar está colapsada
const initialOf = (name = '') => (name.trim()[0] || '·').toUpperCase();

export default function Sidebar({ clients, selected, onSelect, collapsed, onToggleCollapse }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const handleSelect = (slug) => {
    onSelect(slug);
    setOpen(false);
  };

  // Bloqueia scroll do body quando o drawer mobile está aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Em mobile, ignoramos o collapsed (sempre mostra "expanded")
  // O collapsed só vale no desktop (lg+)
  const showLabels = !collapsed; // controla visibilidade no desktop

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl glass-strong flex items-center justify-center text-white/80 hover:text-white"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" strokeWidth={2.5} />
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 bottom-0 z-50 glass-strong border-r border-white/[0.06]
          flex flex-col will-change-[width,transform]
          transition-[width,transform] duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          w-[240px] ${collapsed ? 'lg:w-[64px]' : 'lg:w-[240px]'}
        `}
        aria-label="Navegação de clientes"
      >
        <div className={`relative px-3 py-4 border-b border-white/[0.06] flex items-center ${showLabels ? 'lg:px-5 lg:py-5' : 'lg:justify-center lg:px-0'}`}>
          <div className={`flex items-center gap-2.5 min-w-0 ${!showLabels ? 'lg:hidden' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-emerald/15 border border-emerald/30 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-emerald" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{t('clients')}</p>
              <p className="text-sm font-bold tracking-tight truncate">Performance</p>
            </div>
          </div>

          {/* Logo compacto quando colapsado (apenas desktop) */}
          {!showLabels && (
            <div className="hidden lg:flex w-8 h-8 rounded-lg bg-emerald/15 border border-emerald/30 items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-emerald" strokeWidth={2.5} />
            </div>
          )}

          {/* Toggle desktop (collapse/expand) */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`hidden lg:flex w-7 h-7 rounded-lg border border-white/10 hover:border-white/30 text-white/50 hover:text-white items-center justify-center transition ${showLabels ? 'ml-auto' : 'absolute -right-3 top-1/2 -translate-y-1/2 bg-ink-900 z-10'}`}
              aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
              aria-expanded={!collapsed}
              title={collapsed ? 'Expandir' : 'Recolher'}
            >
              {collapsed ? (
                <PanelLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
              ) : (
                <PanelLeftClose className="w-3.5 h-3.5" strokeWidth={2.5} />
              )}
            </button>
          )}

          {/* Fechar (mobile only) */}
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden ml-auto w-8 h-8 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 flex items-center justify-center"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <nav className={`flex-1 py-4 space-y-1 overflow-y-auto scroll-thin ${showLabels ? 'px-3' : 'lg:px-2 px-3'}`}>
          {clients.map(client => {
            const isActive = client.slug === selected;
            const initial = initialOf(client.name);
            return (
              <button
                key={client.slug}
                onClick={() => handleSelect(client.slug)}
                title={!showLabels ? client.name : undefined}
                aria-label={client.name}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  w-full group flex items-center text-left rounded-xl border transition
                  ${showLabels ? 'gap-2.5 px-3 py-2.5 justify-between' : 'lg:gap-0 lg:px-0 lg:py-2 lg:justify-center gap-2.5 px-3 py-2.5 justify-between'}
                  ${isActive
                    ? 'bg-emerald/15 border-emerald/30 text-white'
                    : 'border-transparent text-white/60 hover:bg-white/[0.04] hover:text-white hover:border-white/[0.06]'}
                `}
              >
                <div className={`flex items-center min-w-0 ${showLabels ? 'gap-2.5' : 'lg:gap-0 gap-2.5'}`}>
                  {/* Avatar com inicial — substitui o dot quando colapsado */}
                  {showLabels ? (
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald' : 'bg-white/30'}`} />
                  ) : (
                    <span
                      className={`hidden lg:flex w-9 h-9 rounded-lg items-center justify-center text-[12px] font-bold flex-shrink-0 transition
                        ${isActive
                          ? 'bg-emerald/20 border border-emerald/40 text-emerald'
                          : 'bg-white/[0.04] border border-white/[0.08] text-white/70 group-hover:border-white/[0.18]'}
                      `}
                    >
                      {initial}
                    </span>
                  )}

                  {/* Mobile sempre mostra o dot mesmo quando colapsado no desktop */}
                  {!showLabels && (
                    <span className={`lg:hidden w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald' : 'bg-white/30'}`} />
                  )}

                  <span className={`text-[13px] font-semibold truncate ${!showLabels ? 'lg:hidden' : ''}`}>
                    {client.name}
                  </span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 flex-shrink-0 transition ${isActive ? 'text-emerald translate-x-0.5' : 'text-white/30 group-hover:text-white/60'} ${!showLabels ? 'lg:hidden' : ''}`}
                  strokeWidth={2.5}
                />
              </button>
            );
          })}
        </nav>

        <div className={`border-t border-white/[0.06] ${showLabels ? 'px-5 py-4' : 'lg:py-3 lg:px-2 px-5 py-4'}`}>
          {showLabels ? (
            <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">
              {clients.length} {clients.length !== 1 ? t('clientsActivePlural') : t('clientsActive')}
            </p>
          ) : (
            <p className="hidden lg:block text-[10px] num font-bold tracking-wider text-white/30 text-center">
              {clients.length}
            </p>
          )}
          {/* Mobile sempre mostra texto completo */}
          {!showLabels && (
            <p className="lg:hidden text-[10px] uppercase tracking-wider text-white/30 font-semibold">
              {clients.length} {clients.length !== 1 ? t('clientsActivePlural') : t('clientsActive')}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
