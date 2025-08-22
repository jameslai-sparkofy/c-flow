const bcrypt = require('bcryptjs');
const Database = require('../config/database');

async function testPassword() {
    try {
        console.log('🔐 測試密碼驗證...');
        
        const user = await Database.get('SELECT * FROM users WHERE username = ?', ['admin']);
        
        if (!user) {
            console.log('❌ 用戶不存在');
            return;
        }
        
        console.log('👤 找到用戶:', user.username);
        console.log('🔒 密碼雜湊:', user.password_hash.substring(0, 20) + '...');
        
        const testPassword = 'admin123';
        const isValid = await bcrypt.compare(testPassword, user.password_hash);
        
        console.log('🧪 測試密碼:', testPassword);
        console.log('✅ 密碼驗證結果:', isValid ? '正確' : '錯誤');
        
        // 如果密碼錯誤，重新生成正確的密碼
        if (!isValid) {
            console.log('🔄 重新生成密碼...');
            const newPasswordHash = await bcrypt.hash(testPassword, 10);
            
            await Database.run('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, user.id]);
            console.log('✅ 密碼已更新');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ 測試密碼失敗:', error);
        process.exit(1);
    }
}

Database.initialize();
setTimeout(testPassword, 1000);