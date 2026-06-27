#!/bin/bash
# =============================================================================
# GoReadCode — Inicialização de sessão de desenvolvimento
# =============================================================================
# Uso: ./start.sh          (sync + npm run dev)
#      ./start.sh --no-dev (só sync, sem dev server)
# =============================================================================

set -e

LINUX_DIR="$HOME/lab/goreadcode"
WINDOWS_DIR="/mnt/c/Users/jeffe/Claude/Projects/ReadCode"
APP_DIR="$LINUX_DIR/readcode"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

NO_DEV=false
[[ "$1" == "--no-dev" ]] && NO_DEV=true

echo ""
echo -e "${BOLD}🚀 GoReadCode — Iniciando sessão${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Criar dir Linux se não existir
if [ ! -d "$LINUX_DIR" ]; then
  echo -e "${YELLOW}📁 Criando $LINUX_DIR...${NC}"
  mkdir -p "$LINUX_DIR"
fi

# 2. Sync Windows → Linux
echo -e "${BLUE}🔄 Sincronizando Windows → Linux...${NC}"
rsync -a --delete \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='out/' \
  --exclude='.git/' \
  --exclude='*.log' \
  --exclude='.env.local' \
  "$WINDOWS_DIR/" "$LINUX_DIR/"
echo -e "${GREEN}✅ Sync OK${NC}"

# 3. Git init se necessário
if [ ! -d "$LINUX_DIR/.git" ]; then
  echo -e "${YELLOW}🔧 Inicializando git...${NC}"
  cd "$LINUX_DIR"
  git init
  git remote add origin https://github.com/Comin92/goreadcode.git
  git checkout -b main 2>/dev/null || true
  echo -e "${GREEN}✅ Git OK${NC}"
fi

# 4. npm install se node_modules não existe
if [ ! -d "$APP_DIR/node_modules" ]; then
  echo -e "${BLUE}📦 Instalando dependências...${NC}"
  cd "$APP_DIR"
  npm install
  echo -e "${GREEN}✅ npm install OK${NC}"
fi

# 5. Verificar TypeScript
echo -e "${BLUE}🔍 TypeScript check...${NC}"
cd "$APP_DIR"
result=$(npx tsc --noEmit 2>&1)
if [ -z "$result" ]; then
  echo -e "${GREEN}✅ TypeScript: 0 erros${NC}"
else
  echo -e "${YELLOW}⚠️  TypeScript:${NC}"
  echo "$result"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 6. Dev server
if [ "$NO_DEV" = false ]; then
  echo -e "${GREEN}${BOLD}▶ Iniciando dev server em http://localhost:3000${NC}"
  echo -e "${YELLOW}  Ctrl+C para parar${NC}"
  echo ""
  cd "$APP_DIR"
  npm run dev
else
  echo -e "${GREEN}✅ Pronto! (sem dev server — rode: cd ~/lab/goreadcode/readcode && npm run dev)${NC}"
fi
