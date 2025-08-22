const errorHandler = (err, req, res, next) => {
    console.error('錯誤詳情:', err);

    // 預設錯誤狀態碼和訊息
    let statusCode = 500;
    let message = '伺服器內部錯誤';

    // 根據錯誤類型設定回應
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = '資料驗證錯誤';
        
        // 如果是Joi驗證錯誤
        if (err.isJoi) {
            const details = err.details.map(detail => detail.message).join(', ');
            message = `驗證失敗: ${details}`;
        }
    } else if (err.code === 'SQLITE_CONSTRAINT') {
        statusCode = 409;
        if (err.message.includes('UNIQUE')) {
            message = '資料重複，該記錄已存在';
        } else if (err.message.includes('FOREIGN')) {
            message = '關聯資料不存在';
        } else {
            message = '資料約束違反';
        }
    } else if (err.code === 'SQLITE_ERROR') {
        statusCode = 400;
        message = '資料庫操作錯誤';
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = '未授權的請求';
    } else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = '禁止訪問';
    } else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = '資源不存在';
    } else if (err.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = '檔案大小超過限制';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = '不支援的檔案類型';
        } else {
            message = '檔案上傳錯誤';
        }
    } else if (err.status) {
        statusCode = err.status;
        message = err.message || message;
    }

    // 開發環境下提供詳細錯誤資訊
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
        response.error = err.message;
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;