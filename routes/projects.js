const express = require('express');
const Joi = require('joi');
const Database = require('../config/database');

const router = express.Router();

// 專案驗證規則
const projectSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': '請輸入專案名稱'
    }),
    description: Joi.string().allow(''),
    client_id: Joi.number().integer().positive().allow(null),
    start_date: Joi.date().allow(null),
    planned_end_date: Joi.date().allow(null),
    status: Joi.string().valid('planned', 'in_progress', 'on_hold', 'completed', 'cancelled').default('planned'),
    budget: Joi.number().precision(2).min(0).allow(null),
    address: Joi.string().allow(''),
    contact_person: Joi.string().allow(''),
    contact_phone: Joi.string().allow('')
});

// 獲取所有專案
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status;
        const search = req.query.search;

        let whereClause = '';
        let params = [];
        
        if (status) {
            whereClause = 'WHERE p.status = ?';
            params.push(status);
        }
        
        if (search) {
            if (whereClause) {
                whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            } else {
                whereClause = 'WHERE (p.name LIKE ? OR p.description LIKE ?)';
            }
            params.push(`%${search}%`, `%${search}%`);
        }

        const sql = `
            SELECT 
                p.*,
                c.name as client_name,
                c.company_name as client_company,
                COUNT(t.id) as task_count,
                SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
            FROM projects p
            LEFT JOIN customers c ON p.client_id = c.id
            LEFT JOIN tasks t ON p.id = t.project_id
            ${whereClause}
            GROUP BY p.id, c.name, c.company_name
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);
        
        const projects = await Database.all(sql, params);

        // 獲取總數
        const countSql = `
            SELECT COUNT(DISTINCT p.id) as total
            FROM projects p
            LEFT JOIN customers c ON p.client_id = c.id
            ${whereClause}
        `;
        
        const countParams = params.slice(0, -2); // 移除 limit 和 offset
        const totalResult = await Database.get(countSql, countParams);
        const total = totalResult.total;

        res.json({
            success: true,
            data: {
                projects,
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(total / limit),
                    total_items: total,
                    items_per_page: limit
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// 獲取單個專案
router.get('/:id', async (req, res, next) => {
    try {
        const projectId = req.params.id;

        const sql = `
            SELECT 
                p.*,
                c.name as client_name,
                c.company_name as client_company,
                c.phone as client_phone,
                c.email as client_email
            FROM projects p
            LEFT JOIN customers c ON p.client_id = c.id
            WHERE p.id = ?
        `;

        const project = await Database.get(sql, [projectId]);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: '專案不存在'
            });
        }

        // 獲取專案統計
        const statsSql = `
            SELECT 
                COUNT(*) as total_tasks,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
                COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked_tasks,
                SUM(estimated_cost) as total_estimated_cost,
                SUM(actual_cost) as total_actual_cost
            FROM tasks
            WHERE project_id = ?
        `;

        const stats = await Database.get(statsSql, [projectId]);
        project.stats = stats;

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        next(error);
    }
});

// 創建專案
router.post('/', async (req, res, next) => {
    try {
        const { error, value } = projectSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            return next(error);
        }

        const result = await Database.run(`
            INSERT INTO projects (
                name, description, client_id, start_date, planned_end_date, 
                status, budget, address, contact_person, contact_phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            value.name,
            value.description,
            value.client_id,
            value.start_date,
            value.planned_end_date,
            value.status,
            value.budget,
            value.address,
            value.contact_person,
            value.contact_phone
        ]);

        const newProject = await Database.get('SELECT * FROM projects WHERE id = ?', [result.id]);

        res.status(201).json({
            success: true,
            message: '專案創建成功',
            data: newProject
        });
    } catch (error) {
        next(error);
    }
});

// 更新專案
router.put('/:id', async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const { error, value } = projectSchema.validate(req.body);
        
        if (error) {
            error.isJoi = true;
            return next(error);
        }

        const result = await Database.run(`
            UPDATE projects SET
                name = ?, description = ?, client_id = ?, start_date = ?, 
                planned_end_date = ?, status = ?, budget = ?, address = ?, 
                contact_person = ?, contact_phone = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            value.name,
            value.description,
            value.client_id,
            value.start_date,
            value.planned_end_date,
            value.status,
            value.budget,
            value.address,
            value.contact_person,
            value.contact_phone,
            projectId
        ]);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: '專案不存在'
            });
        }

        const updatedProject = await Database.get('SELECT * FROM projects WHERE id = ?', [projectId]);

        res.json({
            success: true,
            message: '專案更新成功',
            data: updatedProject
        });
    } catch (error) {
        next(error);
    }
});

// 刪除專案
router.delete('/:id', async (req, res, next) => {
    try {
        const projectId = req.params.id;

        // 檢查專案是否存在
        const project = await Database.get('SELECT id FROM projects WHERE id = ?', [projectId]);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: '專案不存在'
            });
        }

        // 檢查是否有關聯的任務
        const taskCount = await Database.get('SELECT COUNT(*) as count FROM tasks WHERE project_id = ?', [projectId]);
        if (taskCount.count > 0) {
            return res.status(400).json({
                success: false,
                message: '無法刪除，專案中還有任務存在'
            });
        }

        await Database.run('DELETE FROM projects WHERE id = ?', [projectId]);

        res.json({
            success: true,
            message: '專案刪除成功'
        });
    } catch (error) {
        next(error);
    }
});

// 獲取專案統計報告
router.get('/:id/report', async (req, res, next) => {
    try {
        const projectId = req.params.id;

        // 專案基本資訊
        const project = await Database.get(`
            SELECT p.*, c.name as client_name, c.company_name
            FROM projects p
            LEFT JOIN customers c ON p.client_id = c.id
            WHERE p.id = ?
        `, [projectId]);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: '專案不存在'
            });
        }

        // 任務統計
        const taskStats = await Database.get(`
            SELECT 
                COUNT(*) as total_tasks,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
                COUNT(CASE WHEN status = 'planned' THEN 1 END) as planned_tasks,
                COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked_tasks,
                SUM(estimated_cost) as total_estimated_cost,
                SUM(actual_cost) as total_actual_cost,
                SUM(estimated_price) as total_estimated_price,
                MIN(planned_start_date) as earliest_start,
                MAX(planned_end_date) as latest_end
            FROM tasks
            WHERE project_id = ?
        `, [projectId]);

        // 工程類別統計
        const categoryStats = await Database.all(`
            SELECT 
                category,
                COUNT(*) as task_count,
                SUM(estimated_cost) as estimated_cost,
                SUM(actual_cost) as actual_cost,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
            FROM tasks
            WHERE project_id = ?
            GROUP BY category
        `, [projectId]);

        // 師父工時統計
        const masterStats = await Database.all(`
            SELECT 
                m.name as master_name,
                COUNT(wo.id) as work_orders_count,
                SUM(wo.work_hours) as total_hours,
                SUM(wo.labor_cost) as total_labor_cost
            FROM work_orders wo
            JOIN masters m ON wo.master_id = m.id
            WHERE wo.project_id = ?
            GROUP BY m.id, m.name
        `, [projectId]);

        res.json({
            success: true,
            data: {
                project,
                task_stats: taskStats,
                category_stats: categoryStats,
                master_stats: masterStats
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;