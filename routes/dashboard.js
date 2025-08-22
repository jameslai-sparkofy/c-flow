const express = require('express');
const Database = require('../config/database');

const router = express.Router();

// 獲取儀表板統計
router.get('/', async (req, res, next) => {
    try {
        const stats = {
            projects: { total: 0, active: 0, completed: 0 },
            tasks: { total: 0, completed: 0, in_progress: 0 },
            customers: { total: 0, active: 0 },
            masters: { total: 0, available: 0 }
        };

        // 專案統計
        const projectStats = await Database.get(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
            FROM projects
        `);
        stats.projects = projectStats;

        // 任務統計
        const taskStats = await Database.get(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress
            FROM tasks
        `);
        stats.tasks = taskStats;

        // 客戶統計
        const customerStats = await Database.get(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active
            FROM customers
        `);
        stats.customers = customerStats;

        // 師父統計
        const masterStats = await Database.get(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN availability_status = 'available' THEN 1 END) as available
            FROM masters
        `);
        stats.masters = masterStats;

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;