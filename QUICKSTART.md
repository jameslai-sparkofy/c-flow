# 🚀 統包工程管理系統 - 快速開始

## ✅ 系統狀態

**🎉 恭喜！您的統包工程管理系統已成功運行！**

- ✅ 後端API服務運行在：http://localhost:3001
- ✅ 前端界面可訪問：http://localhost:3001
- ✅ 資料庫已初始化完成
- ✅ 管理員帳號已創建

## 🔐 登入資訊

```
用戶名: admin
密碼: admin123
角色: 系統管理員
```

## 🌐 立即開始使用

### 1. 訪問系統首頁
打開瀏覽器，訪問：**http://localhost:3001**

### 2. 登入系統
- 點擊登入區域
- 輸入用戶名：`admin`
- 輸入密碼：`admin123`
- 點擊「登入系統」

### 3. 開始管理
登入後您可以：
- 📋 創建和管理專案
- 🔧 添加工序任務
- 📊 查看甘特圖排程
- 👥 管理客戶供應商
- 💰 處理採購報價

## 🛠️ 系統管理

### 檢查系統狀態
```bash
# 查看系統健康狀況
curl http://localhost:3001/api/health

# 查看運行日誌
tail -f logs/application.log
```

### 資料庫管理
```bash
# 查看資料庫文件
ls -la data/construction.db

# 備份資料庫
cp data/construction.db backups/backup_$(date +%Y%m%d_%H%M%S).db
```

### 停止和重啟系統
```bash
# 停止系統 (Ctrl+C 或關閉終端)
# 重新啟動系統
cd "/mnt/c/claude/統包工程"
node server.js
```

## 📋 系統功能概覽

### 已實現功能
- ✅ **用戶認證系統** - JWT token 認證
- ✅ **專案管理 API** - CRUD 操作
- ✅ **任務管理 API** - 工序管理
- ✅ **甘特圖基礎** - 原始HTML版本
- ✅ **資料庫完整架構** - 18張資料表
- ✅ **REST API 端點** - 完整後端服務

### 可用的 API 端點
```
GET  /api/health           - 系統健康檢查
POST /api/auth/login       - 用戶登入
GET  /api/auth/verify      - 驗證token
GET  /api/projects         - 獲取專案列表
POST /api/projects         - 創建新專案
GET  /api/tasks            - 獲取任務列表
POST /api/tasks            - 創建新任務
GET  /api/dashboard        - 儀表板統計
GET  /api/customers        - 客戶管理
GET  /api/suppliers        - 供應商管理
... 等更多API端點
```

## 🧪 測試系統功能

### 1. 創建測試專案
```bash
# 先登入獲取 token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  jq -r '.data.token')

# 創建測試專案
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "測試住宅案",
    "description": "三房兩廳住宅裝修",
    "start_date": "2025-09-01",
    "budget": 500000,
    "address": "台北市大安區",
    "contact_person": "張先生",
    "contact_phone": "0912-345-678"
  }'
```

### 2. 創建測試任務
```bash
# 創建水電工程任務
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "name": "配電箱安裝",
    "category": "water-electric",
    "duration": 2,
    "estimated_cost": 15000,
    "estimated_price": 22000
  }'
```

## 🎯 下一步開發建議

### 立即可用功能
1. **甘特圖管理** - 原始HTML版本功能完整
2. **API 測試** - 使用 Postman 或 curl 測試所有端點
3. **資料庫管理** - 透過 API 管理所有業務數據

### 待開發功能
1. **Vue.js 前端** - 現代化單頁應用
2. **檔案上傳** - 照片和文件管理
3. **報表系統** - PDF 報表生成
4. **通知系統** - 郵件和推播通知
5. **手機APP** - React Native 或 Flutter

## 🆘 常見問題

### Q: 忘記管理員密碼怎麼辦？
```bash
cd "/mnt/c/claude/統包工程"
node scripts/test-password.js
```

### Q: 如何重置資料庫？
```bash
rm data/construction.db
node scripts/init-db.js
node scripts/create-admin.js
```

### Q: 系統無法訪問？
```bash
# 檢查系統是否運行
curl http://localhost:3001/api/health

# 檢查埠號占用
netstat -tulpn | grep :3001
```

## 📞 技術支援

- **系統架構**: Node.js + Express + SQLite
- **前端技術**: HTML5 + CSS3 + JavaScript
- **資料庫**: SQLite (開發) / MySQL/PostgreSQL (生產)
- **認證系統**: JWT Token
- **部署方式**: 本地部署 / Docker容器

---

**🏗️ 開始使用您的統包工程管理系統吧！**

訪問 http://localhost:3001 立即體驗完整功能！