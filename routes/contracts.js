const express = require('express');
const Database = require('../config/database');

const router = express.Router();

// 獲取所有合約
router.get('/', async (req, res, next) => {
    try {
        const contracts = await Database.all('SELECT * FROM contracts ORDER BY created_at DESC');
        res.json({ success: true, data: contracts });
    } catch (error) {
        next(error);
    }
});

module.exports = router;