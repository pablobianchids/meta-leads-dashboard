import { createContext, useContext, useMemo } from 'react';
import { currency as formatWithCode } from '../utils/format';

/**
 * Provider que expõe configurações por cliente:
 *  - currency.code / currency()
 *  - leadActionType (action_type customizado da Meta para "lead")
 *
 * Receba o objeto `client` retornado por /api/clients. Componentes consomem
 * via useCurrency() (compat) ou useClientConfig() (mais granular).
 */
const ClientConfigContext = createContext({
  currencyCode: 'USD',
  currency: (v) => formatWithCode(v, 'USD'),
  leadActionType: null
});

export function CurrencyProvider({ client, children }) {
  const value = useMemo(() => {
    const code = (client?.currency || 'USD').toUpperCase();
    return {
      currencyCode: code,
      currency: (v) => formatWithCode(v, code),
      leadActionType: client?.leadActionType || null
    };
  }, [client?.currency, client?.leadActionType]);

  return <ClientConfigContext.Provider value={value}>{children}</ClientConfigContext.Provider>;
}

// API pública
export const useClientConfig = () => useContext(ClientConfigContext);

// Retrocompat: usado em vários componentes
export const useCurrency = () => {
  const ctx = useContext(ClientConfigContext);
  return { code: ctx.currencyCode, currency: ctx.currency };
};
