@echo off
chcp 65001 >nul
echo 🐳 Docker Desktop 安裝程式
echo.

echo 正在檢查 Docker 安裝狀態...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker 已安裝
    docker --version
    echo.
    echo 按任意鍵繼續安裝統包管理系統...
    pause >nul
    call scripts\setup.bat
    exit /b 0
)

echo ❌ Docker 未安裝
echo.
echo 📋 安裝步驟:
echo 1. 系統將開啟 Docker Desktop 下載頁面
echo 2. 請下載並安裝 Docker Desktop
echo 3. 重新啟動電腦
echo 4. 再次運行此安裝程式
echo.
echo 按任意鍵開啟 Docker 下載頁面...
pause >nul

start https://www.docker.com/products/docker-desktop/

echo.
echo 💡 安裝提示:
echo - Windows 10/11 用戶建議安裝 WSL2
echo - 安裝完成後需要重啟電腦
echo - 重啟後再次運行此程式完成系統安裝
echo.
echo 需要技術支援? 請聯繫: support@construction.com.tw
echo.
pause