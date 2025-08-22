# 🏗️ 統包工程管理系統

[![Deploy to Cloudflare Pages](https://github.com/username/construction-management-system/actions/workflows/deploy.yml/badge.svg)](https://github.com/username/construction-management-system/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

一套完整的統包工程管理解決方案，集成專案管理、任務調度、供應商管理、採購報價、合約工單等全流程功能。

## 🌐 線上演示

- **正式版本**: [https://construction-management.pages.dev](https://construction-management.pages.dev)
- **開發版本**: [https://dev.construction-management.pages.dev](https://dev.construction-management.pages.dev)

### 測試帳號
```
用戶名: admin
密碼: admin123
```

## ✨ 核心功能

### 📋 專案管理
- 專案創建、編輯、狀態追蹤
- 甘特圖時程規劃與視覺化
- 專案進度統計與報表
- 客戶資訊整合

### 🔧 任務(工序)管理
- 五大工程類別：水電、泥作、木工、油漆、地板
- 拖拽式甘特圖編輯
- 任務排程與依賴關係
- 工期調整與連動更新
- 師父分派與工時追蹤

### 👥 客戶與供應商管理
- 客戶資料庫與聯絡人管理
- 供應商評等與績效追蹤
- 統一聯絡人資料庫
- 付款條件與信用管理

### 🛒 採購與報價系統
- 產品/材料資料庫
- 詢價單管理與供應商比價
- 採購單生成與追蹤
- 報價單製作與客戶管理
- 庫存管理與補貨提醒

### 📜 合約與工單系統
- 合約範本與條款管理
- 工單派發與執行追蹤
- 現場照片上傳與簽名
- 品質檢查與驗收流程
- 付款排程與發票管理

### 👷 師父資料庫
- 師父技能與專長分類
- 工時記錄與薪資計算
- 評等系統與績效考核
- 證照管理與保險資訊
- 排班與可用性管理

## 🚀 快速開始

### 系統需求
- Docker Desktop (Windows/Mac) 或 Docker + Docker Compose (Linux)
- 至少 2GB 可用記憶體
- 500MB 磁碟空間

### 一鍵安裝

#### Windows 用戶
```bash
# 下載並解壓系統檔案
# 以管理員身份運行 PowerShell 或命令提示字元
cd 統包工程
scripts\setup.bat
```

#### Linux/Mac 用戶
```bash
# 下載並解壓系統檔案
cd 統包工程
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 手動安裝

1. **下載專案**
```bash
git clone https://github.com/your-repo/construction-management.git
cd construction-management
```

2. **環境設定**
```bash
cp .env.example .env
# 編輯 .env 檔案設定您的環境變數
```

3. **啟動服務**
```bash
docker-compose up -d --build
```

4. **初始化資料**
```bash
# 系統會自動創建資料庫和預設管理員帳號
# 用戶名: admin
# 密碼: admin123
```

## 🌐 系統訪問

安裝完成後，您可以透過以下地址訪問系統：

- **前端界面**: http://localhost
- **API 接口**: http://localhost/api
- **系統狀態**: http://localhost/api/health

### 預設帳號
- **用戶名**: admin
- **密碼**: admin123

> ⚠️ **安全提醒**: 請在首次登入後立即修改預設密碼！

## 🏗️ 系統架構

```
統包工程管理系統/
├── 後端 API (Node.js + Express)
│   ├── 資料庫 (SQLite)
│   ├── 認證系統 (JWT)
│   ├── 檔案上傳
│   └── RESTful API
├── 前端界面 (Vue.js)
│   ├── 響應式設計
│   ├── 甘特圖組件
│   └── 現代化 UI
├── 容器化 (Docker)
│   ├── 應用容器
│   ├── 反向代理 (Nginx)
│   └── 自動備份
└── 資料備份
    ├── 定時備份
    └── 資料恢復
```

## 📊 功能模組

### 1. 專案管理模組
- 專案建立與設定
- 時程規劃與追蹤
- 成本預算控制
- 進度報表產出

### 2. 工序管理模組
- 五大工程分類
- 甘特圖排程工具
- 依賴關係設定
- 師父分派系統

### 3. 客戶關係模組
- 客戶資料管理
- 聯絡歷史記錄
- 信用評級系統
- 合約履約追蹤

### 4. 供應鏈模組
- 供應商資料庫
- 詢比議價系統
- 採購流程管理
- 庫存監控預警

### 5. 財務管控模組
- 報價單管理
- 合約金額控制
- 付款排程追蹤
- 成本效益分析

### 6. 現場管理模組
- 工單派發系統
- 現場進度回報
- 品質檢查表
- 照片上傳記錄

## 🔧 管理指令

### 容器管理
```bash
# 查看服務狀態
docker-compose ps

# 查看即時日誌
docker-compose logs -f

# 重啟服務
docker-compose restart

# 停止服務
docker-compose down

# 更新服務
docker-compose up -d --build
```

### 資料庫管理
```bash
# 連接到資料庫
docker-compose exec backend sqlite3 /app/data/construction.db

# 手動備份
docker-compose exec backup sqlite3 /app/data/construction.db '.backup /app/backups/manual_backup.db'

# 還原備份
docker-compose exec backend cp /app/backups/backup_file.db /app/data/construction.db
```

### 日誌查看
```bash
# API 服務日誌
docker-compose logs backend

# Nginx 日誌
docker-compose logs frontend

# 備份服務日誌
docker-compose logs backup
```

## 🔒 安全設定

### 密碼設定
1. 登入系統後立即修改預設密碼
2. 定期更新管理員密碼
3. 使用強密碼策略

### JWT 安全
- 修改 `.env` 中的 `JWT_SECRET` 為隨機字串
- 設定適當的 token 過期時間
- 定期輪換 JWT 密鑰

### 檔案上傳
- 限制上傳檔案類型
- 設定檔案大小上限
- 定期清理暫存檔案

## 📱 瀏覽器支援

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ❌ Internet Explorer (不支援)

## 🆘 常見問題

### Q: Docker 啟動失敗？
**A**: 檢查以下項目：
1. 確認 Docker Desktop 正在運行
2. 檢查埠號 80 和 3001 是否被佔用
3. 查看 `docker-compose logs` 錯誤訊息

### Q: 無法訪問系統？
**A**: 請嘗試：
1. 確認容器狀態 `docker-compose ps`
2. 檢查防火牆設定
3. 嘗試 `http://127.0.0.1` 替代 `localhost`

### Q: 資料丟失怎麼辦？
**A**: 系統提供自動備份：
1. 檢查 `backups/` 目錄
2. 使用最新備份還原資料
3. 聯繫技術支援

### Q: 如何更新系統？
**A**: 更新步驟：
1. 備份重要資料
2. 下載新版本
3. 執行 `docker-compose up -d --build`
4. 驗證系統功能

## 📞 技術支援

- 📧 **技術支援**: support@construction.com.tw
- 📱 **客服電話**: 02-2345-6789
- 🌐 **官方網站**: https://construction.com.tw
- 📖 **使用手冊**: https://docs.construction.com.tw

## 📄 版權資訊

Copyright © 2025 統包工程管理系統 - 保留所有權利

本軟體受著作權法保護，未經許可不得擅自複製、散佈或修改。

---

**🎯 讓統包工程管理變得更簡單、更高效！**# 觸發部署測試
