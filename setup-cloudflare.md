# 🚀 Cloudflare Pages 自動部署設定指南

## 📝 設定步驟

### 1. 獲取 Cloudflare API Token

1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 右上角頭像 → **My Profile** → **API Tokens**
3. 點擊 **Create Token**
4. 選擇 **Custom token**
5. 設定權限：
   ```
   Account - Cloudflare Pages:Edit
   Zone - Zone:Read (如果需要自定域名)
   ```
6. 複製生成的 Token

### 2. 獲取 Account ID

在 Cloudflare Dashboard 右側邊欄找到 **Account ID** 並複製

### 3. 設定 GitHub Secrets

我現在將為您自動設定 GitHub Secrets：

**設定的 Secrets：**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### 4. 觸發部署

設定完成後，任何推送到 main 分支的更改都會自動觸發部署。