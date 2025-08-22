-- 統包工程管理系統資料庫架構
-- Created: 2025-08-21

-- 1. 專案管理表
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    client_id INTEGER,
    start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, on_hold, completed, cancelled
    budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    address TEXT,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES customers(id)
);

-- 2. 任務(工序)管理表
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- water-electric, masonry, carpentry, painting, flooring
    duration INTEGER DEFAULT 1, -- 工作天數
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, completed, blocked, on_hold
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    order_index INTEGER DEFAULT 0,
    estimated_cost DECIMAL(15,2) DEFAULT 0,
    actual_cost DECIMAL(15,2) DEFAULT 0,
    estimated_price DECIMAL(15,2) DEFAULT 0,
    assigned_master_id INTEGER,
    notes TEXT,
    manually_adjusted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_master_id) REFERENCES masters(id)
);

-- 3. 客戶管理表
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(200),
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    tax_id VARCHAR(20),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(15,2),
    customer_type VARCHAR(50) DEFAULT 'individual', -- individual, company
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, blacklisted
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 供應商管理表
CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(200),
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    tax_id VARCHAR(20),
    payment_terms VARCHAR(100),
    supplier_type VARCHAR(50), -- materials, labor, equipment, services
    rating INTEGER DEFAULT 0, -- 1-5 星評等
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    bank_account VARCHAR(50),
    bank_name VARCHAR(100),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. 聯絡人管理表
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    company_id INTEGER,
    company_type VARCHAR(20), -- customer, supplier
    phone VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(100),
    department VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. 產品/材料管理表
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    unit VARCHAR(20) DEFAULT '個',
    specification TEXT,
    brand VARCHAR(100),
    model VARCHAR(100),
    standard_cost DECIMAL(15,2) DEFAULT 0,
    standard_price DECIMAL(15,2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    supplier_id INTEGER,
    status VARCHAR(20) DEFAULT 'active', -- active, discontinued, out_of_stock
    image_url VARCHAR(500),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- 7. 採購單主表
CREATE TABLE purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    project_id INTEGER,
    supplier_id INTEGER NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, confirmed, partial_received, received, cancelled
    total_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    final_amount DECIMAL(15,2) DEFAULT 0,
    payment_terms VARCHAR(100),
    delivery_address TEXT,
    notes TEXT,
    created_by INTEGER,
    approved_by INTEGER,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- 8. 採購單明細表
CREATE TABLE purchase_order_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    received_quantity DECIMAL(10,3) DEFAULT 0,
    notes VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 9. 詢價單主表
CREATE TABLE inquiry_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inquiry_number VARCHAR(50) UNIQUE NOT NULL,
    project_id INTEGER,
    supplier_id INTEGER NOT NULL,
    inquiry_date DATE NOT NULL,
    response_deadline DATE,
    status VARCHAR(50) DEFAULT 'sent', -- draft, sent, responded, expired, cancelled
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- 10. 詢價單明細表
CREATE TABLE inquiry_order_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inquiry_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    estimated_unit_price DECIMAL(15,2),
    quoted_unit_price DECIMAL(15,2),
    quoted_subtotal DECIMAL(15,2),
    delivery_days INTEGER,
    notes VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inquiry_order_id) REFERENCES inquiry_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 11. 報價單主表
CREATE TABLE quotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    project_id INTEGER,
    customer_id INTEGER NOT NULL,
    quote_date DATE NOT NULL,
    valid_until DATE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, accepted, rejected, expired
    total_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    final_amount DECIMAL(15,2) DEFAULT 0,
    payment_terms VARCHAR(100),
    notes TEXT,
    created_by INTEGER,
    approved_by INTEGER,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 12. 報價單明細表
CREATE TABLE quotation_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_id INTEGER NOT NULL,
    task_id INTEGER,
    product_id INTEGER,
    item_name VARCHAR(200) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20),
    unit_price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    notes VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 13. 合約主表
CREATE TABLE contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    project_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    quotation_id INTEGER,
    contract_date DATE NOT NULL,
    start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, completed, cancelled, terminated
    contract_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    payment_schedule TEXT, -- JSON格式儲存付款排程
    penalty_clause TEXT,
    warranty_period INTEGER, -- 保固期(月)
    contract_terms TEXT,
    signed_by_customer VARCHAR(100),
    signed_by_company VARCHAR(100),
    signed_date DATE,
    created_by INTEGER,
    approved_by INTEGER,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (quotation_id) REFERENCES quotations(id)
);

-- 14. 合約明細表
CREATE TABLE contract_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER NOT NULL,
    task_id INTEGER,
    item_name VARCHAR(200) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20),
    unit_price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    notes VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- 15. 工單管理表
CREATE TABLE work_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_order_number VARCHAR(50) UNIQUE NOT NULL,
    project_id INTEGER NOT NULL,
    task_id INTEGER NOT NULL,
    master_id INTEGER NOT NULL,
    contract_id INTEGER,
    work_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    work_hours DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    work_description TEXT,
    materials_used TEXT, -- JSON格式儲存使用材料
    quality_check_status VARCHAR(50) DEFAULT 'pending', -- pending, passed, failed, rework_required
    quality_notes TEXT,
    labor_cost DECIMAL(15,2) DEFAULT 0,
    material_cost DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    photos TEXT, -- JSON格式儲存照片URL
    customer_signature VARCHAR(500), -- 客戶簽名
    master_signature VARCHAR(500), -- 師父簽名
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (master_id) REFERENCES masters(id),
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
);

-- 16. 師父資料庫表
CREATE TABLE masters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    id_number VARCHAR(20),
    birth_date DATE,
    specialties TEXT, -- JSON格式儲存專長領域
    skill_level VARCHAR(20) DEFAULT 'intermediate', -- beginner, intermediate, advanced, expert
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    daily_rate DECIMAL(10,2) DEFAULT 0,
    availability_status VARCHAR(20) DEFAULT 'available', -- available, busy, unavailable
    rating DECIMAL(3,2) DEFAULT 0, -- 評等 0.00-5.00
    total_projects_completed INTEGER DEFAULT 0,
    hire_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended, terminated
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    bank_account VARCHAR(50),
    bank_name VARCHAR(100),
    tax_id VARCHAR(20),
    insurance_number VARCHAR(50),
    license_numbers TEXT, -- JSON格式儲存證照編號
    photos TEXT, -- JSON格式儲存照片URL
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 17. 系統用戶表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user', -- admin, manager, user, viewer
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 18. 系統設定表
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 創建索引以提升查詢效能
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_master ON tasks(assigned_master_id);
CREATE INDEX idx_purchase_orders_project ON purchase_orders(project_id);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_work_orders_project ON work_orders(project_id);
CREATE INDEX idx_work_orders_task ON work_orders(task_id);
CREATE INDEX idx_work_orders_master ON work_orders(master_id);
CREATE INDEX idx_work_orders_date ON work_orders(work_date);
CREATE INDEX idx_contracts_project ON contracts(project_id);
CREATE INDEX idx_contracts_customer ON contracts(customer_id);

-- 插入初始系統設定
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('company_name', '統包工程有限公司', 'string', '公司名稱'),
('company_address', '台北市信義區信義路五段7號', 'string', '公司地址'),
('company_phone', '02-2345-6789', 'string', '公司電話'),
('company_email', 'info@construction.com.tw', 'string', '公司Email'),
('tax_rate', '0.05', 'number', '稅率'),
('default_payment_terms', '30天', 'string', '預設付款條件'),
('work_hours_per_day', '8', 'number', '每日標準工時'),
('skip_saturday', 'false', 'boolean', '是否跳過週六'),
('skip_sunday', 'true', 'boolean', '是否跳過週日'),
('currency_symbol', 'NT$', 'string', '貨幣符號');

-- 插入預設管理員用戶 (密碼: admin123)
INSERT INTO users (username, password_hash, email, full_name, role) VALUES 
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@construction.com.tw', '系統管理員', 'admin');