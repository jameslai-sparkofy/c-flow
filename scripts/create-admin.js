const bcrypt = require('bcryptjs');
const Database = require('../config/database');

async function createAdmin() {
    try {
        console.log('👤 創建管理員用戶...');
        
        // 檢查是否已有管理員
        const existingAdmin = await Database.get('SELECT id FROM users WHERE username = ?', ['admin']);
        
        if (existingAdmin) {
            console.log('⚠️ 管理員用戶已存在，跳過創建');
            return;
        }
        
        // 加密密碼
        const password = 'admin123';
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // 創建管理員用戶
        const result = await Database.run(`
            INSERT INTO users (username, password_hash, email, full_name, role, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `, ['admin', passwordHash, 'admin@construction.com.tw', '系統管理員', 'admin', 'active']);
        
        console.log('✅ 管理員用戶創建成功！');
        console.log('📋 登入資訊:');
        console.log('   用戶名: admin');
        console.log('   密碼: admin123');
        console.log('   角色: 系統管理員');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ 創建管理員失敗:', error);
        process.exit(1);
    }
}

// 確保 Database 初始化
Database.initialize();

// 等待一秒讓資料庫連接完成
setTimeout(createAdmin, 1000);