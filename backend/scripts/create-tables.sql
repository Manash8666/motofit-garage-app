-- 1. Select the database first
USE test;

-- 2. Create tables
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bikes (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50),
    make VARCHAR(100),
    model VARCHAR(100),
    year INT,
    registration_no VARCHAR(50),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    duration INT DEFAULT 60,
    category VARCHAR(100) DEFAULT 'General',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(50) PRIMARY KEY,
    job_no VARCHAR(50),
    customer_id VARCHAR(50),
    vehicle_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    services JSON,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    assigned_to VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    job_id VARCHAR(50),
    customer_id VARCHAR(50),
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(20) DEFAULT 'cash',
    status VARCHAR(20) DEFAULT 'completed',
    reference_no VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 5,
    price DECIMAL(10, 2) DEFAULT 0,
    location VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mechanics (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    efficiency INT DEFAULT 80,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id VARCHAR(50) PRIMARY KEY,
    quote_no VARCHAR(50),
    customer_id VARCHAR(50),
    valid_until DATE,
    status VARCHAR(20) DEFAULT 'draft',
    items JSON,
    notes TEXT,
    total DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Verify
SHOW TABLES;
