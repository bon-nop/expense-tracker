-- Group Expense Tracker Local Development Database Schema
-- Modified for Local Development Environment

-- Create local development database
CREATE DATABASE IF NOT EXISTS expense_tracker 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the local development database
USE expense_tracker;

-- Drop tables if they exist (for fresh install)
DROP TABLE IF EXISTS transaction_splits;
DROP TABLE IF EXISTS balances;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS users;

-- Create users table with enhanced security
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    profile_picture TEXT,
    oauth_provider VARCHAR(50) DEFAULT NULL,
    oauth_id VARCHAR(255) DEFAULT NULL,
    oauth_avatar TEXT DEFAULT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_oauth_provider (oauth_provider),
    INDEX idx_oauth_id (oauth_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Create groups table with enhanced features
CREATE TABLE groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    invite_code VARCHAR(32) UNIQUE NOT NULL,
    owner_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_members INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_invite_code (invite_code),
    INDEX idx_owner_id (owner_id),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Create group_members table with roles
CREATE TABLE group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('owner', 'admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_user (group_id, user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- Create transactions table with enhanced tracking
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(100) NOT NULL,
    user_id INT NOT NULL,
    group_id INT DEFAULT NULL,
    date DATE NOT NULL,
    split_type ENUM('personal', 'equal') DEFAULT 'personal',
    receipt_image TEXT DEFAULT NULL,
    tags JSON DEFAULT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_interval ENUM('daily', 'weekly', 'monthly', 'yearly') DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_date (date),
    INDEX idx_split_type (split_type),
    INDEX idx_is_recurring (is_recurring),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Create transaction_splits table for expense splitting
CREATE TABLE transaction_splits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    percentage DECIMAL(5, 2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_transaction_user (transaction_id, user_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- Create balances table with enhanced tracking
CREATE TABLE balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    owes DECIMAL(10, 2) DEFAULT 0.00,
    owed DECIMAL(10, 2) DEFAULT 0.00,
    net_balance DECIMAL(10, 2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_group (user_id, group_id),
    INDEX idx_user_id (user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_net_balance (net_balance)
) ENGINE=InnoDB;

-- Create audit log table for security
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) DEFAULT NULL,
    record_id INT DEFAULT NULL,
    old_values JSON DEFAULT NULL,
    new_values JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Create database user with proper permissions
CREATE USER IF NOT EXISTS 'expense_tracker_user'@'localhost' IDENTIFIED BY 'your_secure_database_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON expense_tracker.* TO 'expense_tracker_user'@'localhost';
GRANT SHOW VIEW ON expense_tracker.* TO 'expense_tracker_user'@'localhost';
FLUSH PRIVILEGES;

-- Performance indexes
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_group_date ON transactions(group_id, date DESC);
CREATE INDEX idx_balances_group_net ON balances(group_id, net_balance);
CREATE INDEX idx_groups_active_created ON groups(is_active, created_at DESC);

-- Insert sample data for development
-- Sample user (password: 'password123')
INSERT INTO users (email, password, name, email_verified) VALUES 
('demo@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 'Demo User', TRUE);

-- Sample group
INSERT INTO groups (name, description, invite_code, owner_id) VALUES 
('Demo Group', 'A sample group for testing purposes', 'DEMO123456', 1);

-- Add user as owner to group
INSERT INTO group_members (group_id, user_id, role) VALUES (1, 1, 'owner');

-- Sample transactions
INSERT INTO transactions (description, amount, type, category, user_id, group_id, date) VALUES 
('Lunch at restaurant', 25.50, 'expense', 'Food', 1, 1, CURDATE()),
('Monthly salary', 3000.00, 'income', 'Salary', 1, NULL, CURDATE()),
('Grocery shopping', 150.75, 'expense', 'Food', 1, 1, CURDATE() - INTERVAL 1 DAY),
('Freelance project', 500.00, 'income', 'Freelance', 1, NULL, CURDATE() - INTERVAL 2 DAYS);

-- Initialize balances
INSERT INTO balances (user_id, group_id, owes, owed, net_balance) VALUES (1, 1, 65.625, 0.00, -65.625);

-- Show database information
SELECT 'Local development database setup completed successfully!' as status;
SELECT 'Database: expense_tracker' as database_name;
SELECT 'Tables created:' as info;
SHOW TABLES;

-- Display record counts
SELECT 'Record counts:' as info;
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'groups' as table_name, COUNT(*) as count FROM groups
UNION ALL
SELECT 'group_members' as table_name, COUNT(*) as count FROM group_members
UNION ALL
SELECT 'transactions' as table_name, COUNT(*) as count FROM transactions
UNION ALL
SELECT 'balances' as table_name, COUNT(*) as count FROM balances;

-- Local development database migration completed
SELECT 'Ready for local development!' as final_status;
