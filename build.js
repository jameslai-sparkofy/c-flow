// 建構腳本 - 為 Cloudflare Pages 準備檔案
const fs = require('fs');
const path = require('path');

function buildForCloudflare() {
    console.log('🏗️ 開始建構 Cloudflare Pages 部署檔案...');
    
    // 創建 dist 目錄
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }
    
    // 複製前端檔案
    console.log('📄 複製前端檔案...');
    const publicDir = path.join(__dirname, 'public');
    if (fs.existsSync(publicDir)) {
        copyDirectory(publicDir, distDir);
    }
    
    // 複製甘特圖檔案
    const ganttFile = path.join(__dirname, 'construction-workflow-enhanced (5).html');
    if (fs.existsSync(ganttFile)) {
        fs.copyFileSync(ganttFile, path.join(distDir, 'gantt-original.html'));
    }
    
    // 複製重定向規則
    const redirectsFile = path.join(__dirname, '_redirects');
    if (fs.existsSync(redirectsFile)) {
        fs.copyFileSync(redirectsFile, path.join(distDir, '_redirects'));
    }
    
    // 創建 functions 目錄結構
    const functionsDir = path.join(distDir, 'functions', 'api');
    fs.mkdirSync(functionsDir, { recursive: true });
    
    console.log('✅ 建構完成！檔案已準備好部署到 Cloudflare Pages');
}

function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 如果直接運行此腳本
if (require.main === module) {
    buildForCloudflare();
}

module.exports = { buildForCloudflare };