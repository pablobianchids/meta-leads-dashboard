// Helpers para o DateRangePicker. Trabalha com strings YYYY-MM-DD em local time
// para evitar shifts de timezone (a Meta interpreta no fuso da conta).

export const fmt = (d) => {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const parse = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const sameDay = (a, b) => a && b && fmt(a) === fmt(b);

export const isBetween = (date, start, end) => {
  if (!date || !start || !end) return false;
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
};

// Lista de presets disponíveis no picker (compatíveis com a Meta Marketing API)
export const PRESETS = [
  { key: 'today',                 metaPreset: 'today' },
  { key: 'yesterday',              metaPreset: 'yesterday' },
  { key: 'last_7d',                metaPreset: 'last_7d' },
  { key: 'last_30d',               metaPreset: 'last_30d' },
  { key: 'this_week_mon_sun',      metaPreset: 'this_week_mon_sun' },
  { key: 'last_week_mon_sun',      metaPreset: 'last_week_mon_sun' },
  { key: 'this_month',             metaPreset: 'this_month' },
  { key: 'last_month',             metaPreset: 'last_month' },
  { key: 'this_quarter',           metaPreset: 'this_quarter' },
  { key: 'this_year',              metaPreset: 'this_year' }
];

// Calcula intervalo {since, until} a partir de um preset.
// Mantemos a mesma lógica do backend (getPreviousRange) — para preview.
export const presetRange = (preset) => {
  const t = today();
  const fmtAddDays = (n) => fmt(addDays(t, n));
  switch (preset) {
    case 'today':              return { since: fmt(t), until: fmt(t) };
    case 'yesterday':          return { since: fmtAddDays(-1), until: fmtAddDays(-1) };
    case 'last_7d':            return { since: fmtAddDays(-7), until: fmtAddDays(-1) };
    case 'last_30d':           return { since: fmtAddDays(-30), until: fmtAddDays(-1) };
    case 'this_week_mon_sun': {
      const day = t.getDay() === 0 ? 7 : t.getDay();
      return { since: fmt(addDays(t, -(day - 1))), until: fmt(t) };
    }
    case 'last_week_mon_sun': {
      const day = t.getDay() === 0 ? 7 : t.getDay();
      const lastSun = addDays(t, -day);
      const lastMon = addDays(lastSun, -6);
      return { since: fmt(lastMon), until: fmt(lastSun) };
    }
    case 'this_month': {
      const start = new Date(t.getFullYear(), t.getMonth(), 1);
      return { since: fmt(start), until: fmt(t) };
    }
    case 'last_month': {
      const start = new Date(t.getFullYear(), t.getMonth() - 1, 1);
      const end = new Date(t.getFullYear(), t.getMonth(), 0);
      return { since: fmt(start), until: fmt(end) };
    }
    case 'this_quarter': {
      const q = Math.floor(t.getMonth() / 3);
      const start = new Date(t.getFullYear(), q * 3, 1);
      return { since: fmt(start), until: fmt(t) };
    }
    case 'this_year': {
      const start = new Date(t.getFullYear(), 0, 1);
      return { since: fmt(start), until: fmt(t) };
    }
    default: return { since: fmtAddDays(-30), until: fmtAddDays(-1) };
  }
};

// Formato de exibição: "01 Mai 2026 - 07 Mai 2026"
export const formatRange = (since, until, lang = 'pt') => {
  if (!since || !until) return '';
  const a = parse(since);
  const b = parse(until);
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  const opts = { day: '2-digit', month: 'short' };
  const yearOpts = { day: '2-digit', month: 'short', year: 'numeric' };
  if (sameDay(a, b)) {
    return new Intl.DateTimeFormat(locale, yearOpts).format(a);
  }
  if (a.getFullYear() === b.getFullYear()) {
    return `${new Intl.DateTimeFormat(locale, opts).format(a)} – ${new Intl.DateTimeFormat(locale, yearOpts).format(b)}`;
  }
  return `${new Intl.DateTimeFormat(locale, yearOpts).format(a)} – ${new Intl.DateTimeFormat(locale, yearOpts).format(b)}`;
};

// Constrói matriz 6x7 do mês para renderizar o calendário
export const buildMonthGrid = (year, month) => {
  const firstOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstOfMonth.getDay(); // 0 = domingo
  // Começa na segunda-feira (offset = (dayOfWeek + 6) % 7)
  const offset = (dayOfWeek + 6) % 7;
  const start = addDays(firstOfMonth, -offset);
  const grid = [];
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(addDays(start, w * 7 + d));
    }
    grid.push(week);
  }
  return grid;
};
