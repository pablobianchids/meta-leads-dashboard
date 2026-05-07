import { createContext, useContext, useMemo } from 'react';
import { currency as formatWithCode } from '../utils/format';

const CurrencyContext = createContext({ code: 'USD', currency: (v) => formatWithCode(v, 'USD') });

/**
 * Provider que fornece a função currency() já contextualizada com o code do
 * cliente atual. Componentes consomem via useCurrency() e não precisam
 * passar o code manualmente.
 */
export function CurrencyProvider({ code = 'USD', children }) {
  const value = useMemo(() => ({
    code,
    currency: (v) => formatWithCode(v, code)
  }), [code]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => useContext(CurrencyContext);
