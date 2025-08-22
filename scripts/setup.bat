@echo off
chcp 65001 >nul
echo 🏗️ 統包工程管理系統 Docker 安裝開始...
echo.

REM 檢查 Docker 是否已安裝
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker 未安裝，請先安裝 Docker Desktop
    echo    下載地址: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM 檢查 Docker Compose 是否已安裝
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose 未安裝，請先安裝 Docker Compose
    pause
    exit /b 1
)

echo ✅ Docker 環境檢查通過
echo.

REM 創建必要的目錄
echo 📁 創建必要的目錄...
if not exist "data" mkdir data
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "backups" mkdir backups
if not exist "frontend" mkdir frontend
if not exist "frontend\dist" mkdir frontend\dist

REM 創建環境變數檔案
if not exist ".env" (
    echo ⚙️ 創建環境設定檔...
    (
        echo # 統包工程管理系統環境變數
        echo NODE_ENV=production
        echo PORT=3001
        echo JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production-12345678
        echo COMPANY_NAME=統包工程有限公司
        echo COMPANY_EMAIL=info@construction.com.tw
        echo COMPANY_PHONE=02-2345-6789
        echo.
        echo # 資料庫設定
        echo DB_PATH=/app/data/construction.db
        echo.
        echo # 上傳檔案設定
        echo UPLOAD_PATH=/app/uploads
        echo MAX_FILE_SIZE=50MB
        echo.
        echo # 郵件設定 ^(選填^)
        echo SMTP_HOST=
        echo SMTP_PORT=587
        echo SMTP_USER=
        echo SMTP_PASS=
        echo SMTP_FROM=
        echo.
        echo # 備份設定
        echo BACKUP_INTERVAL=24h
        echo BACKUP_RETENTION_DAYS=7
    ) > .env
    echo ✅ 環境設定檔已創建 ^(.env^)
)

REM 檢查 npm
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 📦 安裝 Node.js 依賴...
    npm install
    echo ✅ Node.js 依賴安裝完成
) else (
    echo ⚠️ npm 未安裝，將在 Docker 容器中安裝依賴
)

REM 構建並啟動容器
echo.
echo 🐳 構建並啟動 Docker 容器...
docker-compose up -d --build

REM 等待服務啟動
echo ⏳ 等待服務啟動...
timeout /t 10 /nobreak >nul

REM 檢查服務狀態
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo.
    echo ✅ 服務啟動成功！
    echo.
    echo 🌐 系統訪問地址:
    echo    前端: http://localhost
    echo    API:  http://localhost/api
    echo    健康檢查: http://localhost/api/health
    echo.
    echo 👤 預設管理員帳號:
    echo    用戶名: admin
    echo    密碼: admin123
    echo.
    echo 📊 管理指令:
    echo    查看日誌: docker-compose logs -f
    echo    停止服務: docker-compose down
    echo    重啟服務: docker-compose restart
    echo.
    echo 🎉 安裝完成！請用瀏覽器訪問 http://localhost
    echo.
    echo 按任意鍵開啟瀏覽器...
    pause >nul
    start http://localhost
) else (
    echo.
    echo ❌ 服務啟動失敗，請檢查日誌:
    docker-compose logs
    echo.
    pause
)

echo.
pause