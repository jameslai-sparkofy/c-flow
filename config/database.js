const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, '../data/construction.db');
    }

    initialize() {
        // 確保data目錄存在
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                console.error('❌ 資料庫連接失敗:', err.message);
            } else {
                console.log('✅ SQLite資料庫連接成功');
                this.runMigrations();
            }
        });

        // 啟用外鍵約束
        this.db.run("PRAGMA foreign_keys = ON");
    }

    async runMigrations() {
        try {
            const schemaPath = path.join(__dirname, '../database-schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf8');
                
                // 將SQL拆分成個別語句
                const statements = schema
                    .split(';')
                    .map(stmt => stmt.trim())
                    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

                for (const statement of statements) {
                    if (statement.trim()) {
                        await this.run(statement);
                    }
                }
                console.log('✅ 資料庫遷移完成');
            }
        } catch (error) {
            console.error('❌ 資料庫遷移失敗:', error);
        }
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // 事務支援
    async beginTransaction() {
        await this.run('BEGIN TRANSACTION');
    }

    async commit() {
        await this.run('COMMIT');
    }

    async rollback() {
        await this.run('ROLLBACK');
    }

    // 執行事務
    async executeTransaction(callback) {
        try {
            await this.beginTransaction();
            const result = await callback();
            await this.commit();
            return result;
        } catch (error) {
            await this.rollback();
            throw error;
        }
    }
}

// 單例模式
const database = new Database();

module.exports = database;