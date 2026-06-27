# ─── GoReadCode ───────────────────────────────────────────────────────────────
# Adicione ao seu ~/.bashrc rodando:
#   echo 'source /mnt/c/Users/jeffe/Claude/Projects/ReadCode/bashrc-snippet.sh' >> ~/.bashrc
#   source ~/.bashrc

GOREADCODE_WIN="/mnt/c/Users/jeffe/Claude/Projects/ReadCode"

# Atalho principal: sincroniza + sobe dev server
gostart() {
  bash "$GOREADCODE_WIN/start.sh" "$@"
}

# Só sync (sem dev server)
gosync() {
  bash "$GOREADCODE_WIN/start.sh" --no-dev
}

# Commit + push rápido
gopush() {
  local msg="${1:-chore: update}"
  cd ~/lab/goreadcode || return 1
  git add -A
  git commit -m "$msg"
  git push origin main
}

# Vai direto pro diretório do projeto
gocd() {
  cd ~/lab/goreadcode/readcode || true
}

echo "🚀 GoReadCode: gostart | gosync | gopush 'msg' | gocd"
# ──────────────────────────────────────────────────────────────────────────────
