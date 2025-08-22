const express = require('express');
const Joi = require('joi');
const Database = require('../config/database');

const router = express.Router();

// 客戶驗證規則
const customerSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': '請輸入客戶姓名'
    }),
    company_name: Joi.string().allow(''),
    contact_person: Joi.string().allow(''),
    phone: Joi.string().allow(''),
    mobile: Joi.string().allow(''),
    email: Joi.string().email().allow('').messages({
        'string.email': '請輸入有效的郵箱地址'
    }),
    address: Joi.string().allow(''),
    tax_id: Joi.string().allow(''),
    payment_terms: Joi.string().allow(''),
    credit_limit: Joi.number().precision(2).min(0).allow(null),
    customer_type: Joi.string().valid('individual', 'company').default('individual'),
    status: Joi.string().valid('active', 'inactive', 'blacklisted').default('active'),
    notes: Joi.string().allow('')
});

// 獲取所有客戶
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
            whereClause = 'WHERE status = ?';
            params.push(status);
        }
        
        if (search) {
            if (whereClause) {
                whereClause += ' AND (name LIKE ? OR company_name LIKE ? OR email LIKE ?)';
            } else {
                whereClause = 'WHERE (name LIKE ? OR company_name LIKE ? OR email LIKE ?)';
            }
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const sql = `SELECT * FROM customers ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        
        const customers = await Database.all(sql, params);

        // 獲取總數
        const countSql = `SELECT COUNT(*) as total FROM customers ${whereClause}`;
        const countParams = params.slice(0, -2);
        const totalResult = await Database.get(countSql, countParams);

        res.json({
            success: true,
            data: {
                customers,
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

// 創建客戶
router.post('/', async (req, res, next) => {
    try {
        const { error, value } = customerSchema.validate(req.body);
        if (error) {
            error.isJoi = true;
            return next(error);
        }

        const result = await Database.run(`
            INSERT INTO customers (
                name, company_name, contact_person, phone, mobile, email, 
                address, tax_id, payment_terms, credit_limit, customer_type, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            value.name, value.company_name, value.contact_person, value.phone,
            value.mobile, value.email, value.address, value.tax_id,
            value.payment_terms, value.credit_limit, value.customer_type,
            value.status, value.notes
        ]);

        const newCustomer = await Database.get('SELECT * FROM customers WHERE id = ?', [result.id]);

        res.status(201).json({
            success: true,
            message: '客戶創建成功',
            data: newCustomer
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;