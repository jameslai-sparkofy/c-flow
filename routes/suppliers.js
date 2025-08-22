const express = require('express');
const Database = require('../config/database');

const router = express.Router();

// 獲取所有供應商
router.get('/', async (req, res, next) => {
    try {
        const suppliers = await Database.all('SELECT * FROM suppliers ORDER BY created_at DESC');
        res.json({ success: true, data: suppliers });
    } catch (error) {
        next(error);
    }
});

module.exports = router;