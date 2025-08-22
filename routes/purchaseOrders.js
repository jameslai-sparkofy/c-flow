const express = require('express');
const Database = require('../config/database');

const router = express.Router();

// 獲取所有採購單
router.get('/', async (req, res, next) => {
    try {
        const orders = await Database.all('SELECT * FROM purchase_orders ORDER BY created_at DESC');
        res.json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
});

module.exports = router;