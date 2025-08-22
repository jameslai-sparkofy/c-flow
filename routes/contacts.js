const express = require('express');
const Database = require('../config/database');

const router = express.Router();

// 獲取所有聯絡人
router.get('/', async (req, res, next) => {
    try {
        const contacts = await Database.all('SELECT * FROM contacts ORDER BY created_at DESC');
        res.json({ success: true, data: contacts });
    } catch (error) {
        next(error);
    }
});

module.exports = router;