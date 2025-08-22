const express = require('express');
const Database = require('../config/database');

const router = express.Router();

// 獲取所有報價單
router.get('/', async (req, res, next) => {
    try {
        const quotations = await Database.all('SELECT * FROM quotations ORDER BY created_at DESC');
        res.json({ success: true, data: quotations });
    } catch (error) {
        next(error);
    }
});

module.exports = router;