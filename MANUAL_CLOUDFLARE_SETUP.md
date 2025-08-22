# 📋 Cloudflare Pages 手動設定指南

由於 API Token 權限限制，我們需要手動創建 Cloudflare Pages 專案。

## 🌐 手動設定步驟

### 1. 創建 Cloudflare Pages 專案

1. 前往 [Cloudflare Pages](https://pages.cloudflare.com/)
2. 點擊 **Create a project**
3. 選擇 **Connect to Git**
4. 選擇 GitHub 並授權存取
5. 選擇倉庫：`jameslai-sparkofy/c-flow`

### 2. 建構設定

在專案設定頁面輸入：

```
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory: /
```

### 3. 環境變數

在 **Environment variables** 部分添加：

```
NODE_VERSION = 18
ENVIRONMENT = production
```

### 4. 部署

點擊 **Save and Deploy** 開始首次部署。

## 🔄 之後的自動部署

專案創建後，每次推送到 main 分支都會自動觸發部署。

## 🌐 預期的 URL

部署成功後，您的網站將可在以下 URL 訪問：
- **主要 URL**: https://c-flow.pages.dev
- **自訂域名**: 可在專案設定中添加

## ✅ 驗證清單

部署成功後請檢查：
- [ ] 首頁可正常載入
- [ ] 甘特圖功能正常
- [ ] API 端點回應正常
- [ ] 響應式設計正常
- [ ] HTTPS 正常運作