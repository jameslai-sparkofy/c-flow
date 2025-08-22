const jwt = require('jsonwebtoken');
const Database = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ message: '未提供認證token' });
        }

        const token = authHeader.split(' ')[1]; // Bearer <token>
        
        if (!token) {
            return res.status(401).json({ message: 'Token格式錯誤' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 檢查用戶是否仍然存在且狀態為活躍
        const user = await Database.get(
            'SELECT id, username, email, full_name, role, status FROM users WHERE id = ? AND status = "active"',
            [decoded.userId]
        );

        if (!user) {
            return res.status(401).json({ message: '用戶不存在或已被停用' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: '無效的token' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token已過期' });
        } else {
            console.error('認證中間件錯誤:', error);
            return res.status(500).json({ message: '伺服器錯誤' });
        }
    }
};

// 角色權限中間件
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: '權限不足' });
        }
        next();
    };
};

module.exports = {
    authMiddleware,
    requireRole,
    JWT_SECRET
};