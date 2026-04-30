import { useState, useEffect, useCallback } from 'react';
import { fetchAds } from '../services/api';
import { getLeads, getCPL, currency, number, percent } from '../utils/format';

const extractSrc = (html) => {
  const match = html?.match(/src="([^"]+)"/);
  return match ? match[1].replace(/&amp;/g, '&') : null;
};

function AdModal({ ad, src, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="ad-modal" onClick={onClose}>
      <div className="ad-modal__content" onClick={e => e.stopPropagation()}>
        <div className="ad-modal__header">
          <div>
            <p className="ad-modal__title">{ad.name}</p>
            {ad.adset_name && <p className="ad-modal__meta">{ad.adset_name}</p>}
          </div>
          <button className="ad-modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="ad-modal__frame">
          <iframe
            src={src}
            scrolling="yes"
            title={ad.name}
            className="ad-modal__iframe"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

function AdCard({ ad }) {
  const [open, setOpen] = useState(false);
  const src = extractSrc(ad.preview);
  const ins = ad.insights;

  const leads = ins ? getLeads(ins.actions, ins.cost_per_result) : null;
  const cpl   = ins ? getCPL(ins.cost_per_result) : null;
  const spend = ins ? parseFloat(ins.spend || 0) : null;
  const ctr   = ins ? parseFloat(ins.ctr || 0) : null;
  const impr  = ins ? parseInt(ins.impressions || 0) : null;

  return (
    <>
      <div className="ad-card">
        <div className="ad-card__info">
          <span className="ad-card__badge">● Ativo</span>
          <p className="ad-card__name" title={ad.name}>{ad.name}</p>
          {ad.adset_name && <p className="ad-card__meta" title={ad.adset_name}>{ad.adset_name}</p>}
        </div>

        <div className="ad-preview-wrapper" onClick={() => src && setOpen(true)}>
          {src ? (
            <>
              <iframe
                src={src}
                scrolling="no"
                title={ad.name}
                className="ad-preview-iframe"
                tabIndex={-1}
              />
              <div className="ad-preview-overlay">
                <span className="play-btn">▶ Reproduzir</span>
              </div>
            </>
          ) : (
            <div className="ad-preview-empty">Preview indisponível</div>
          )}
        </div>

        {ins && (
          <div className="ad-metrics">
            <div className="ad-metric">
              <span className="ad-metric__label">Leads</span>
              <span className="ad-metric__value" style={{ color: '#1877F2' }}>{number(leads)}</span>
            </div>
            <div className="ad-metric">
              <span className="ad-metric__label">CPL</span>
              <span className="ad-metric__value">{cpl > 0 ? currency(cpl) : '—'}</span>
            </div>
            <div className="ad-metric">
              <span className="ad-metric__label">Gasto</span>
              <span className="ad-metric__value">{currency(spend)}</span>
            </div>
            <div className="ad-metric">
              <span className="ad-metric__label">CTR</span>
              <span className="ad-metric__value">{percent(ctr)}</span>
            </div>
            <div className="ad-metric">
              <span className="ad-metric__label">Impressões</span>
              <span className="ad-metric__value">{number(impr)}</span>
            </div>
          </div>
        )}
      </div>

      {open && src && <AdModal ad={ad} src={src} onClose={() => setOpen(false)} />}
    </>
  );
}

export default function AdPreviews({ datePreset }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchAds(datePreset)
      .then(d => {
        if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
        setAds(d.data || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [datePreset]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="table-card">
      <div className="card-title-row">
        <h2 className="card-title">Criativos em Veiculação</h2>
        {!loading && (
          <span className="ads-count">{ads.length} ativo{ads.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {loading && (
        <div className="loading-state" style={{ padding: '48px 0' }}>
          <div className="spinner" />
          <p>Carregando criativos...</p>
        </div>
      )}

      {error && <div className="error-banner">Erro: {error}</div>}

      {!loading && !error && ads.length === 0 && (
        <div className="ad-preview-empty" style={{ padding: '48px 0' }}>
          Nenhum criativo ativo no momento
        </div>
      )}

      {!loading && ads.length > 0 && (
        <div className="ads-grid">
          {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
        </div>
      )}
    </div>
  );
}
