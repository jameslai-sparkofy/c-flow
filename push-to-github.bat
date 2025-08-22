@echo off
chcp 65001 >nul
echo 🚀 統包工程管理系統 - GitHub 推送腳本
echo.

echo 📝 請先在 GitHub 上創建倉庫：construction-management-system
echo    前往：https://github.com/new
echo.

set /p username="請輸入您的 GitHub 用戶名: "
if "%username%"=="" (
    echo ❌ 用戶名不能為空
    pause
    exit /b 1
)

echo.
echo 🔗 設置遠端倉庫...
git remote add origin https://github.com/%username%/construction-management-system.git

echo.
echo 📤 推送代碼到 GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ 代碼推送成功！
    echo 🌐 倉庫地址：https://github.com/%username%/construction-management-system
    echo.
    echo 📋 下一步：設置 Cloudflare Pages
    echo    1. 前往：https://pages.cloudflare.com
    echo    2. 點擊 "Create a project"
    echo    3. 選擇 "Connect to Git"
    echo    4. 選擇剛才創建的倉庫
    echo.
) else (
    echo.
    echo ❌ 推送失敗！請檢查：
    echo    1. GitHub 倉庫是否已創建
    echo    2. 用戶名是否正確
    echo    3. 是否有推送權限
    echo.
)

echo 按任意鍵繼續...
pause >nul