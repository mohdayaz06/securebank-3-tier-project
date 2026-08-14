-- =========================================================================
-- Migration 001: add accounts.nickname
--
-- Lets customers label an account (e.g. "Emergency fund", "Rent account")
-- instead of only seeing "checking" / "savings" + a masked number.
-- Nullable and additive - safe to run against a database that already has
-- live data, and existing queries/rows are unaffected.
--
-- Usage (only if you initialized the DB before this migration existed;
-- a fresh `schema.sql` already includes this column):
--   mysql -u root -p securebank < database/migrations/001_add_account_nickname.sql
-- =========================================================================

USE securebank;

SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'securebank' AND TABLE_NAME = 'accounts' AND COLUMN_NAME = 'nickname'
);

SET @ddl = IF(@col_exists = 0,
  'ALTER TABLE accounts ADD COLUMN nickname VARCHAR(50) NULL AFTER account_type',
  'SELECT "nickname column already exists, skipping" AS notice'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
