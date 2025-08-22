# 🚀 統包工程管理系統 - GitHub & Cloudflare 部署步驟

## 📋 準備工作已完成 ✅

- ✅ 代碼已提交到本地 Git 倉庫
- ✅ GitHub Actions 工作流程已配置
- ✅ Cloudflare Pages 配置文件已準備
- ✅ 部署腳本已創建

## 🔄 接下來的部署步驟

### 1. 創建 GitHub 倉庫
```bash
# 在 GitHub 上創建新倉庫
# 倉庫名稱建議: construction-management-system
# 設為 Public (方便 Cloudflare Pages 存取)
```

### 2. 推送代碼到 GitHub
```bash
cd "/mnt/c/claude/統包工程"
git remote add origin https://github.com/YOUR_USERNAME/construction-management-system.git
git push -u origin main
```

### 3. 設置 GitHub Secrets
在 GitHub 倉庫中設置以下 Secrets：

1. 前往倉庫 → **Settings** → **Secrets and variables** → **Actions**
2. 點擊 **New repository secret** 添加：

```
名稱: CLOUDFLARE_API_TOKEN
值: [從 Cloudflare Dashboard 獲取的 API Token]

名稱: CLOUDFLARE_ACCOUNT_ID  
值: [從 Cloudflare Dashboard 獲取的 Account ID]
```

#### 獲取 Cloudflare API Token:
1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 前往右上角頭像 → **My Profile** → **API Tokens**
3. 點擊 **Create Token**
4. 選擇 **Custom token**
5. 設置權限：
   - **Account** → Cloudflare Pages:Edit
   - **Zone** → Zone:Read (如果需要自定域名)
6. 複製生成的 Token

#### 獲取 Account ID:
1. 在 Cloudflare Dashboard 右側邊欄可以找到 **Account ID**
2. 複製此 ID

### 4. 連接 Cloudflare Pages
1. 登入 [Cloudflare Pages](https://pages.cloudflare.com/)
2. 點擊 **Create a project**
3. 選擇 **Connect to Git**
4. 選擇您的 GitHub 倉庫
5. 配置構建設置：
   ```
   Framework preset: None
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

### 5. 設置環境變數
在 Cloudflare Pages 項目設置中添加：
```
NODE_VERSION: 18
ENVIRONMENT: production
JWT_SECRET: your-secure-jwt-secret-here
```

### 6. 觸發自動部署
```bash
# 推送任何更改到 main 分支都會觸發自動部署
git add .
git commit -m "🚀 觸發首次部署"
git push origin main
```

## 🌐 部署後的訪問方式

### 自動分配的 URL
- **主站**: `https://construction-management-system.pages.dev`
- **分支預覽**: `https://[branch-name].construction-management-system.pages.dev`

### 自定域名 (可選)
1. 在 Cloudflare Pages 項目中點擊 **Custom domains**
2. 添加您的域名 (例: `construction.yourdomain.com`)
3. 按照指示更新 DNS 記錄

## 🔧 部署狀態檢查

### GitHub Actions
- 前往倉庫 → **Actions** 查看部署狀態
- 每次推送到 main 分支都會觸發新的部署

### Cloudflare Pages
- 前往 Cloudflare Pages Dashboard 查看部署歷史
- 查看構建日誌和錯誤訊息

## 📊 功能驗證清單

部署完成後，請驗證以下功能：

- [ ] 首頁可正常訪問
- [ ] 登入功能正常 (admin/admin123)
- [ ] API 健康檢查: `/api/health`
- [ ] 甘特圖功能可用
- [ ] 響應式設計正常
- [ ] HTTPS 憑證有效

## 🆘 故障排除

### 部署失敗常見原因:
1. **GitHub Secrets 未設置或錯誤**
   - 檢查 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ACCOUNT_ID
   
2. **API Token 權限不足**
   - 確保 Token 有 Cloudflare Pages:Edit 權限
   
3. **構建錯誤**
   - 檢查 GitHub Actions 日誌
   - 確認 Node.js 版本兼容性

### 檢查部署狀態:
```bash
# 本地測試構建
npm run build

# 檢查輸出目錄
ls -la dist/
```

## 📞 支援資源

- [GitHub Actions 文檔](https://docs.github.com/actions)
- [Cloudflare Pages 文檔](https://developers.cloudflare.com/pages/)
- [Cloudflare API Token 設置](https://developers.cloudflare.com/api/tokens/create/)

---

**🎉 完成以上步驟後，您的統包工程管理系統將在 Cloudflare Pages 上線！**

需要協助設置任何步驟嗎？