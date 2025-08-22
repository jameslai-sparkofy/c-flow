const Database = require('../config/database');

async function checkUsers() {
    try {
        console.log('👥 檢查用戶...');
        
        const users = await Database.all('SELECT id, username, email, full_name, role, status FROM users');
        
        console.log(`📋 找到 ${users.length} 個用戶:`);
        users.forEach(user => {
            console.log(`   - ID: ${user.id}, 用戶名: ${user.username}, 姓名: ${user.full_name}, 角色: ${user.role}, 狀態: ${user.status}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ 檢查用戶失敗:', error);
        process.exit(1);
    }
}

// 確保 Database 初始化
Database.initialize();
setTimeout(checkUsers, 1000);