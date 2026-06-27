#!/bin/bash
# =============================================================================
# GoReadCode — Script de Sincronização Linux ↔ Windows
# =============================================================================
# Linux (principal): ~/lab/goreadcode
# Windows (espelho): /mnt/c/Users/jeffe/Claude/Projects/ReadCode
# =============================================================================

LINUX_DIR="$HOME/lab/goreadcode"
WINDOWS_DIR="/mnt/c/Users/jeffe/Claude/Projects/ReadCode"

EXCLUDES=(
  --exclude='node_modules/'
  --exclude='.next/'
  --exclude='out/'
  --exclude='dist/'
  --exclude='build/'
  --exclude='.git/'
  --exclude='__pycache__/'
  --exclude='*.pyc'
  --exclude='.env.local'
  --exclude='coverage/'
  --exclude='*.log'
)

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

usage() {
  echo ""
  echo "Uso: ./sync.sh [direção]"
  echo ""
  echo "  ./sync.sh push    — Linux → Windows  (padrão)"
  echo "  ./sync.sh pull    — Windows → Linux"
  echo "  ./sync.sh status  — mostra diferenças"
  echo ""
}

sync_push() {
  echo -e "${BLUE}🔄 Sincronizando Linux → Windows...${NC}"
  echo -e "   De: ${LINUX_DIR}"
  echo -e "   Para: ${WINDOWS_DIR}"
  echo ""
  rsync -av --delete "${EXCLUDES[@]}" "${LINUX_DIR}/" "${WINDOWS_DIR}/"
  echo ""
  echo -e "${GREEN}✅ Sync Linux → Windows concluído!${NC}"
}

sync_pull() {
  echo -e "${YELLOW}🔄 Sincronizando Windows → Linux...${NC}"
  echo -e "   De: ${WINDOWS_DIR}"
  echo -e "   Para: ${LINUX_DIR}"
  echo ""
  rsync -av --delete "${EXCLUDES[@]}" "${WINDOWS_DIR}/" "${LINUX_DIR}/"
  echo ""
  echo -e "${GREEN}✅ Sync Windows → Linux concluído!${NC}"
}

sync_status() {
  echo -e "${BLUE}📊 Diferenças entre Linux e Windows:${NC}"
  echo ""
  rsync -avn --delete "${EXCLUDES[@]}" "${LINUX_DIR}/" "${WINDOWS_DIR}/" | grep -v "/$" | grep -v "^sending" | grep -v "^sent" | grep -v "^total"
}

commit_and_push() {
  echo ""
  echo -e "${BLUE}📦 Commitando e fazendo push...${NC}"
  cd "${LINUX_DIR}" || exit 1
  git add -A
  git status --short
  echo ""
  read -p "Mensagem do commit: " msg
  if [ -n "$msg" ]; then
    git commit -m "$msg"
    git push origin main
    echo -e "${GREEN}✅ Push feito!${NC}"
  else
    echo -e "${RED}❌ Commit cancelado (mensagem vazia)${NC}"
  fi
}

case "${1:-push}" in
  push)
    sync_push
    ;;
  pull)
    sync_pull
    ;;
  status)
    sync_status
    ;;
  commit)
    sync_push
    commit_and_push
    ;;
  *)
    usage
    exit 1
    ;;
esac
