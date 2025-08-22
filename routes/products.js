const express = require('express');
const Database = require('../config/database');

const router = express.Router();

// 獲取所有產品
router.get('/', async (req, res, next) => {
    try {
        const products = await Database.all('SELECT * FROM products ORDER BY created_at DESC');
        res.json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
});

module.exports = router;