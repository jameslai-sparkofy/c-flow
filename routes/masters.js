const express = require('express');
const Database = require('../config/database');

const router = express.Router();

// 獲取所有師父
router.get('/', async (req, res, next) => {
    try {
        const masters = await Database.all('SELECT * FROM masters ORDER BY created_at DESC');
        res.json({ success: true, data: masters });
    } catch (error) {
        next(error);
    }
});

module.exports = router;