# Múltiplos Clientes - Guia de Uso

Cada cliente tem sua própria dashboard totalmente isolada com token, dados e porta independentes.

## 📋 Clientes Configurados

| Cliente | Acessar | Backend (API) | Config |
|---------|---------|---------------|--------|
| **Lumina Dental** | http://localhost:3001 | http://localhost:3001/api | `clients/lumina-dental.env` |
| **Primordialle** | http://localhost:3002 | http://localhost:3002/api | `clients/primordialle.env` |
| **Novo Cliente** | http://localhost:3003 | http://localhost:3003/api | `clients/novo-cliente.env` |

*Em desenvolvimento, o backend (3001/3002/3003) redireciona automaticamente para o frontend.*

## 🚀 Como Usar

### Opção 1: Rodar um cliente específico
```bash
npm run dev:lumina-dental      # Lumina (portas 3001/5173)
npm run dev:primordialle       # Primordialle (portas 3002/5174)
npm run dev:novo-cliente       # Novo Cliente (portas 3003/5175)
```

### Opção 2: Rodar todos os clientes em paralelo
```bash
npm run dev:all
```

Isso inicia:
- Lumina Dental em http://localhost:3001
- Primordialle em http://localhost:3002
- Novo Cliente em http://localhost:3003

### Opção 3: Via script shell (sem npm)
```bash
chmod +x dev-all-clients.sh
./dev-all-clients.sh                          # Roda Lumina + Primordialle
./dev-all-clients.sh lumina-dental novo-cliente  # Roda clientes específicos
```

## 🔧 Adicionar Novo Cliente

1. **Criar arquivo de configuração:**
   ```bash
   cp clients/example.env clients/seu-cliente.env
   ```

2. **Preencher credenciais:**
   ```env
   CLIENT_NAME=Seu Cliente
   META_ACCESS_TOKEN=seu_token_aqui
   META_AD_ACCOUNT_ID=seu_account_id
   PORT=3004  # próxima porta disponível
   ```

3. **Adicionar script em package.json:**
   ```json
   "dev:seu-cliente": "CLIENT=seu-cliente PORT=3004 concurrently \"node server.js\" \"vite --port 5176\""
   ```

4. **Testar:**
   ```bash
   npm run dev:seu-cliente
   ```

## 📌 Importante

- **Isolamento Total**: Cada cliente tem token, dados e cache separados
- **Sem Mistura**: Dados de um cliente nunca vazam para outro
- **Portas Distintas**: Cada servidor/frontend usa porta diferente
- **Independência**: Pode parar um cliente sem afetar os outros

## 🐛 Troubleshooting

**Porta em uso?**
```bash
lsof -i :3001  # Ver qual processo usa porta 3001
kill -9 PID    # Matar processo
```

**Erro de token?**
- Verificar `clients/{cliente}.env`
- Validar `META_ACCESS_TOKEN` e `META_AD_ACCOUNT_ID`
- Testar com `curl http://localhost:3001/api/health`

**Frontend não carrega?**
- Verificar se Vite iniciou corretamente na porta 5173/5174/5175
- Limpar cache: `rm -rf node_modules/.vite`
