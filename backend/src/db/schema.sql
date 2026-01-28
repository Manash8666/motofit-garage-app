-- MotoFit 2 Database Schema for TiDB
-- Version: 1.0.0
-- Last Updated: 2026-01-24

-- =============================================================================
-- 1. CUSTOMERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_name (name)
);

-- =============================================================================
-- 2. BIKES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS bikes (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT,
  registration VARCHAR(50) UNIQUE,
  chassis VARCHAR(50),
  engine VARCHAR(50),
  color VARCHAR(30),
  odometer INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_registration (registration),
  INDEX idx_customer (customer_id),
  INDEX idx_make_model (make, model)
);

-- =============================================================================
-- 3. SERVICES CATALOG
-- =============================================================================
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INT DEFAULT 60,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_active (is_active)
);

-- =============================================================================
-- 4. PARTS/INVENTORY
-- =============================================================================
CREATE TABLE IF NOT EXISTS parts (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  part_number VARCHAR(100),
  category VARCHAR(50),
  quantity INT DEFAULT 0,
  min_stock_level INT DEFAULT 5,
  price DECIMAL(10,2) NOT NULL,
  supplier VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_part_number (part_number),
  INDEX idx_category (category),
  INDEX idx_low_stock (quantity, min_stock_level)
);

-- =============================================================================
-- 5. JOBS/JOB CARDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(50) PRIMARY KEY,
  job_no VARCHAR(20) UNIQUE NOT NULL,
  date DATE NOT NULL,
  token VARCHAR(20),
  promised_date DATE,
  customer_id VARCHAR(50) NOT NULL,
  bike_id VARCHAR(50),
  phone VARCHAR(20) NOT NULL,
  bike_model VARCHAR(100) NOT NULL,
  registration VARCHAR(50),
  chassis VARCHAR(50),
  engine VARCHAR(50),
  mechanic VARCHAR(100) NOT NULL,
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  actual_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  status ENUM('Pending', 'Repairing', 'Completed', 'Delivered') DEFAULT 'Pending',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  warranty BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (bike_id) REFERENCES bikes(id),
  INDEX idx_job_no (job_no),
  INDEX idx_status (status),
  INDEX idx_customer (customer_id),
  INDEX idx_date (date),
  INDEX idx_mechanic (mechanic),
  INDEX idx_priority (priority)
);

-- =============================================================================
-- 6. JOB_SERVICES (Many-to-Many)
-- =============================================================================
CREATE TABLE IF NOT EXISTS job_services (
  id VARCHAR(50) PRIMARY KEY,
  job_id VARCHAR(50) NOT NULL,
  service_id VARCHAR(50) NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id),
  UNIQUE KEY unique_job_service (job_id, service_id),
  INDEX idx_job (job_id),
  INDEX idx_service (service_id)
);

-- =============================================================================
-- 7. JOB_PARTS (Many-to-Many)
-- =============================================================================
CREATE TABLE IF NOT EXISTS job_parts (
  id VARCHAR(50) PRIMARY KEY,
  job_id VARCHAR(50) NOT NULL,
  part_id VARCHAR(50) NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id),
  INDEX idx_job (job_id),
  INDEX idx_part (part_id)
);

-- =============================================================================
-- 8. USERS/AUTHENTICATION
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'mechanic', 'reception') DEFAULT 'mechanic',
  full_name VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- =============================================================================
-- 9. PHOTO ATTACHMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS photos (
  id VARCHAR(50) PRIMARY KEY,
  job_id VARCHAR(50) NOT NULL,
  type ENUM('before', 'during', 'after') NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  mime_type VARCHAR(50),
  caption TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  INDEX idx_job (job_id),
  INDEX idx_type (type)
);

-- =============================================================================
-- 10. SERVICE HISTORY/TIMELINE
-- =============================================================================
CREATE TABLE IF NOT EXISTS service_history (
  id VARCHAR(50) PRIMARY KEY,
  bike_id VARCHAR(50) NOT NULL,
  job_id VARCHAR(50),
  service_date DATE NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  description TEXT,
  cost DECIMAL(10,2),
  mechanic VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  INDEX idx_bike (bike_id),
  INDEX idx_date (service_date)
);

-- =============================================================================
-- 12. QUOTES (CRM)
-- =============================================================================
CREATE TABLE IF NOT EXISTS quotes (
  id VARCHAR(50) PRIMARY KEY,
  quote_no VARCHAR(20) UNIQUE NOT NULL,
  customer_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  valid_until DATE,
  status ENUM('draft', 'sent', 'accepted', 'rejected', 'converted') DEFAULT 'draft',
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  converted_job_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (converted_job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  INDEX idx_quote_no (quote_no),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_date (date)
);

-- =============================================================================
-- 13. QUOTE ITEMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS quote_items (
  id VARCHAR(50) PRIMARY KEY,
  quote_id VARCHAR(50) NOT NULL,
  service_id VARCHAR(50),
  description VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
  INDEX idx_quote (quote_id)
);

-- =============================================================================
-- 14. PAYMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(50) PRIMARY KEY,
  payment_no VARCHAR(20) UNIQUE NOT NULL,
  job_id VARCHAR(50),
  customer_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'upi', 'card', 'bank_transfer', 'other') DEFAULT 'cash',
  payment_date DATE NOT NULL,
  reference_no VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_payment_no (payment_no),
  INDEX idx_job (job_id),
  INDEX idx_customer (customer_id),
  INDEX idx_date (payment_date),
  INDEX idx_method (payment_method)
);

-- =============================================================================
-- 15. LEADS (CRM)
-- =============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  vehicle_interest VARCHAR(100),
  source ENUM('walk_in', 'referral', 'social_media', 'advertisement', 'website', 'other') DEFAULT 'walk_in',
  status ENUM('new', 'contacted', 'qualified', 'converted', 'lost') DEFAULT 'new',
  assigned_to VARCHAR(100),
  notes TEXT,
  follow_up_date DATE,
  converted_customer_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (converted_customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_phone (phone),
  INDEX idx_status (status),
  INDEX idx_source (source),
  INDEX idx_follow_up (follow_up_date)
);

-- =============================================================================
-- 16. TRANSACTION CATEGORIES (ACCOUNTING)
-- =============================================================================
CREATE TABLE IF NOT EXISTS transaction_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 17. TRANSACTIONS (ACCOUNTING LEDGER)
-- =============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(50) PRIMARY KEY,
  transaction_no VARCHAR(20) UNIQUE NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  category_id VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255),
  reference_id VARCHAR(50),
  reference_type VARCHAR(50),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES transaction_categories(id) ON DELETE SET NULL,
  INDEX idx_type (type),
  INDEX idx_category (category_id),
  INDEX idx_date (transaction_date)
);

-- =============================================================================
-- SEED DATA FOR TRANSACTION CATEGORIES
-- =============================================================================
INSERT INTO transaction_categories (id, name, type, is_active) VALUES
('cat-1', 'Service Revenue', 'income', TRUE),
('cat-2', 'Parts Sales', 'income', TRUE),
('cat-3', 'Other Income', 'income', TRUE),
('cat-4', 'Parts Purchase', 'expense', TRUE),
('cat-5', 'Salaries', 'expense', TRUE),
('cat-6', 'Rent', 'expense', TRUE),
('cat-7', 'Utilities', 'expense', TRUE),
('cat-8', 'Other Expense', 'expense', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- =============================================================================
-- INITIAL DATA SEEDS (OPTIONAL)
-- =============================================================================

-- Insert default services
INSERT INTO services (id, name, category, price, duration_minutes, is_active) VALUES
('srv-1', 'Oil Change', 'Maintenance', 500.00, 30, TRUE),
('srv-2', 'Engine Repair', 'Repair', 5000.00, 240, TRUE),
('srv-3', 'Brake Service', 'Maintenance', 800.00, 60, TRUE),
('srv-4', 'Tire Replacement', 'Replacement', 1500.00, 45, TRUE),
('srv-5', 'General Checkup', 'Diagnostic', 300.00, 60, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert admin user (password: admin123 - hashed)
INSERT INTO users (id, username, email, password_hash, role, full_name, is_active) VALUES
('user-admin', 'admin', 'admin@motofit.in', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'admin', 'System Administrator', TRUE)
ON DUPLICATE KEY UPDATE username=VALUES(username);
