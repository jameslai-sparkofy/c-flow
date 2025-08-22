# 🚀 統包工程管理系統安裝指南

## 📋 系統需求

### 硬體需求
- **CPU**: 1 核心以上
- **記憶體**: 2GB 以上
- **儲存空間**: 500MB 以上可用空間
- **網路**: 需要網路連接來下載依賴

### 軟體需求
- **作業系統**: Windows 10/11, macOS 10.14+, Ubuntu 18.04+
- **Docker Desktop** (Windows/Mac) 或 **Docker + Docker Compose** (Linux)

## 🏗️ 安裝步驟

### 方法一：一鍵安裝 (推薦)

#### Windows 用戶
1. **下載 Docker Desktop**
   ```
   如果尚未安裝 Docker，請執行：
   scripts\install-docker.bat
   ```

2. **安裝系統**
   ```batch
   # 以管理員身份打開命令提示字元或 PowerShell
   cd 統包工程
   scripts\setup.bat
   ```

#### Linux/Mac 用戶
1. **確認 Docker 安裝**
   ```bash
   # 檢查 Docker 版本
   docker --version
   docker-compose --version
   
   # 如果未安裝，請安裝 Docker 和 Docker Compose
   ```

2. **執行安裝腳本**
   ```bash
   cd 統包工程
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

### 方法二：手動安裝

#### 1. 準備環境
```bash
# 確認 Docker 和 Docker Compose 已安裝
docker --version
docker-compose --version
```

#### 2. 下載系統檔案
```bash
# 如果從 Git 倉庫下載
git clone <repository-url>
cd construction-management

# 或直接解壓縮檔案
unzip construction-management.zip
cd construction-management
```

#### 3. 環境設定
```bash
# 複製環境設定範本
cp .env.example .env

# 編輯環境變數（可選）
nano .env
```

#### 4. 建立必要目錄
```bash
mkdir -p data uploads logs backups frontend/dist
```

#### 5. 啟動系統
```bash
# 建構並啟動容器
docker-compose up -d --build

# 查看啟動狀態
docker-compose ps
```

## 🔧 設定說明

### 環境變數設定 (.env)
```bash
# 基本設定
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret-here

# 公司資訊
COMPANY_NAME=統包工程有限公司
COMPANY_EMAIL=info@construction.com.tw
COMPANY_PHONE=02-2345-6789

# 資料庫設定
DB_PATH=/app/data/construction.db

# 檔案上傳設定
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=50MB

# SMTP 郵件設定（選填）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# 備份設定
BACKUP_INTERVAL=24h
BACKUP_RETENTION_DAYS=7
```

### 埠號設定
- **前端**: http://localhost:80
- **API**: http://localhost:80/api
- **後端直接存取**: http://localhost:3001

如需變更埠號，請修改 `docker-compose.yml` 檔案。

## 🌐 系統訪問

### 首次訪問
1. 開啟瀏覽器
2. 訪問 http://localhost
3. 使用預設帳號登入：
   - **用戶名**: admin
   - **密碼**: admin123

### 功能入口
- **系統首頁**: http://localhost
- **甘特圖管理**: http://localhost/gantt.html
- **API 文件**: http://localhost/api/health
- **原始甘特圖**: http://localhost/construction-workflow-enhanced (5).html

## 🔒 安全設定

### 1. 修改預設密碼
登入系統後，立即修改管理員密碼：
1. 登入系統
2. 前往用戶設定
3. 修改密碼為強密碼

### 2. 更新 JWT 密鑰
```bash
# 生成新的 JWT 密鑰
openssl rand -hex 32

# 更新 .env 檔案中的 JWT_SECRET
# 重新啟動系統
docker-compose restart
```

### 3. 設定 HTTPS (生產環境)
修改 `nginx.conf` 添加 SSL 設定：
```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ... 其他設定
}
```

## 🛠️ 管理指令

### 容器管理
```bash
# 查看運行狀態
docker-compose ps

# 查看即時日誌
docker-compose logs -f

# 重啟所有服務
docker-compose restart

# 停止所有服務
docker-compose down

# 停止並清理
docker-compose down -v
```

### 資料管理
```bash
# 進入後端容器
docker-compose exec backend bash

# 連接資料庫
docker-compose exec backend sqlite3 /app/data/construction.db

# 手動備份
docker-compose exec backup sqlite3 /app/data/construction.db \
  '.backup /app/backups/manual_backup.db'

# 查看備份檔案
ls -la backups/
```

### 日誌查看
```bash
# 查看後端日誌
docker-compose logs backend

# 查看前端日誌
docker-compose logs frontend

# 查看備份日誌
docker-compose logs backup

# 查看最新 50 行日誌
docker-compose logs --tail=50 -f backend
```

## 🔄 更新升級

### 1. 備份資料
```bash
# 備份資料庫
cp data/construction.db backups/upgrade_backup_$(date +%Y%m%d).db

# 備份上傳檔案
tar -czf backups/uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

### 2. 下載新版本
```bash
# 停止服務
docker-compose down

# 備份當前版本
cp -r . ../construction-management-backup

# 更新程式碼
git pull origin main
# 或者解壓新版本檔案
```

### 3. 升級系統
```bash
# 重新建構並啟動
docker-compose up -d --build

# 檢查狀態
docker-compose ps
docker-compose logs -f
```

## 🆘 故障排除

### 常見問題

#### 1. 容器啟動失敗
```bash
# 檢查錯誤訊息
docker-compose logs

# 檢查埠號衝突
netstat -tulpn | grep :80
netstat -tulpn | grep :3001

# 清理並重新啟動
docker-compose down
docker system prune -f
docker-compose up -d --build
```

#### 2. 資料庫連接失敗
```bash
# 檢查資料目錄權限
ls -la data/

# 重新創建資料庫
docker-compose exec backend rm -f /app/data/construction.db
docker-compose restart backend
```

#### 3. 前端無法訪問
```bash
# 檢查 Nginx 狀態
docker-compose logs frontend

# 檢查防火牆設定
sudo ufw status

# 嘗試不同訪問方式
curl http://localhost/api/health
curl http://127.0.0.1/api/health
```

#### 4. 上傳檔案失敗
```bash
# 檢查上傳目錄權限
ls -la uploads/

# 修正權限
chmod 755 uploads/
```

### 效能調優

#### 1. 記憶體優化
修改 `docker-compose.yml`:
```yaml
backend:
  deploy:
    resources:
      limits:
        memory: 512M
      reservations:
        memory: 256M
```

#### 2. 資料庫優化
```sql
-- 進入資料庫執行
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=10000;
PRAGMA temp_store=memory;
```

## 📞 技術支援

### 獲取支援
- **Email**: support@construction.com.tw
- **電話**: 02-2345-6789
- **線上文件**: https://docs.construction.com.tw

### 提供資訊
報告問題時，請提供：
1. 作業系統版本
2. Docker 版本
3. 錯誤日誌 (`docker-compose logs`)
4. 瀏覽器控制台錯誤
5. 操作步驟

### 社群支援
- **GitHub Issues**: 報告 Bug 和功能請求
- **討論區**: 技術討論和經驗分享
- **用戶手冊**: 詳細使用說明

---

**🎉 安裝完成後，您就可以開始使用統包工程管理系統了！**