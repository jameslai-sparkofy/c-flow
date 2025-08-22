# 使用官方 Node.js 18 Alpine 映像作為基礎映像
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 安裝系統依賴（用於 SQLite 和 Sharp）
RUN apk add --no-cache \
    sqlite \
    python3 \
    make \
    g++

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝 Node.js 依賴
RUN npm ci --only=production

# 複製應用程式碼
COPY . .

# 創建必要的目錄
RUN mkdir -p data uploads logs

# 設定權限
RUN chmod -R 755 data uploads logs

# 暴露端口
EXPOSE 3001

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=3001

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# 啟動應用
CMD ["npm", "start"]