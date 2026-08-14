-- =========================================================================
-- SecureBank - Digital Banking Application
-- MySQL schema
--
-- Run this against a fresh database, e.g.:
--   mysql -u root -p securebank < database/schema.sql
--
-- If you already have a live database from before the `nickname` column
-- existed, don't re-run this file - apply database/migrations/ instead
-- (see database/migrations/001_add_account_nickname.sql).
-- =========================================================================

CREATE DATABASE IF NOT EXISTS securebank
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE securebank;

-- -------------------------------------------------------------------------
-- users
-- One row per registered customer (or admin). Passwords are always stored
-- as bcrypt hashes, never plaintext.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(120)        NOT NULL,
  email           VARCHAR(150)        NOT NULL,
  phone           VARCHAR(20)         NULL,
  password_hash   VARCHAR(255)        NOT NULL,
  role            ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  status          ENUM('active', 'locked') NOT NULL DEFAULT 'active',
  failed_login_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------
-- accounts
-- One user can hold multiple accounts (e.g. checking + savings).
-- balance is the authoritative current balance; every change to it must
-- happen inside a DB transaction alongside a corresponding transactions row.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS accounts (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED     NOT NULL,
  account_number  VARCHAR(20)         NOT NULL,
  account_type    ENUM('checking', 'savings') NOT NULL DEFAULT 'checking',
  nickname        VARCHAR(50)         NULL,
  currency        CHAR(3)             NOT NULL DEFAULT 'USD',
  balance         DECIMAL(15,2)       NOT NULL DEFAULT 0.00,
  status          ENUM('active', 'frozen', 'closed') NOT NULL DEFAULT 'active',
  created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_accounts_number UNIQUE (account_number),
  CONSTRAINT fk_accounts_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_accounts_balance_nonnegative CHECK (balance >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- -------------------------------------------------------------------------
-- transactions
-- Ledger table: one row per movement on a single account. A transfer
-- produces TWO rows (a transfer_out on the source account and a
-- transfer_in on the destination account) linked by reference_id, which
-- also matches the transfers.reference_id below.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  account_id        BIGINT UNSIGNED   NOT NULL,
  reference_id      VARCHAR(36)       NOT NULL,
  type              ENUM('deposit', 'withdrawal', 'transfer_in', 'transfer_out') NOT NULL,
  amount            DECIMAL(15,2)     NOT NULL,
  balance_after     DECIMAL(15,2)     NOT NULL,
  related_account_id BIGINT UNSIGNED  NULL,
  description       VARCHAR(255)      NULL,
  status            ENUM('completed', 'pending', 'failed') NOT NULL DEFAULT 'completed',
  created_at        TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_account
    FOREIGN KEY (account_id) REFERENCES accounts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_transactions_related_account
    FOREIGN KEY (related_account_id) REFERENCES accounts(id)
    ON DELETE SET NULL,
  CONSTRAINT chk_transactions_amount_positive CHECK (amount > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_transactions_account_created ON transactions(account_id, created_at DESC);
CREATE INDEX idx_transactions_reference ON transactions(reference_id);

-- -------------------------------------------------------------------------
-- transfers
-- One row per transfer request between two accounts. This is the
-- "intent" record; the actual balance movement is recorded as a pair of
-- rows in `transactions`. Kept separate so the API can look up a
-- transfer's overall status/amount in a single row instead of joining
-- two ledger entries.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transfers (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference_id        VARCHAR(36)     NOT NULL,
  from_account_id     BIGINT UNSIGNED NOT NULL,
  to_account_id       BIGINT UNSIGNED NOT NULL,
  amount              DECIMAL(15,2)   NOT NULL,
  description         VARCHAR(255)    NULL,
  status              ENUM('completed', 'failed') NOT NULL DEFAULT 'completed',
  initiated_by_user_id BIGINT UNSIGNED NOT NULL,
  created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_transfers_reference UNIQUE (reference_id),
  CONSTRAINT fk_transfers_from_account
    FOREIGN KEY (from_account_id) REFERENCES accounts(id),
  CONSTRAINT fk_transfers_to_account
    FOREIGN KEY (to_account_id) REFERENCES accounts(id),
  CONSTRAINT fk_transfers_user
    FOREIGN KEY (initiated_by_user_id) REFERENCES users(id),
  CONSTRAINT chk_transfers_amount_positive CHECK (amount > 0),
  CONSTRAINT chk_transfers_different_accounts CHECK (from_account_id <> to_account_id)
) ENGINE=InnoDB;

CREATE INDEX idx_transfers_from_account ON transfers(from_account_id);
CREATE INDEX idx_transfers_to_account ON transfers(to_account_id);

-- -------------------------------------------------------------------------
-- audit_logs
-- Security-relevant events (login success/failure, password change, etc.)
-- for traceability - a realistic requirement in banking systems.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NULL,
  event_type    VARCHAR(50)     NOT NULL,
  ip_address    VARCHAR(45)     NULL,
  details       VARCHAR(255)    NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
