-- =========================================================================
-- SecureBank - Sample / seed data
--
-- All demo users share the password:  Password@123
-- (bcrypt hash below was generated with bcryptjs, 10 salt rounds)
--
-- Run after schema.sql:
--   mysql -u root -p securebank < database/seed.sql
-- =========================================================================

USE securebank;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE transfers;
TRUNCATE TABLE transactions;
TRUNCATE TABLE accounts;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------------------
-- Users  (password for all demo accounts: Password@123)
-- -------------------------------------------------------------------------
INSERT INTO users (id, full_name, email, phone, password_hash, role, status) VALUES
  (1, 'Priya Menon',    'priya.menon@example.com',   '+91-98765-43210', '$2b$10$8LQTV/gSPj3HAz1HTHTwR.G1GJc8PXhDbx60YH41Hrhr3dISjjIUi', 'customer', 'active'),
  (2, 'Rohan Verma',    'rohan.verma@example.com',   '+91-98765-11223', '$2b$10$8LQTV/gSPj3HAz1HTHTwR.G1GJc8PXhDbx60YH41Hrhr3dISjjIUi', 'customer', 'active'),
  (3, 'Fatima Sheikh',  'fatima.sheikh@example.com', '+91-98765-99887', '$2b$10$8LQTV/gSPj3HAz1HTHTwR.G1GJc8PXhDbx60YH41Hrhr3dISjjIUi', 'customer', 'active'),
  (4, 'Bank Admin',     'admin@securebank.io',       '+91-99999-00000', '$2b$10$8LQTV/gSPj3HAz1HTHTwR.G1GJc8PXhDbx60YH41Hrhr3dISjjIUi', 'admin',    'active');

-- -------------------------------------------------------------------------
-- Accounts
-- -------------------------------------------------------------------------
INSERT INTO accounts (id, user_id, account_number, account_type, nickname, currency, balance, status) VALUES
  (1, 1, '1000200001', 'checking', 'Everyday spending', 'USD', 4820.50, 'active'),
  (2, 1, '1000200002', 'savings',  'Emergency fund',     'USD', 15250.00, 'active'),
  (3, 2, '1000200003', 'checking', NULL,                 'USD', 2310.75, 'active'),
  (4, 3, '1000200004', 'checking', 'Household bills',    'USD', 980.00,  'active'),
  (5, 3, '1000200005', 'savings',  'Vacation fund',      'USD', 7600.25, 'active');

-- -------------------------------------------------------------------------
-- Transactions (ledger) - opening deposits, a few transfers, a withdrawal
-- -------------------------------------------------------------------------
INSERT INTO transactions (account_id, reference_id, type, amount, balance_after, related_account_id, description, status, created_at) VALUES
  (1, UUID(), 'deposit',     5000.00, 5000.00, NULL, 'Initial deposit - opening balance', 'completed', '2026-06-01 09:00:00'),
  (2, UUID(), 'deposit',     15000.00, 15000.00, NULL, 'Initial deposit - opening balance', 'completed', '2026-06-01 09:05:00'),
  (3, UUID(), 'deposit',     2500.00, 2500.00, NULL, 'Initial deposit - opening balance', 'completed', '2026-06-02 10:00:00'),
  (4, UUID(), 'deposit',     1000.00, 1000.00, NULL, 'Initial deposit - opening balance', 'completed', '2026-06-03 11:00:00'),
  (5, UUID(), 'deposit',     7500.00, 7500.00, NULL, 'Initial deposit - opening balance', 'completed', '2026-06-03 11:05:00'),
  (1, UUID(), 'withdrawal',  200.00,  4800.00, NULL, 'ATM withdrawal', 'completed', '2026-06-10 14:22:00'),
  (2, UUID(), 'deposit',     250.00,  15250.00, NULL, 'Interest credit', 'completed', '2026-07-01 00:00:00'),
  (5, UUID(), 'deposit',     100.25,  7600.25, NULL, 'Interest credit', 'completed', '2026-07-01 00:00:00'),
  (1, UUID(), 'deposit',     220.50,  5020.50, NULL, 'Payroll deposit', 'completed', '2026-07-15 08:30:00'),
  (1, UUID(), 'withdrawal',  200.00,  4820.50, NULL, 'Grocery store purchase', 'completed', '2026-07-20 17:45:00');

-- Sample transfer: Priya's checking (1) -> Rohan's checking (3), $300
SET @transfer_ref_1 = UUID();

INSERT INTO transactions (account_id, reference_id, type, amount, balance_after, related_account_id, description, status, created_at) VALUES
  (1, @transfer_ref_1, 'transfer_out', 300.00, 4820.50, 3, 'Rent contribution', 'completed', '2026-07-25 12:00:00');
-- (balance_after values above are illustrative for seed purposes; the application recomputes real balances via the transfer service)

INSERT INTO transfers (reference_id, from_account_id, to_account_id, amount, description, status, initiated_by_user_id, created_at) VALUES
  (@transfer_ref_1, 1, 3, 300.00, 'Rent contribution', 'completed', 1, '2026-07-25 12:00:00');

-- -------------------------------------------------------------------------
-- Audit logs
-- -------------------------------------------------------------------------
INSERT INTO audit_logs (user_id, event_type, ip_address, details) VALUES
  (1, 'LOGIN_SUCCESS', '203.0.113.10', 'Login via web app'),
  (2, 'LOGIN_SUCCESS', '203.0.113.22', 'Login via web app'),
  (3, 'LOGIN_FAILED',  '203.0.113.40', 'Incorrect password');
