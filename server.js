const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const Database = require('./config/database');
const { authMiddleware } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// 路由導入
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const customerRoutes = require('./routes/customers');
const supplierRoutes = require('./routes/suppliers');
const contactRoutes = require('./routes/contacts');
const productRoutes = require('./routes/products');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const quotationRoutes = require('./routes/quotations');
const contractRoutes = require('./routes/contracts');
const workOrderRoutes = require('./routes/workOrders');
const masterRoutes = require('./routes/masters');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化資料庫
Database.initialize();

// 中間件設定
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
        },
    },
}));

app.use(compression());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(morgan('combined'));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 100, // 每個IP最多100次請求
    message: '請求次數過多，請稍後再試'
});
app.use('/api/', limiter);

// 解析中間件
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 靜態檔案服務
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/customers', authMiddleware, customerRoutes);
app.use('/api/suppliers', authMiddleware, supplierRoutes);
app.use('/api/contacts', authMiddleware, contactRoutes);
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/purchase-orders', authMiddleware, purchaseOrderRoutes);
app.use('/api/quotations', authMiddleware, quotationRoutes);
app.use('/api/contracts', authMiddleware, contractRoutes);
app.use('/api/work-orders', authMiddleware, workOrderRoutes);
app.use('/api/masters', authMiddleware, masterRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// 健康檢查端點
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404處理
app.use('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({ message: 'API端點不存在' });
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// 錯誤處理中間件
app.use(errorHandler);

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
    console.log(`📊 API文件: http://localhost:${PORT}/api/docs`);
    console.log(`🏗️ 統包工程管理系統已啟動`);
});