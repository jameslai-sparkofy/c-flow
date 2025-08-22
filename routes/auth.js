const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const Database = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// 登入驗證規則
const loginSchema = Joi.object({
    username: Joi.string().required().messages({
        'any.required': '請輸入用戶名'
    }),
    password: Joi.string().required().messages({
        'any.required': '請輸入密碼'
    })
});

// 註冊驗證規則
const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
        'any.required': '請輸入用戶名',
        'string.min': '用戶名至少3個字符',
        'string.max': '用戶名最多30個字符',
        'string.alphanum': '用戶名只能包含字母和數字'
    }),
    password: Joi.string().min(6).required().messages({
        'any.required': '請輸入密碼',
        'string.min': '密碼至少6個字符'
    }),
    email: Joi.string().email().required().messages({
        'any.required': '請輸入郵箱',
        'string.email': '請輸入有效的郵箱地址'
    }),
    full_name: Joi.string().required().messages({
        'any.required': '請輸入姓名'
    }),
    role: Joi.string().valid('admin', 'manager', 'user', 'viewer').default('user')
});

// 登入
router.post('/login', async (req, res, next) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            return next(error);
        }

        const { username, password } = value;

        // 查找用戶
        const user = await Database.get(
            'SELECT id, username, password_hash, email, full_name, role, status FROM users WHERE username = ?',
            [username]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用戶名或密碼錯誤'
            });
        }

        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: '帳戶已被停用'
            });
        }

        // 驗證密碼
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: '用戶名或密碼錯誤'
            });
        }

        // 更新最後登入時間
        await Database.run(
            'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // 生成JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: '登入成功',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// 註冊 (僅管理員可用)
router.post('/register', async (req, res, next) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            return next(error);
        }

        const { username, password, email, full_name, role } = value;

        // 檢查用戶名是否已存在
        const existingUser = await Database.get(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: '用戶名或郵箱已存在'
            });
        }

        // 加密密碼
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 創建用戶
        const result = await Database.run(
            'INSERT INTO users (username, password_hash, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [username, passwordHash, email, full_name, role]
        );

        res.status(201).json({
            success: true,
            message: '註冊成功',
            data: {
                user: {
                    id: result.id,
                    username,
                    email,
                    full_name,
                    role
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// 驗證token有效性
router.get('/verify', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: '未提供認證token'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token格式錯誤'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        const user = await Database.get(
            'SELECT id, username, email, full_name, role, status FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (!user || user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: '用戶不存在或已被停用'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                }
            }
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token無效或已過期'
            });
        }
        next(error);
    }
});

module.exports = router;