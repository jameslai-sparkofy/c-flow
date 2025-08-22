const fs = require('fs');
const path = require('path');
const Database = require('../config/database');

async function initializeDatabase() {
    try {
        console.log('🗄️ 開始初始化資料庫...');
        
        // 讀取 SQL 腳本
        const schemaPath = path.join(__dirname, '../database-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // 將SQL拆分成個別語句，保留多行語句
        const statements = [];
        const lines = schema.split('\n');
        let currentStatement = '';
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // 跳過註解和空行
            if (trimmedLine.startsWith('--') || trimmedLine === '') {
                continue;
            }
            
            currentStatement += line + '\n';
            
            // 如果行以分號結尾，表示語句結束
            if (trimmedLine.endsWith(';')) {
                statements.push(currentStatement.trim());
                currentStatement = '';
            }
        }

        console.log(`📄 找到 ${statements.length} 個SQL語句`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement) {
                try {
                    await Database.run(statement);
                    console.log(`✅ 執行第 ${i + 1} 個語句成功`);
                } catch (error) {
                    // 忽略 "table already exists" 錯誤
                    if (error.message.includes('already exists')) {
                        console.log(`⚠️ 第 ${i + 1} 個語句：表格已存在，跳過`);
                    } else {
                        console.error(`❌ 第 ${i + 1} 個語句執行失敗:`, error.message);
                        console.log('語句內容:', statement.substring(0, 100) + '...');
                    }
                }
            }
        }
        
        console.log('✅ 資料庫初始化完成！');
        
        // 驗證表格是否創建成功
        const tables = await Database.all(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        `);
        
        console.log('📋 已創建的表格:');
        tables.forEach(table => {
            console.log(`   - ${table.name}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ 資料庫初始化失敗:', error);
        process.exit(1);
    }
}

// 確保 Database 初始化
Database.initialize();

// 等待一秒讓資料庫連接完成
setTimeout(initializeDatabase, 1000);