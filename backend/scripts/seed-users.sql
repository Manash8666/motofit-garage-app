-- MotoFit 2.0 User Seeding Script (PIN Based)
-- Run this in your TiDB Console

-- 1. Create Users Table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'User',
    email VARCHAR(255),
    phone VARCHAR(20),
    full_name VARCHAR(255),
    allowed_ips TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insert Users
-- Default PIN for all: 1234
-- Hash: $2a$10$NnHhgfejhaFsCW4UoAuOBeWYFP9G41zUCHG4WIdBh0QO2/DdMWadG

INSERT INTO users (id, username, password_hash, role, email, full_name) VALUES 
(UUID(), 'akshat', '$2a$10$NnHhgfejhaFsCW4UoAuOBeWYFP9G41zUCHG4WIdBh0QO2/DdMWadG', 'Owner', 'akshat@local', 'Akshat Mohanty'),
(UUID(), 'munna', '$2a$10$NnHhgfejhaFsCW4UoAuOBeWYFP9G41zUCHG4WIdBh0QO2/DdMWadG', 'Senior Head Mechanic', 'munna@local', 'Munna Gujili'),
(UUID(), 'goarav', '$2a$10$NnHhgfejhaFsCW4UoAuOBeWYFP9G41zUCHG4WIdBh0QO2/DdMWadG', 'Mid-Tier Mechanic', 'goarav@local', 'Goarav Thakor'),
(UUID(), 'kunal', '$2a$10$NnHhgfejhaFsCW4UoAuOBeWYFP9G41zUCHG4WIdBh0QO2/DdMWadG', 'Junior Mechanic', 'kunal@local', 'Kunal Thakor'),
(UUID(), 'samael', '$2a$10$NnHhgfejhaFsCW4UoAuOBeWYFP9G41zUCHG4WIdBh0QO2/DdMWadG', 'Admin', 'samael@local', 'Samael Morningstar')
ON DUPLICATE KEY UPDATE 
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    full_name = VALUES(full_name);

-- 3. Verify
SELECT username, role, full_name FROM users;
