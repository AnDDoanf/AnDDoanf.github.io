---
title: "DumbPhobia#11 ACID Principles in DBMS"
date: 2026-04-13
tags: [system-design]
---

> ACID is the set of properties that guarantee database transactions are processed reliably — even in the face of errors, power failures, and concurrent access. Every time you transfer money, place an order, or save a record, ACID is what keeps the data from becoming corrupted or inconsistent.

## What is a Transaction?

Before ACID makes sense, you need to understand what a **transaction** is.

A transaction is a **sequence of one or more database operations treated as a single logical unit of work**. The classic example is a bank transfer:

```sql
BEGIN TRANSACTION;
  UPDATE accounts SET balance = balance - 500 WHERE id = 'alice';
  UPDATE accounts SET balance = balance + 500 WHERE id = 'bob';
COMMIT;
```

Both operations must succeed together or fail together. If the system crashes after debiting Alice but before crediting Bob, the money disappears. A transaction with ACID guarantees prevents exactly this kind of data corruption.

---

## What is ACID?

ACID is an acronym for four properties that every reliable database transaction must satisfy:

| Letter | Property | Core guarantee |
|---|---|---|
| **A** | Atomicity | All operations in a transaction succeed, or none of them do |
| **C** | Consistency | A transaction brings the database from one valid state to another valid state |
| **I** | Isolation | Concurrent transactions behave as if they ran sequentially |
| **D** | Durability | Once committed, a transaction's effects survive permanently — even crashes |

Together, these four properties ensure that transactions are **reliable, predictable, and safe** — even when things go wrong.

---

## A — Atomicity

### The property

> A transaction is an **all-or-nothing** operation. Either every operation within it succeeds and is committed, or the entire transaction is rolled back as if it never happened.

There is no such thing as a "half-completed" transaction in an atomic system.

### The problem it solves

Without atomicity, a crash between two related operations leaves the database in a **partial state** — some changes applied, others not.

```sql
-- Without atomicity: system crashes here ↓
UPDATE accounts SET balance = balance - 500 WHERE id = 'alice';
-- ← CRASH — power failure, server restart, network error
UPDATE accounts SET balance = balance + 500 WHERE id = 'bob';
-- Bob never gets credited. $500 disappears.
```

### How it works

Databases implement atomicity using a **Write-Ahead Log (WAL)** — also called a transaction log or redo log. Every change is first written to the log before being applied to the actual data. On recovery after a crash, the database inspects the log:

```
Transaction log on disk:
  [BEGIN   txn-1]
  [UPDATE  txn-1  accounts alice balance=1500→1000]
  [UPDATE  txn-1  accounts bob   balance=500→1000]
  [COMMIT  txn-1]  ← if this line exists, apply all changes
                   ← if missing, roll back all changes
```

If the COMMIT record is missing, the database rolls back all changes from that transaction on startup.

### Rollback

```sql
BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 500 WHERE id = 'alice';

-- Something goes wrong in application logic
IF balance_after < 0 THEN
  ROLLBACK; -- undo the debit — alice's balance is restored
  RETURN 'Insufficient funds';
END IF;

UPDATE accounts SET balance = balance + 500 WHERE id = 'bob';

COMMIT;
```

### Application-level example

```javascript
// Node.js with PostgreSQL — atomic transaction
async function transferFunds(fromId, toId, amount) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: [from] } = await client.query(
      'SELECT balance FROM accounts WHERE id = $1 FOR UPDATE',
      [fromId]
    );

    if (from.balance < amount) {
      throw new Error('Insufficient funds');
    }

    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [amount, fromId]
    );

    await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [amount, toId]
    );

    await client.query('COMMIT');
    return { success: true };

  } catch (err) {
    await client.query('ROLLBACK'); // undo all changes if anything fails
    throw err;
  } finally {
    client.release();
  }
}
```

### Use cases

- Bank transfers and payment processing
- Order placement (deduct inventory AND create order record together)
- Multi-table updates that must stay in sync
- Any operation that spans multiple related rows or tables

### Pros

- Prevents partial updates from corrupting data
- Application code can throw exceptions without worrying about cleanup — rollback handles it
- System crashes leave the database in a clean state

### Cons

- Long-running transactions hold locks and reduce concurrency
- Rollback has a cost — especially for large transactions with many changes
- Savepoints add complexity for partial rollback scenarios

---

## C — Consistency

### The property

> A transaction brings the database from **one valid state to another valid state**. All data integrity rules, constraints, and invariants must be satisfied before and after every transaction.

Consistency in ACID is different from consistency in CAP theorem. Here it means **correctness** — the database never violates its own rules.

### The problem it solves

Without consistency guarantees, a transaction could leave the database in an impossible state — violating foreign keys, breaking unique constraints, or leaving computed totals that don't add up.

```sql
-- Without consistency: this could succeed and leave invalid data
INSERT INTO order_items (order_id, product_id, quantity)
VALUES (9999, 1, 5);
-- order_id 9999 doesn't exist — foreign key violation
-- Should fail but without enforcement, orphan data appears
```

### What enforces consistency

Consistency is enforced by a combination of database-level constraints and application-level rules:

**Database-level constraints:**

```sql
-- Primary key — every row is unique and identifiable
ALTER TABLE users ADD CONSTRAINT pk_users PRIMARY KEY (id);

-- Foreign key — referential integrity enforced
ALTER TABLE orders ADD CONSTRAINT fk_user
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE;

-- Unique constraint — no duplicate values
ALTER TABLE users ADD CONSTRAINT uq_email UNIQUE (email);

-- Check constraint — value must satisfy a condition
ALTER TABLE accounts ADD CONSTRAINT chk_balance
  CHECK (balance >= 0);

-- Not null — required fields cannot be omitted
ALTER TABLE products ALTER COLUMN name SET NOT NULL;
```

**Application-level invariants:**

```javascript
// Business rules that the database layer enforces through transactions
async function placeOrder(userId, cartItems) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Invariant: total must equal sum of line items
    const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    const { rows: [order] } = await client.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id',
      [userId, total]
    );

    for (const item of cartItems) {
      // Invariant: cannot order more than available stock
      const { rows: [product] } = await client.query(
        'SELECT stock FROM products WHERE id = $1 FOR UPDATE',
        [item.productId]
      );

      if (product.stock < item.qty) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.qty, item.productId]
      );

      await client.query(
        'INSERT INTO order_items (order_id, product_id, qty, price) VALUES ($1,$2,$3,$4)',
        [order.id, item.productId, item.qty, item.price]
      );
    }

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

### Consistency is partially your responsibility

Unlike atomicity, isolation, and durability — which the database engine handles — consistency is a **shared responsibility**:

```
Database enforces:
  ✓ Primary keys
  ✓ Foreign keys
  ✓ Unique constraints
  ✓ Check constraints
  ✓ Not null constraints

Application must enforce:
  ✓ Business rules (a user can't order more than their credit limit)
  ✓ Cross-table invariants not expressible as simple constraints
  ✓ Computed totals matching their components
  ✓ Workflow state transitions (order can only go from PENDING to PAID, not DELIVERED)
```

### Use cases

- E-commerce — orders must reference valid users and products
- Accounting — debits must equal credits across the ledger
- Inventory — stock levels cannot go negative
- User management — emails must be unique, roles must be valid

### Pros

- Impossible states are prevented at the database level, not just the application level
- Data integrity is maintained even if the application has bugs
- Constraints serve as machine-readable documentation of business rules

### Cons

- Over-constraining can make schema changes painful
- Some consistency rules are too complex for database constraints and must live in application code
- Cross-database consistency (in microservices) is not guaranteed — requires patterns like Saga or 2PC

---

## I — Isolation

### The property

> Concurrent transactions execute **as if they ran sequentially**, one after the other. Intermediate states of a transaction are invisible to other transactions.

Isolation is the most complex of the four ACID properties because it directly impacts performance — the stricter the isolation, the more transactions must wait for each other.

### The problem it solves

Without isolation, concurrent transactions interfere with each other, causing several categories of anomalies:

### Isolation anomalies

**Dirty Read** — reading uncommitted data from another transaction:

```
Transaction 1                    Transaction 2
─────────────────────────────    ─────────────────────────
BEGIN                            BEGIN
UPDATE balance = 1000            
                                 READ balance → sees 1000  ← DIRTY READ
ROLLBACK                         (T1 rolled back, 1000 never existed)
                                 (T2 made decisions based on phantom data)
```

**Non-Repeatable Read** — reading the same row twice and getting different values:

```
Transaction 1                    Transaction 2
─────────────────────────────    ─────────────────────────
BEGIN                            BEGIN
READ price → 100                 
                                 UPDATE price = 200
                                 COMMIT
READ price → 200                 ← NON-REPEATABLE READ
(same query, different result within same transaction)
```

**Phantom Read** — a query returns different rows when run twice:

```
Transaction 1                    Transaction 2
─────────────────────────────    ─────────────────────────
BEGIN                            BEGIN
SELECT * WHERE age > 18          
→ returns 5 rows                 INSERT new user age=25
                                 COMMIT
SELECT * WHERE age > 18          
→ returns 6 rows ← PHANTOM READ
(new row appeared mid-transaction)
```

**Lost Update** — two transactions overwrite each other's changes:

```
Transaction 1                    Transaction 2
─────────────────────────────    ─────────────────────────
BEGIN                            BEGIN
READ stock = 10                  READ stock = 10
                                 UPDATE stock = 10 - 3 = 7
                                 COMMIT
UPDATE stock = 10 - 2 = 8       
COMMIT
FINAL stock = 8  ← T2's update is lost (should be 5)
```

### Isolation levels

SQL standard defines four isolation levels, each preventing a different set of anomalies:

```
ISOLATION LEVEL        │ Dirty Read │ Non-Repeatable │ Phantom Read
───────────────────────┼────────────┼────────────────┼─────────────
READ UNCOMMITTED       │ Possible   │ Possible       │ Possible
READ COMMITTED         │ Prevented  │ Possible       │ Possible
REPEATABLE READ        │ Prevented  │ Prevented      │ Possible
SERIALIZABLE           │ Prevented  │ Prevented      │ Prevented
```

**READ UNCOMMITTED** — sees uncommitted changes from other transactions. Almost never used.

**READ COMMITTED** — default in PostgreSQL and Oracle. Only sees committed data. Dirty reads prevented.

**REPEATABLE READ** — default in MySQL/InnoDB. Once you read a row, you see the same value for the rest of the transaction. Non-repeatable reads prevented.

**SERIALIZABLE** — strongest level. Transactions behave as if they ran one at a time. All anomalies prevented, but highest performance cost.

### Implementation: Locking vs. MVCC

Databases use two main mechanisms to implement isolation:

**Locking (pessimistic concurrency):**

```sql
-- Acquire a lock before reading — block other writers
SELECT balance FROM accounts WHERE id = 'alice' FOR UPDATE;
-- Other transactions must wait until this transaction commits or rolls back

-- Shared lock — allows other readers, blocks writers
SELECT * FROM products WHERE id = 1 FOR SHARE;
```

**MVCC — Multi-Version Concurrency Control (optimistic concurrency):**

```
MVCC stores multiple versions of each row, stamped with transaction IDs.
Each transaction reads the version that was committed before it started.
Writers create new versions; readers see an older consistent snapshot.
No blocking between readers and writers.

Row versions in PostgreSQL:
  accounts (alice):
    version 1: balance=1500  [committed by txn-10]
    version 2: balance=1000  [committed by txn-15]  ← current
    version 3: balance=900   [in progress by txn-20] ← invisible to others

Transaction 18 reads alice's balance → sees version 2 (1000)
(version 3 not yet committed when txn-18 started)
```

Most modern databases (PostgreSQL, MySQL InnoDB, Oracle, SQL Server) use MVCC for better read concurrency.

### Setting isolation level in code

```javascript
// PostgreSQL — set isolation level per transaction
async function processPayment(userId, amount) {
  const client = await pool.connect();
  try {
    // SERIALIZABLE — strongest isolation for financial operations
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const { rows: [account] } = await client.query(
      'SELECT balance FROM accounts WHERE user_id = $1 FOR UPDATE',
      [userId]
    );

    if (account.balance < amount) throw new Error('Insufficient funds');

    await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE user_id = $2',
      [amount, userId]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    // SERIALIZABLE may throw serialization errors — retry
    if (err.code === '40001') return processPayment(userId, amount); // retry
    throw err;
  } finally {
    client.release();
  }
}
```

### Use cases

- Financial transactions — prevent lost updates and dirty reads
- Inventory management — prevent overselling under concurrent orders
- Ticket booking — prevent double-booking of the same seat
- Reporting queries — prevent phantom rows from skewing aggregations

### Pros

- Concurrent transactions are safe — no anomalies at higher isolation levels
- MVCC allows high read concurrency without blocking
- Isolation level can be tuned per transaction — use stricter levels only where needed

### Cons

- Higher isolation levels mean more locking or conflict detection — reduced throughput
- SERIALIZABLE can cause serialization failures that require application-level retry logic
- Deadlocks are possible when multiple transactions lock the same rows in different orders
- Long-running transactions at high isolation levels hold resources longer

---

## D — Durability

### The property

> Once a transaction is committed, its changes are **permanent**. They survive system crashes, power failures, and restarts.

A committed transaction will not be lost. The database guarantees that committed data has been written to non-volatile storage.

### The problem it solves

Without durability, a "successful" commit might only be in memory — a crash before the data reaches disk means the data is lost forever.

```
Without durability:
  Application: COMMIT → database returns "OK"
  Data is in memory buffer → CRASH
  System restarts → data is gone
  Application thinks it succeeded — user thinks order was placed
  Database has no record of it
```

### How it works

Durability is implemented using the **Write-Ahead Log (WAL)**:

```
Write path with WAL:
  1. Transaction writes changes to WAL (sequential disk write — fast)
  2. Database returns COMMIT confirmation to application
  3. Data pages are written to actual table files (asynchronously — slower)

Recovery path after crash:
  1. Database starts up, reads WAL from last checkpoint
  2. Re-applies all committed transactions from the log (redo)
  3. Rolls back any uncommitted transactions found in the log (undo)
  4. Database is restored to exact state at time of crash
```

**Why WAL is fast:** Sequential writes to a log file are much faster than random writes to data pages. The database acknowledges the commit as soon as the WAL is flushed to disk, before the actual data pages are updated.

### fsync — the critical guarantee

```
PostgreSQL fsync behavior:
  fsync = on  (default)
    → WAL is flushed to physical disk before COMMIT returns
    → Durability guaranteed even if OS crashes
    → Slower — disk I/O on every commit

  fsync = off
    → WAL stays in OS page cache (may not reach disk before crash)
    → Faster — but COMMIT success is no longer a durability guarantee
    → NEVER use in production for data you care about
```

### Durability in replicated systems

In distributed databases, durability extends to replication — a commit may only be acknowledged after being written to a quorum of nodes:

```
Synchronous replication (strong durability):
  Primary commits → waits for at least one replica to confirm write
  → Primary COMMIT returns only after replica confirms
  → Data survives even if primary crashes immediately after COMMIT
  → Higher latency

Asynchronous replication (weaker durability):
  Primary commits → sends to replica in background
  → Primary COMMIT returns immediately
  → If primary crashes before replica gets the write → data loss
  → Lower latency
```

```javascript
// Application-side durability considerations
// Acknowledge the user only after durable commit is confirmed

async function placeOrder(orderData) {
  try {
    const order = await db.transaction(async (trx) => {
      const [newOrder] = await trx('orders').insert(orderData).returning('*');
      await trx('inventory').decrement('stock', orderData.quantity)
        .where({ product_id: orderData.productId });
      return newOrder;
    });

    // Only send confirmation email AFTER transaction committed
    // The order is now durable — will survive any crash
    await emailService.sendOrderConfirmation(order);

    return { success: true, orderId: order.id };

  } catch (err) {
    // Transaction rolled back — order was not placed
    // Do NOT send confirmation email
    throw new Error('Order failed — please try again');
  }
}
```

### Durability trade-offs

Some systems intentionally relax durability for performance:

```sql
-- PostgreSQL: unlogged tables — faster writes, no durability
-- Useful for temporary/staging data, not production records
CREATE UNLOGGED TABLE session_cache (
  session_id TEXT PRIMARY KEY,
  data       JSONB,
  expires_at TIMESTAMPTZ
);
-- Data lost on crash — acceptable for cache, not for orders
```

### Use cases

- Payment confirmation — a committed charge must never be lost
- Order records — customers expect orders to exist after confirmation
- Audit logs — compliance records must be immutable and permanent
- Medical records — patient data loss is legally and ethically unacceptable

### Pros

- Applications can trust that COMMIT means the data is safe
- System restarts and crashes are transparent to users
- WAL enables point-in-time recovery (restore the database to any moment in time)

### Cons

- fsync adds latency on every commit — the price of durability
- WAL storage adds disk space requirements
- Synchronous replication adds network round-trip latency to every commit
- Extremely high write throughput may require batching commits (group commit)

---

## ACID Properties Working Together

The four properties are deeply interdependent — they work as a system, not in isolation:

```
ATOMICITY ensures → no partial states exist
  └─ which means CONSISTENCY can be maintained
       └─ because incomplete operations never reach committed state

ISOLATION ensures → no interference between concurrent transactions
  └─ which means CONSISTENCY is maintained even with many concurrent users
       └─ because each transaction sees a valid state

DURABILITY ensures → committed changes survive failures
  └─ which means ATOMICITY is preserved across crashes
       └─ because the WAL knows which transactions committed
```

### A full example — all four properties in action

```sql
-- E-commerce order placement
BEGIN TRANSACTION;                           -- ATOMICITY: all or nothing

  -- CONSISTENCY check: user exists (foreign key)
  -- CONSISTENCY check: product exists (foreign key)
  -- ISOLATION: FOR UPDATE locks rows so concurrent orders don't oversell

  SELECT stock FROM products
    WHERE id = 42 FOR UPDATE;               -- acquires row lock (ISOLATION)

  -- CONSISTENCY: check business rule
  -- (application code checks stock >= quantity)

  UPDATE products
    SET stock = stock - 2
    WHERE id = 42;

  INSERT INTO orders (user_id, product_id, quantity, total)
    VALUES (7, 42, 2, 199.98);

  INSERT INTO payments (order_id, amount, status)
    VALUES (LASTVAL(), 199.98, 'pending');

COMMIT;
-- DURABILITY: WAL flushed to disk — changes survive any subsequent crash
-- ATOMICITY:  all three statements committed or none
-- CONSISTENCY: stock decremented, order and payment records created together
-- ISOLATION:  no other transaction saw intermediate state
```

---

## When ACID is Challenging — Distributed Transactions

ACID is straightforward in a single-node database. Distributed systems — microservices, sharded databases, multi-region deployments — make ACID significantly harder.

### The distributed transaction problem

```
Single database — easy:
  BEGIN;
    UPDATE orders...
    UPDATE inventory...
    UPDATE billing...
  COMMIT;
  → One engine manages all four ACID properties

Microservices — hard:
  Order Service (PostgreSQL) ──────────────────┐
  Inventory Service (MySQL)  ──── how do you   ├─ ACID across three
  Billing Service (MongoDB)  ──── coordinate?  ┘   separate databases?
```

### Solutions for distributed ACID

**Two-Phase Commit (2PC):**

```
Phase 1 — Prepare:
  Coordinator → "Can you commit?" → Order DB, Inventory DB, Billing DB
  Each DB:
    - Executes the operations
    - Writes to its own WAL
    - Replies "ready" or "abort"

Phase 2 — Commit or Abort:
  If all say "ready" → Coordinator sends COMMIT to all
  If any says "abort" → Coordinator sends ROLLBACK to all

Problem: if coordinator crashes between phases → nodes are blocked
```

**Saga Pattern (eventual consistency alternative):**

```javascript
// Saga: sequence of local transactions with compensating actions on failure

async function orderSaga(orderData) {
  const steps = [
    {
      execute:    () => orderService.createOrder(orderData),
      compensate: (result) => orderService.cancelOrder(result.orderId),
    },
    {
      execute:    (ctx) => inventoryService.reserveStock(ctx.orderId, orderData.productId),
      compensate: (ctx) => inventoryService.releaseStock(ctx.orderId),
    },
    {
      execute:    (ctx) => billingService.chargeCustomer(ctx.orderId, orderData.total),
      compensate: (ctx) => billingService.refundCustomer(ctx.orderId),
    },
  ];

  const results = [];
  for (const [index, step] of steps.entries()) {
    try {
      const result = await step.execute(results[index - 1]);
      results.push(result);
    } catch (err) {
      // Compensate all completed steps in reverse order
      for (let i = index - 1; i >= 0; i--) {
        await steps[i].compensate(results[i]);
      }
      throw new Error('Order saga failed and rolled back');
    }
  }
}
```

---

## ACID vs. BASE

ACID is often contrasted with BASE — the consistency model used by many distributed NoSQL databases:

| Property | ACID | BASE |
|---|---|---|
| **Full name** | Atomicity, Consistency, Isolation, Durability | Basically Available, Soft state, Eventually consistent |
| **Consistency** | Strong — valid state guaranteed after every transaction | Eventual — converges to consistency over time |
| **Availability** | May sacrifice availability for consistency | Always available, even if data is stale |
| **Concurrency** | Serialized or carefully isolated | Optimistic, conflict resolution after the fact |
| **Suitable for** | Financial systems, inventory, healthcare | Social feeds, caches, user activity, IoT |
| **Examples** | PostgreSQL, MySQL, Oracle, SQL Server | Cassandra, DynamoDB, CouchDB, MongoDB (default) |

```javascript
// ACID — bank transfer must be atomic and consistent
await db.transaction(async (trx) => {
  await trx('accounts').where({ id: fromId }).decrement('balance', amount);
  await trx('accounts').where({ id: toId }).increment('balance', amount);
});
// Either both happen or neither — no middle ground

// BASE — social media like count
await cassandra.execute(
  'UPDATE posts SET like_count = like_count + 1 WHERE id = ?', [postId]
);
// May be slightly inaccurate across replicas for a moment
// Eventually all nodes will agree — acceptable for a like count
```

---

## ACID in Popular Databases

| Database | ACID Support | Notes |
|---|---|---|
| **PostgreSQL** | Full ACID | Industry gold standard for ACID compliance |
| **MySQL (InnoDB)** | Full ACID | InnoDB engine required — MyISAM is not ACID |
| **Oracle** | Full ACID | Enterprise-grade ACID with advanced isolation |
| **SQL Server** | Full ACID | Full compliance with snapshot isolation option |
| **SQLite** | Full ACID | Serialized writes — ACID on single file |
| **MongoDB** | Multi-document ACID (v4.0+) | Single-document atomic by default; multi-doc needs explicit transaction |
| **Cassandra** | Lightweight transactions (LWT) only | Mostly BASE; LWT for conditional writes only |
| **DynamoDB** | Transactions (v2018+) | Supports ACID transactions across items/tables |
| **Redis** | Partial (MULTI/EXEC) | Atomic command batches; no rollback on error |
| **CockroachDB** | Full ACID (distributed) | ACID across distributed nodes using consensus |
| **Google Spanner** | Full ACID (global) | Globally distributed ACID using TrueTime |

---

## Common Misconceptions

**"Consistency in ACID is the same as in CAP."**
They are completely different concepts. ACID consistency means the database respects its own invariants and constraints. CAP consistency means every node in a distributed system returns the same data (linearizability).

**"ACID means the database is slow."**
Modern databases implement ACID efficiently using MVCC, group commit, and WAL optimizations. Many high-throughput systems run on fully ACID databases.

**"NoSQL databases can't do ACID."**
Many NoSQL databases now support ACID transactions — MongoDB (v4.0+), DynamoDB, CockroachDB. The label "NoSQL" no longer implies BASE-only.

**"Isolation means transactions are completely invisible to each other."**
Only at the SERIALIZABLE level. Lower isolation levels allow controlled visibility of other transactions' data to improve performance.

**"Durability means the data is backed up."**
Durability guarantees committed data survives a crash — not that it's backed up or replicated. A single-node database with durability can still lose data if the disk dies. Backups and replication are separate concerns.

---

## Quick Reference Card

```
ACID Properties
  ├─ A  Atomicity
  │     All operations succeed or all are rolled back
  │     Implemented via: Write-Ahead Log (WAL), ROLLBACK
  │     Prevents: Partial updates, orphaned data
  │
  ├─ C  Consistency
  │     Transaction moves DB from one valid state to another
  │     Implemented via: Constraints, triggers, application rules
  │     Prevents: Constraint violations, invalid data states
  │
  ├─ I  Isolation
  │     Concurrent transactions don't interfere
  │     Implemented via: MVCC, locking, isolation levels
  │     Prevents: Dirty reads, non-repeatable reads, phantom reads, lost updates
  │     Levels: READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE
  │
  └─ D  Durability
        Committed data survives crashes
        Implemented via: WAL + fsync, synchronous replication
        Prevents: Data loss after confirmed commit

Isolation anomalies prevented per level:
  READ UNCOMMITTED  → none
  READ COMMITTED    → dirty reads
  REPEATABLE READ   → dirty reads + non-repeatable reads
  SERIALIZABLE      → all anomalies

ACID vs BASE:
  ACID = correctness first (finance, inventory, healthcare)
  BASE = availability first (social feeds, caches, analytics)

Distributed ACID solutions:
  2PC   → strong consistency, coordinator is single point of failure
  Saga  → eventual consistency, compensating transactions on failure
```

---

> ACID is not just a database feature — it is a contract between the database and the application. When you call COMMIT, you are trusting that the database honors all four properties. Understanding what each property guarantees — and what it costs — lets you make intentional decisions about where to use strict ACID compliance, where to relax it for performance, and how to architect systems that stay correct even when things go wrong.
