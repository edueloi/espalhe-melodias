#!/bin/bash
# ============================================================
# Espalhe Melodias — Script de Deploy na VPS
# ============================================================
# Uso:
#   1. Suba os arquivos do server/ para a VPS
#   2. Configure o .env com os dados reais
#   3. Execute: bash deploy-vps.sh
# ============================================================

set -e  # Para em qualquer erro

echo ""
echo "🎵  Espalhe Melodias — Deploy VPS"
echo "======================================"

# ── 1. Verificar Node.js ──────────────────────────────────────────────────────

echo ""
echo "1️⃣   Verificando Node.js..."
node --version || { echo "❌ Node.js não encontrado. Instale Node 18+"; exit 1; }
npm --version

# ── 2. Instalar dependências ──────────────────────────────────────────────────

echo ""
echo "2️⃣   Instalando dependências..."
npm install --omit=dev

# ── 3. Build TypeScript ───────────────────────────────────────────────────────

echo ""
echo "3️⃣   Compilando TypeScript..."
npm install --include=dev  # precisa do tsx/typescript para build
npm run build
echo "✅  Build concluído em dist/"

# ── 4. Criar banco e tabelas ──────────────────────────────────────────────────

echo ""
echo "4️⃣   Rodando migrations (criar tabelas)..."
NODE_ENV=production node scripts/migrate.js

# ── 5. Popular dados iniciais (apenas primeira vez) ───────────────────────────

echo ""
echo "5️⃣   Rodando seed (dados iniciais)..."
echo "   (Ignorado se dados já existem)"
NODE_ENV=production node scripts/seed.js

# ── 6. Criar pasta de logs ────────────────────────────────────────────────────

echo ""
echo "6️⃣   Preparando diretório de logs..."
mkdir -p logs

# ── 7. Instalar/reiniciar PM2 ─────────────────────────────────────────────────

echo ""
echo "7️⃣   Iniciando com PM2..."
if ! command -v pm2 &> /dev/null; then
  echo "   Instalando PM2 globalmente..."
  npm install -g pm2
fi

# Para o app se já estiver rodando
pm2 stop espalhe-melodias-api 2>/dev/null || true
pm2 delete espalhe-melodias-api 2>/dev/null || true

# Inicia com as configurações de produção
pm2 start ecosystem.config.js --env production

# Salva a configuração do PM2 (reinicia com o servidor)
pm2 save
pm2 startup 2>/dev/null || true

echo ""
echo "======================================"
echo "🎉  Deploy concluído com sucesso!"
echo ""
echo "   API rodando em: http://localhost:3001"
echo "   Health check:   curl http://localhost:3001/health"
echo "   Logs:           pm2 logs espalhe-melodias-api"
echo "   Status:         pm2 status"
echo ""
echo "   Credenciais admin:"
echo "   Email: psikarengomes.tcc@gmail.com"
echo "   Senha: (definida no .env DEFAULT_ADMIN_PASSWORD)"
echo "======================================"
