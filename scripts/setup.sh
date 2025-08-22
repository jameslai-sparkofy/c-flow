#!/bin/bash

# 統包工程管理系統 Docker 安裝腳本
# 使用方法: ./scripts/setup.sh

echo "🏗️ 統包工程管理系統 Docker 安裝開始..."

# 檢查 Docker 是否已安裝
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝，請先安裝 Docker"
    echo "Windows 用戶請安裝 Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# 檢查 Docker Compose 是否已安裝
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安裝，請先安裝 Docker Compose"
    exit 1
fi

echo "✅ Docker 環境檢查通過"

# 創建必要的目錄
echo "📁 創建必要的目錄..."
mkdir -p data
mkdir -p uploads
mkdir -p logs
mkdir -p backups
mkdir -p frontend/dist

# 設定權限 (Linux/Mac)
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
    chmod 755 data uploads logs backups
fi

# 創建環境變數檔案
if [ ! -f .env ]; then
    echo "⚙️ 創建環境設定檔..."
    cat > .env << EOL
# 統包工程管理系統環境變數
NODE_ENV=production
PORT=3001
JWT_SECRET=$(openssl rand -hex 32)
COMPANY_NAME=統包工程有限公司
COMPANY_EMAIL=info@construction.com.tw
COMPANY_PHONE=02-2345-6789

# 資料庫設定
DB_PATH=/app/data/construction.db

# 上傳檔案設定
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=50MB

# 郵件設定 (選填)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# 備份設定
BACKUP_INTERVAL=24h
BACKUP_RETENTION_DAYS=7
EOL
    echo "✅ 環境設定檔已創建 (.env)"
fi

# 安裝 Node.js 依賴
echo "📦 安裝 Node.js 依賴..."
if command -v npm &> /dev/null; then
    npm install
    echo "✅ Node.js 依賴安裝完成"
else
    echo "⚠️ npm 未安裝，將在 Docker 容器中安裝依賴"
fi

# 構建並啟動容器
echo "🐳 構建並啟動 Docker 容器..."
docker-compose up -d --build

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 10

# 檢查服務狀態
if docker-compose ps | grep -q "Up"; then
    echo "✅ 服務啟動成功！"
    echo ""
    echo "🌐 系統訪問地址:"
    echo "   前端: http://localhost"
    echo "   API:  http://localhost/api"
    echo "   健康檢查: http://localhost/api/health"
    echo ""
    echo "👤 預設管理員帳號:"
    echo "   用戶名: admin"
    echo "   密碼: admin123"
    echo ""
    echo "📊 管理指令:"
    echo "   查看日誌: docker-compose logs -f"
    echo "   停止服務: docker-compose down"
    echo "   重啟服務: docker-compose restart"
    echo "   備份數據: docker-compose exec backup /app/backups"
    echo ""
    echo "🎉 安裝完成！請用瀏覽器訪問 http://localhost"
else
    echo "❌ 服務啟動失敗，請檢查日誌:"
    docker-compose logs
    exit 1
fi