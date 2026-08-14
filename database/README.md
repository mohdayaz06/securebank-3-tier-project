# SecureBank database

Plain MySQL DDL/DML - no ORM migrations, so you can run it directly against
any MySQL 8.x instance (local, container, or managed).

## Files

- `schema.sql` — creates the `securebank` database and all tables
  (users, accounts, transactions, transfers, audit_logs) with primary keys,
  foreign keys, and indexes.
- `seed.sql` — realistic sample data: 4 users (3 customers + 1 admin), 5
  accounts (some with nicknames), a transaction history, one completed
  transfer, and a couple of audit log entries.
- `migrations/` — incremental schema changes for databases that were
  already initialized from an earlier version of `schema.sql`. A fresh
  install only needs `schema.sql` (it already includes every migration);
  migrations exist so an existing deployment doesn't have to be dropped
  and recreated.
  - `001_add_account_nickname.sql` — adds the nullable `accounts.nickname`
    column so customers can label an account ("Emergency fund") instead of
    only seeing its type and masked number.

## Usage

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p securebank < database/seed.sql
```

All seeded users share the password `Password@123` (bcrypt-hashed in the
seed file, never stored in plaintext).

| Email                        | Role     |
|-------------------------------|----------|
| priya.menon@example.com       | customer |
| rohan.verma@example.com       | customer |
| fatima.sheikh@example.com     | customer |
| admin@securebank.io            | admin    |

## Design notes

- `accounts.balance` is the authoritative balance. Every change to it is
  made inside a MySQL transaction together with a matching row in
  `transactions`, using `SELECT ... FOR UPDATE` row locks to prevent race
  conditions on concurrent transfers (see `backend/src/services/transferService.js`).
- `transactions` is an append-only ledger: one row per movement on a single
  account. A transfer produces two linked rows (`transfer_out` on the
  source account, `transfer_in` on the destination account) sharing a
  `reference_id`.
- `transfers` stores the transfer "intent" as a single row so the API can
  report a transfer's overall status without joining two ledger rows.
- `audit_logs` records security-relevant events (login success/failure) for
  traceability, a realistic requirement for banking systems.
