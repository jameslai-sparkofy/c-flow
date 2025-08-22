# 🚀 Cloudflare Pages 部署指南

## 📋 部署前準備

### 1. GitHub 倉庫設置
1. 在 GitHub 上創建新倉庫：`construction-management-system`
2. 將本地代碼推送到 GitHub：

```bash
cd "/mnt/c/claude/統包工程"
git init
git add .
git commit -m "🏗️ 統包工程管理系統初始提交"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/construction-management-system.git
git push -u origin main
```

### 2. Cloudflare 帳號設置
1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 前往 **Pages** 部分
3. 點擊 **Create a project**
4. 選擇 **Connect to Git**

### 3. 獲取必要的 API 金鑰

#### Cloudflare API Token
1. 前往 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. 點擊 **Create Token**
3. 使用 **Custom token** 範本
4. 設置權限：
   - **Zone** - `Zone:Read`, `Zone:Zone Settings:Edit`
   - **Account** - `Account:Cloudflare Pages:Edit`
5. 複製生成的 API Token

#### Cloudflare Account ID
1. 在 Cloudflare Dashboard 右側邊欄找到 **Account ID**
2. 複製此 ID

## ⚙️ GitHub Secrets 設置

在您的 GitHub 倉庫中設置以下 Secrets：

1. 前往 GitHub 倉庫 → **Settings** → **Secrets and variables** → **Actions**
2. 點擊 **New repository secret** 並添加：

```
CLOUDFLARE_API_TOKEN: [您的 Cloudflare API Token]
CLOUDFLARE_ACCOUNT_ID: [您的 Cloudflare Account ID]
```

## 🔧 Cloudflare Pages 項目設置

### 方法一：通過 GitHub Actions 自動部署
1. 推送代碼到 GitHub main 分支
2. GitHub Actions 會自動運行部署流程
3. 檢查 Actions 頁面確認部署狀態

### 方法二：手動連接 Cloudflare Pages
1. 在 Cloudflare Pages 中點擊 **Create a project**
2. 選擇您的 GitHub 倉庫
3. 設置構建配置：
   ```
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```
4. 設置環境變數：
   ```
   NODE_VERSION: 18
   ENVIRONMENT: production
   ```

## 🗄️ 資料庫配置 (生產環境)

### 選項一：Cloudflare D1 (推薦)
```bash
# 安裝 Wrangler CLI
npm install -g wrangler

# 登入 Cloudflare
wrangler login

# 創建 D1 資料庫
wrangler d1 create construction-management

# 執行資料庫遷移
wrangler d1 execute construction-management --file=./database-schema.sql
```

### 選項二：Cloudflare KV (簡單存儲)
```bash
# 創建 KV 命名空間
wrangler kv:namespace create "CONSTRUCTION_DB"
wrangler kv:namespace create "CONSTRUCTION_DB" --preview
```

## 🌐 自定域名設置

1. 在 Cloudflare Pages 項目中點擊 **Custom domains**
2. 添加您的域名
3. 更新 DNS 記錄指向 Cloudflare

## 📊 監控和分析

### 啟用 Cloudflare Analytics
1. 前往項目設置
2. 啟用 **Web Analytics**
3. 配置錯誤追蹤

### 設置警報
```bash
# 使用 Wrangler 設置警報
wrangler pages deployment tail
```

## 🔐 安全配置

### 環境變數管理
在 Cloudflare Pages 設置中添加：
```
JWT_SECRET: [隨機生成的安全密鑰]
DATABASE_URL: [您的資料庫連接字串]
ADMIN_EMAIL: [管理員郵箱]
```

### CORS 設置
已在 Functions 中配置了 CORS 標頭，支持跨域請求。

## 🚀 部署流程

### 自動部署 (推薦)
```bash
# 1. 推送代碼到 GitHub
git add .
git commit -m "✨ 新功能更新"
git push origin main

# 2. GitHub Actions 自動執行：
#    - 安裝依賴
#    - 初始化資料庫
#    - 構建靜態文件
#    - 部署到 Cloudflare Pages
```

### 手動部署
```bash
# 使用 Wrangler CLI
npm run build
wrangler pages publish dist --project-name construction-management
```

## 📋 部署後檢查清單

- [ ] 網站可正常訪問
- [ ] API 端點正常回應
- [ ] 登入功能正常
- [ ] 甘特圖功能可用
- [ ] 資料庫連接正常
- [ ] HTTPS 憑證有效
- [ ] 自定域名解析正確
- [ ] 錯誤監控啟用

## 🆘 故障排除

### 常見問題

#### 1. 部署失敗
```bash
# 檢查 GitHub Actions 日誌
# 確認 Secrets 設置正確
# 檢查 Cloudflare API Token 權限
```

#### 2. API 無法訪問
```bash
# 檢查 _redirects 文件配置
# 確認 Functions 路徑正確
# 查看 Cloudflare Pages Functions 日誌
```

#### 3. 資料庫連接問題
```bash
# 檢查 D1 資料庫配置
# 確認環境變數設置
# 驗證 SQL 遷移是否成功
```

## 📞 支援資源

- [Cloudflare Pages 文檔](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文檔](https://developers.cloudflare.com/d1/)
- [GitHub Actions 文檔](https://docs.github.com/actions)
- [Wrangler CLI 文檔](https://developers.cloudflare.com/workers/wrangler/)

---

**🎉 恭喜！您的統包工程管理系統即將在 Cloudflare 上線！**