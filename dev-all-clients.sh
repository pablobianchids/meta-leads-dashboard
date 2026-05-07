#!/bin/bash

# Script para rodar múltiplos clientes em paralelo
# Uso: ./dev-all-clients.sh [cliente1 cliente2 ...]
# Ou sem argumentos para rodar todos

CLIENTS=("lumina-dental" "primordialle")

# Se argumentos foram passados, usar esses
if [ $# -gt 0 ]; then
  CLIENTS=("$@")
fi

echo "🚀 Iniciando dashboards para: ${CLIENTS[*]}"
echo ""

# Mapear clients para portas (base 3000)
declare -A PORTS=(
  ["lumina-dental"]=3001
  ["primordialle"]=3002
  ["novo-cliente"]=3003
)

# Iniciar cada cliente em background
for CLIENT in "${CLIENTS[@]}"; do
  PORT=${PORTS[$CLIENT]:-3000}
  echo "📱 $CLIENT → http://localhost:$PORT"
  CLIENT=$CLIENT PORT=$PORT npm run dev:server &
done

echo ""
echo "✓ Todos os servidores iniciados!"
echo "✓ Pressione Ctrl+C para parar tudo"
echo ""

# Aguardar Ctrl+C
wait
