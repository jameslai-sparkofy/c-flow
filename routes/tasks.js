const express = require('express');
const Joi = require('joi');
const Database = require('../config/database');

const router = express.Router();

// 任務驗證規則
const taskSchema = Joi.object({
    project_id: Joi.number().integer().positive().required().messages({
        'any.required': '請選擇專案'
    }),
    name: Joi.string().required().messages({
        'any.required': '請輸入任務名稱'
    }),
    description: Joi.string().allow(''),
    category: Joi.string().valid('water-electric', 'masonry', 'carpentry', 'painting', 'flooring').required().messages({
        'any.required': '請選擇工程類別'
    }),
    duration: Joi.number().integer().min(1).default(1),
    planned_start_date: Joi.date().allow(null),
    planned_end_date: Joi.date().allow(null),
    status: Joi.string().valid('planned', 'in_progress', 'completed', 'blocked', 'on_hold').default('planned'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    order_index: Joi.number().integer().min(0).default(0),
    estimated_cost: Joi.number().precision(2).min(0).default(0),
    estimated_price: Joi.number().precision(2).min(0).default(0),
    assigned_master_id: Joi.number().integer().positive().allow(null),
    notes: Joi.string().allow('')
});

// 獲取任務列表
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const project_id = req.query.project_id;
        const status = req.query.status;
        const category = req.query.category;
        const search = req.query.search;

        let whereClause = '';
        let params = [];

        const conditions = [];
        
        if (project_id) {
            conditions.push('t.project_id = ?');
            params.push(project_id);
        }
        
        if (status) {
            conditions.push('t.status = ?');
            params.push(status);
        }
        
        if (category) {
            conditions.push('t.category = ?');
            params.push(category);
        }
        
        if (search) {
            conditions.push('(t.name LIKE ? OR t.description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        const sql = `
            SELECT 
                t.*,
                p.name as project_name,
                m.name as master_name,
                CASE 
                    WHEN t.category = 'water-electric' THEN '💧 水電工程'
                    WHEN t.category = 'masonry' THEN '🧱 泥作工程'
                    WHEN t.category = 'carpentry' THEN '🪵 木工工程'
                    WHEN t.category = 'painting' THEN '🎨 油漆工程'
                    WHEN t.category = 'flooring' THEN '🏠 地板工程'
                    ELSE t.category
                END as category_name
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN masters m ON t.assigned_master_id = m.id
            ${whereClause}
            ORDER BY t.project_id, t.order_index
            LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);
        const tasks = await Database.all(sql, params);

        // 獲取總數
        const countSql = `
            SELECT COUNT(*) as total
            FROM tasks t
            ${whereClause}
        `;
        const countParams = params.slice(0, -2);
        const totalResult = await Database.get(countSql, countParams);

        res.json({
            success: true,
            data: {
                tasks,
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(totalResult.total / limit),
                    total_items: totalResult.total,
                    items_per_page: limit
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// 獲取單個任務
router.get('/:id', async (req, res, next) => {
    try {
        const taskId = req.params.id;

        const sql = `
            SELECT 
                t.*,
                p.name as project_name,
                m.name as master_name,
                m.phone as master_phone,
                CASE 
                    WHEN t.category = 'water-electric' THEN '💧 水電工程'
                    WHEN t.category = 'masonry' THEN '🧱 泥作工程'
                    WHEN t.category = 'carpentry' THEN '🪵 木工工程'
                    WHEN t.category = 'painting' THEN '🎨 油漆工程'
                    WHEN t.category = 'flooring' THEN '🏠 地板工程'
                    ELSE t.category
                END as category_name
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN masters m ON t.assigned_master_id = m.id
            WHERE t.id = ?
        `;

        const task = await Database.get(sql, [taskId]);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: '任務不存在'
            });
        }

        // 獲取工單統計
        const workOrderStats = await Database.get(`
            SELECT 
                COUNT(*) as total_work_orders,
                SUM(work_hours) as total_hours,
                SUM(labor_cost) as total_labor_cost,
                SUM(material_cost) as total_material_cost,
                AVG(completion_percentage) as avg_completion
            FROM work_orders
            WHERE task_id = ?
        `, [taskId]);

        task.work_order_stats = workOrderStats;

        res.json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
});

// 創建任務
router.post('/', async (req, res, next) => {
    try {
        const { error, value } = taskSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            return next(error);
        }

        // 檢查專案是否存在
        const project = await Database.get('SELECT id FROM projects WHERE id = ?', [value.project_id]);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: '指定的專案不存在'
            });
        }

        // 如果沒有指定 order_index，則設為最後一個
        if (!value.order_index) {
            const lastTask = await Database.get(
                'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM tasks WHERE project_id = ?',
                [value.project_id]
            );
            value.order_index = lastTask.next_order;
        }

        const result = await Database.run(`
            INSERT INTO tasks (
                project_id, name, description, category, duration, 
                planned_start_date, planned_end_date, status, priority, 
                order_index, estimated_cost, estimated_price, assigned_master_id, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            value.project_id,
            value.name,
            value.description,
            value.category,
            value.duration,
            value.planned_start_date,
            value.planned_end_date,
            value.status,
            value.priority,
            value.order_index,
            value.estimated_cost,
            value.estimated_price,
            value.assigned_master_id,
            value.notes
        ]);

        const newTask = await Database.get('SELECT * FROM tasks WHERE id = ?', [result.id]);

        res.status(201).json({
            success: true,
            message: '任務創建成功',
            data: newTask
        });
    } catch (error) {
        next(error);
    }
});

// 更新任務
router.put('/:id', async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const { error, value } = taskSchema.validate(req.body);
        
        if (error) {
            error.isJoi = true;
            return next(error);
        }

        const result = await Database.run(`
            UPDATE tasks SET
                project_id = ?, name = ?, description = ?, category = ?, duration = ?,
                planned_start_date = ?, planned_end_date = ?, status = ?, priority = ?,
                order_index = ?, estimated_cost = ?, estimated_price = ?, 
                assigned_master_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            value.project_id,
            value.name,
            value.description,
            value.category,
            value.duration,
            value.planned_start_date,
            value.planned_end_date,
            value.status,
            value.priority,
            value.order_index,
            value.estimated_cost,
            value.estimated_price,
            value.assigned_master_id,
            value.notes,
            taskId
        ]);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: '任務不存在'
            });
        }

        const updatedTask = await Database.get('SELECT * FROM tasks WHERE id = ?', [taskId]);

        res.json({
            success: true,
            message: '任務更新成功',
            data: updatedTask
        });
    } catch (error) {
        next(error);
    }
});

// 更新任務順序
router.put('/:id/reorder', async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const { new_order } = req.body;

        if (typeof new_order !== 'number' || new_order < 0) {
            return res.status(400).json({
                success: false,
                message: '無效的順序值'
            });
        }

        const task = await Database.get('SELECT project_id, order_index FROM tasks WHERE id = ?', [taskId]);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: '任務不存在'
            });
        }

        await Database.executeTransaction(async () => {
            const oldOrder = task.order_index;
            const projectId = task.project_id;

            if (new_order > oldOrder) {
                // 向下移動：將介於舊位置和新位置之間的任務向上移
                await Database.run(`
                    UPDATE tasks 
                    SET order_index = order_index - 1 
                    WHERE project_id = ? AND order_index > ? AND order_index <= ?
                `, [projectId, oldOrder, new_order]);
            } else if (new_order < oldOrder) {
                // 向上移動：將介於新位置和舊位置之間的任務向下移
                await Database.run(`
                    UPDATE tasks 
                    SET order_index = order_index + 1 
                    WHERE project_id = ? AND order_index >= ? AND order_index < ?
                `, [projectId, new_order, oldOrder]);
            }

            // 更新目標任務的順序
            await Database.run('UPDATE tasks SET order_index = ? WHERE id = ?', [new_order, taskId]);
        });

        res.json({
            success: true,
            message: '任務順序更新成功'
        });
    } catch (error) {
        next(error);
    }
});

// 批量更新任務狀態
router.put('/batch/status', async (req, res, next) => {
    try {
        const { task_ids, status } = req.body;

        if (!Array.isArray(task_ids) || task_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: '請提供任務ID列表'
            });
        }

        if (!['planned', 'in_progress', 'completed', 'blocked', 'on_hold'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '無效的狀態值'
            });
        }

        const placeholders = task_ids.map(() => '?').join(',');
        const result = await Database.run(
            `UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
            [status, ...task_ids]
        );

        res.json({
            success: true,
            message: `成功更新 ${result.changes} 個任務的狀態`,
            data: {
                updated_count: result.changes
            }
        });
    } catch (error) {
        next(error);
    }
});

// 刪除任務
router.delete('/:id', async (req, res, next) => {
    try {
        const taskId = req.params.id;

        // 檢查是否有關聯的工單
        const workOrderCount = await Database.get(
            'SELECT COUNT(*) as count FROM work_orders WHERE task_id = ?', 
            [taskId]
        );
        
        if (workOrderCount.count > 0) {
            return res.status(400).json({
                success: false,
                message: '無法刪除，任務中還有工單存在'
            });
        }

        const result = await Database.run('DELETE FROM tasks WHERE id = ?', [taskId]);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: '任務不存在'
            });
        }

        res.json({
            success: true,
            message: '任務刪除成功'
        });
    } catch (error) {
        next(error);
    }
});

// 複製任務
router.post('/:id/duplicate', async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const { name_suffix = ' (副本)' } = req.body;

        const originalTask = await Database.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
        if (!originalTask) {
            return res.status(404).json({
                success: false,
                message: '原始任務不存在'
            });
        }

        // 獲取新的排序位置
        const lastTask = await Database.get(
            'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM tasks WHERE project_id = ?',
            [originalTask.project_id]
        );

        const result = await Database.run(`
            INSERT INTO tasks (
                project_id, name, description, category, duration, 
                status, priority, order_index, estimated_cost, estimated_price, 
                assigned_master_id, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            originalTask.project_id,
            originalTask.name + name_suffix,
            originalTask.description,
            originalTask.category,
            originalTask.duration,
            'planned', // 重置狀態
            originalTask.priority,
            lastTask.next_order,
            originalTask.estimated_cost,
            originalTask.estimated_price,
            originalTask.assigned_master_id,
            originalTask.notes
        ]);

        const newTask = await Database.get('SELECT * FROM tasks WHERE id = ?', [result.id]);

        res.status(201).json({
            success: true,
            message: '任務複製成功',
            data: newTask
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;