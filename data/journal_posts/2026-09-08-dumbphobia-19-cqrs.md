---
title: "DumbPhobia#019: Command Query Responsibility Segregation"
date: 2026-09-08
tags: [system-design]
image: /assets/post-covers/cqrs.png
author:
  name: An Doan
  link: https://anddoanf.github.io/
---

CQRS stands for **Command Query Responsibility Segregation**. It is an architectural pattern that separates operations that change system state from operations that only read data. In simple terms, **commands write and queries read**. A traditional CRUD application often uses the same service layer, domain model, and database schema for both responsibilities, while CQRS allows the write path and read path to be designed independently.

A conventional application may look like this:

```text
Client → API → Service → Database
```

The same database may need to handle order creation, payment updates, inventory changes, order history, search, reports, and dashboards. CQRS separates those concerns:

```text
Client
  ├── Command → Command Handler → Write Model → Write Database
  └── Query   → Query Handler   → Read Model  → Read Database
                                              ↑
                                  Events → Projection
```

The key point is that **CQRS is not automatically faster**. Its performance benefits come from allowing reads and writes to use different models, schemas, databases, scaling strategies, and optimization techniques.

## Commands vs Queries

A command expresses an intention to change state, while a query asks the system for information without changing domain state.

| Aspect          | Command                                                    | Query                                                          |
| --------------- | ---------------------------------------------------------- | -------------------------------------------------------------- |
| Purpose         | Change system state                                        | Retrieve information                                           |
| Examples        | `CreateUser`, `PlaceOrder`, `TransferMoney`, `CancelOrder` | `GetUser`, `SearchProducts`, `GetOrderHistory`, `GetDashboard` |
| Typical logic   | Validation, business rules, authorization, persistence     | Filtering, searching, aggregation, formatting                  |
| Main concern    | Correctness and consistency                                | Speed and presentation                                         |
| Usually returns | Success, failure, identifier, status                       | Data                                                           |

A typical command flow is `Command → Validation → Domain Logic → Write Database`, while a query flow is usually `Query → Read Model → Result`.

## Why CQRS Can Make Reads Faster

Consider an ecommerce system where an order-history page needs to show order number, product names, total price, payment status, shipment status, seller information, and creation date. In a normalized relational database, this data may be spread across `orders`, `order_items`, `products`, `payments`, `shipments`, and `sellers`.

A conventional query might look like this:

```sql
SELECT
    o.id,
    o.created_at,
    p.name,
    oi.quantity,
    pay.status,
    s.status AS shipping_status,
    seller.name
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
JOIN payments pay ON pay.order_id = o.id
JOIN shipments s ON s.order_id = o.id
JOIN sellers seller ON seller.id = p.seller_id
WHERE o.customer_id = ?
ORDER BY o.created_at DESC;
```

This is perfectly reasonable for a small application. The problem appears when the same complex query is executed thousands of times per second. CQRS allows the system to maintain a separate read projection that already contains the data in the shape required by the UI.

For example:

```text
customer_order_view

order_id
customer_id
product_names
total
payment_status
shipping_status
seller_name
created_at
```

The query can then become:

```sql
SELECT *
FROM customer_order_view
WHERE customer_id = ?
ORDER BY created_at DESC
LIMIT 20;
```

The main difference is where computation happens.

| Traditional Model                           | CQRS Read Projection                       |
| ------------------------------------------- | ------------------------------------------ |
| Join and aggregate every time a user reads  | Compute the projection when data changes   |
| Read cost is paid repeatedly                | Projection cost is paid mainly on writes   |
| Schema optimized for normalized persistence | Schema optimized for how the UI reads data |
| Complex query path                          | Simple lookup path                         |
| Usually one general-purpose database model  | Potentially many specialized read models   |

The important optimization is therefore not simply "CQRS is faster." It is better described as **moving expensive work from every read to the moments when relevant data changes**.

## Does CQRS Make Writes Faster?

Not necessarily. A command can actually involve more work than a traditional CRUD update because it may include validation, domain rules, transactions, event publication, and projection processing.

For example:

```text
PlaceOrder → Validate → Apply Business Rules → Commit Transaction → Publish Event → Update Projections
```

However, CQRS can improve write performance indirectly by isolating the transactional database from heavy read traffic. Suppose one PostgreSQL instance receives 500 writes per second and 20,000 complex reads per second. Those workloads compete for CPU, memory, connections, cache, locks, and disk I/O. If the read workload is moved elsewhere, the write database can focus on transactional work.

| Single-Database Architecture                                | CQRS-Oriented Architecture                                  |
| ----------------------------------------------------------- | ----------------------------------------------------------- |
| Reads and writes compete for the same resources             | Reads and writes can use separate infrastructure            |
| Scaling read traffic may require scaling the whole database | Read infrastructure can scale independently                 |
| Reporting queries can affect transaction latency            | Reporting can run on separate read stores                   |
| Same database technology for all workloads                  | Different technologies can serve different workloads        |
| Write latency may degrade under heavy query load            | Write database can stay focused on transactional operations |

A common production setup may use PostgreSQL for writes, Redis for cached views, Elasticsearch for search, and ClickHouse for analytics. CQRS makes this separation natural because the read side does not need to use the same storage technology as the write side.

## Real-Life Example 1: Ecommerce Marketplace

An Amazon-like marketplace has very different requirements for writes and reads. On the write side, the system must handle actions such as placing an order, reserving inventory, capturing payment, canceling orders, processing refunds, and updating shipment status. These operations care about business rules and correctness: inventory must not become negative, payment must not be captured twice, and an invalid order must not be accepted.

The read side is very different. Customers need product search, recommendations, order history, and shipment tracking, while sellers and administrators need dashboards, revenue reports, inventory views, and analytics. These operations care more about fast lookup, filtering, sorting, aggregation, and search quality.

| Ecommerce Write Side           | Ecommerce Read Side                                        |
| ------------------------------ | ---------------------------------------------------------- |
| Place order                    | Search products                                            |
| Reserve inventory              | View order history                                         |
| Capture payment                | View seller dashboard                                      |
| Cancel order                   | View revenue dashboard                                     |
| Refund payment                 | Track shipment                                             |
| Update shipment                | Generate analytics                                         |
| Requires strict business rules | Requires fast filtering and aggregation                    |
| Typically transactional SQL    | May use Elasticsearch, Redis, ClickHouse, or read replicas |

A possible architecture is:

```text
Commands → Order Service → PostgreSQL → Events
                                      ├── Elasticsearch Projection
                                      ├── Customer Order Projection
                                      ├── Seller Dashboard Projection
                                      └── Analytics Projection
```

An `OrderPlaced` event can update several read models at once. The customer order history can be updated for the buyer, the seller dashboard can increment order metrics, an analytics store can update revenue statistics, and inventory views can refresh availability. This is a strong use case for CQRS because the data is the same but the required read representations are completely different.

## Real-Life Example 2: Banking Transaction System

A banking system is another useful example because write-side correctness is significantly more important than read-side convenience. A `TransferMoney` command may need to verify that both accounts exist, the sender has sufficient funds, neither account is frozen, transfer limits are respected, and fraud checks pass before money is moved.

The read side may need to display current balance, transaction history, monthly spending, spending by category, statements, operational reports, and fraud dashboards. These are analytically different from the transaction itself.

| Banking Write Side          | Banking Read Side                      |
| --------------------------- | -------------------------------------- |
| Transfer money              | View balance                           |
| Deposit funds               | View transaction history               |
| Withdraw funds              | Monthly spending summary               |
| Freeze account              | Spending by category                   |
| Settle payment              | Generate statements                    |
| Enforce account rules       | Fraud dashboard                        |
| Strong consistency required | Fast historical and analytical queries |
| Transaction-oriented schema | Aggregated or denormalized schema      |

Suppose an account has millions of transactions and a dashboard needs to calculate monthly spending by category. Repeatedly scanning raw transactions is expensive. A CQRS system can maintain a projection such as:

```text
monthly_spending_summary

account_id
year
month
category
total_amount
transaction_count
```

Then the dashboard only needs:

```sql
SELECT category, total_amount
FROM monthly_spending_summary
WHERE account_id = ?
AND year = ?
AND month = ?;
```

The transactional system remains optimized for safe transfers, while the reporting side is optimized for analytics.

## The Main Trade-Off: Eventual Consistency

Advanced CQRS architectures often update read projections asynchronously. For example, a user may update their name from `An` to `Doan An`, the write database commits immediately, an event is published, and the read projection updates 100 milliseconds later. During that short period, the write database contains the new value while the read database still contains the old value.

This is called **eventual consistency**.

| Advantage                                 | Cost                                                         |
| ----------------------------------------- | ------------------------------------------------------------ |
| Read models can be updated asynchronously | Read data may temporarily be stale                           |
| Write transactions stay focused and small | `POST` followed immediately by `GET` may return an old value |
| Read systems can fail independently       | Projection recovery logic is required                        |
| Read workloads can scale separately       | UI and API design must account for delay                     |

Systems often manage this using optimistic UI updates, version numbers, event sequence numbers, read-your-own-write strategies, synchronous projections for critical data, or temporary reads from the write model.

## How Frequently Should the Read Database Be Updated?

In most CQRS systems, the read database should **not** be updated by a fixed scheduled job unless the use case is intentionally batch-oriented. For operational data, the preferred pattern is usually event-driven: as soon as a write transaction commits, an event is published and a consumer updates the relevant read projection.

```text
Write Transaction → Commit → Event → Consumer → Read Projection
```

The important design question is therefore not "How often should the job run?" but **"How stale is this read model allowed to be?"**. Different projections can have completely different freshness requirements.

| Read Model             | Typical Strategy               |            Typical Acceptable Lag |
| ---------------------- | ------------------------------ | --------------------------------: |
| Order status           | Event-driven                   |                        < 1 second |
| Inventory availability | Event-driven                   |          Tens of ms to < 1 second |
| User profile           | Event-driven                   |                        < 1 second |
| Seller dashboard       | Event-driven or micro-batch    |                      1–10 seconds |
| Revenue dashboard      | Micro-batch                    |               10 seconds–1 minute |
| Analytics dashboard    | Micro-batch or scheduled batch |                       1–5 minutes |
| BI/reporting           | Scheduled batch                |                  5 minutes–1 hour |
| Daily reports          | Scheduled batch                |                             Hours |
| Search index           | Event-driven                   | Hundreds of ms to several seconds |

For example, an order-status projection should usually be updated immediately after `OrderPlaced`, `PaymentCompleted`, or `OrderShipped` events because users expect those changes to appear quickly. A monthly sales report, however, may only need to refresh every few minutes because exact sub-second freshness adds infrastructure cost without much business value.

A common production pattern is to separate **continuous projection updates** from **periodic reconciliation**.

| Mechanism             | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| Event consumer        | Keeps the read model up to date continuously                     |
| Micro-batch processor | Groups many updates for efficiency when slight lag is acceptable |
| Reconciliation job    | Detects and repairs missing or inconsistent projections          |
| Full rebuild job      | Recreates projections after schema or projection-logic changes   |

For example:

```text
Primary path:
Write DB → Outbox → Message Broker → Projection Consumer → Read DB

Safety path:
Reconciliation Job → Compare Source of Truth → Repair Read DB
```

The reconciliation process should generally not be the main synchronization mechanism. Its purpose is to recover from missed events, consumer failures, bugs, or data drift. Depending on the business criticality, a reconciliation job might run every 5–30 minutes, hourly, or less frequently.

The practical rule is simple: **user-facing operational data should normally be event-driven, dashboards can tolerate micro-batching, and analytical/reporting projections can use scheduled batches when freshness requirements are relaxed**.

## CQRS Does Not Require Multiple Databases

CQRS is fundamentally about separating responsibilities, not necessarily infrastructure. A small system can use command handlers and query handlers while still sharing a single PostgreSQL database.

```text
CreateOrderCommandHandler ─┐
                           ├── PostgreSQL
GetOrdersQueryHandler ─────┘
```

This is still CQRS because the application code treats writes and reads as separate models. If scale later becomes a problem, the architecture can evolve gradually.

| CQRS Level            | Architecture                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Logical CQRS          | Separate command and query handlers, same database                                         |
| Read replica CQRS     | Write database plus read replicas                                                          |
| Projection-based CQRS | Write database plus dedicated read models                                                  |
| Specialized CQRS      | PostgreSQL for writes, Elasticsearch for search, Redis for cache, ClickHouse for analytics |

This incremental approach is often better than introducing multiple databases and message brokers from day one.

## CQRS vs Event Sourcing

CQRS and Event Sourcing are frequently mentioned together, but they are different patterns.

| CQRS                                      | Event Sourcing                                      |
| ----------------------------------------- | --------------------------------------------------- |
| Separates write and read responsibilities | Stores state changes as a sequence of events        |
| Can use normal relational persistence     | Often persists events instead of only current state |
| Main concern is model separation          | Main concern is historical state reconstruction     |
| Can exist without events                  | Naturally produces events                           |
| Often useful with read projections        | Often combined with CQRS                            |

For example, traditional persistence might store `balance = 800`, while Event Sourcing might store `Deposit +1000`, `Withdraw -100`, and `Withdraw -100`. The current balance is reconstructed from those events. You can use CQRS without Event Sourcing, and in many systems that is the simpler choice.

## When CQRS Is a Good Fit

CQRS becomes attractive when reads and writes have significantly different requirements.

| Situation                             | Why CQRS Helps                                                |
| ------------------------------------- | ------------------------------------------------------------- |
| Read-heavy system                     | Read infrastructure can scale independently                   |
| Complex dashboards                    | Aggregations can be precomputed                               |
| Search-heavy application              | Search can use Elasticsearch or another specialized engine    |
| Complex business rules                | Command handlers can represent meaningful domain actions      |
| Many different views of the same data | Separate projections can serve different consumers            |
| Analytics-heavy platform              | Analytical stores can be separated from transactional storage |
| Event-driven architecture             | Events naturally update read projections                      |
| Different read/write scaling patterns | Infrastructure can be sized independently                     |

Typical examples include marketplaces, financial systems, logistics platforms, booking systems, high-traffic dashboards, IoT systems, and large event-driven applications.

## When CQRS Is Usually a Bad Fit

CQRS should not be added simply because a project needs "better architecture." It adds real operational and development complexity.

| Situation                                        | Why CQRS Is Probably Unnecessary                           |
| ------------------------------------------------ | ---------------------------------------------------------- |
| Simple CRUD application                          | One service and one database may already solve the problem |
| Low traffic                                      | Performance benefit may be negligible                      |
| Straightforward SQL queries                      | Indexing may solve the problem more cheaply                |
| Strong consistency required on nearly every read | Async projections become inconvenient                      |
| Small engineering team                           | Operational complexity may outweigh benefits               |
| Early-stage MVP                                  | Architecture can slow development before scale exists      |
| One read model is sufficient                     | Separate projections add little value                      |
| Database is not currently a bottleneck           | CQRS solves a problem that does not exist yet              |

Before adopting CQRS for performance reasons, it is usually worth trying indexes, query optimization, pagination, caching, materialized views, database partitioning, and read replicas first.

## CRUD vs CQRS

The broad architectural difference can be summarized as follows.

| Area                   | Traditional CRUD                | CQRS                            |
| ---------------------- | ------------------------------- | ------------------------------- |
| Read/write model       | Shared                          | Separate                        |
| Database schema        | Usually one schema              | Can use separate schemas        |
| Infrastructure         | Usually simpler                 | Potentially more complex        |
| Read optimization      | Limited by write-oriented model | Can use dedicated projections   |
| Write optimization     | Shares resources with reads     | Can be isolated from reads      |
| Scaling                | Often scale together            | Can scale independently         |
| Consistency            | Usually immediate               | Often eventual on read side     |
| Data duplication       | Low                             | Common and intentional          |
| Specialized databases  | Less common                     | Natural fit                     |
| Operational complexity | Lower                           | Higher                          |
| Best suited for        | CRUD and moderate workloads     | Complex or asymmetric workloads |

## The Performance Model Behind CQRS

The most useful way to understand CQRS performance is to think in terms of where computation is paid. In a traditional system, total work is approximately `writes × write_cost + reads × query_cost`. With CQRS, some read computation is shifted into projection updates, so total work becomes approximately `writes × (write_cost + projection_cost) + reads × simple_read_cost`.

If the application has very few reads, this may provide little benefit. If the application has 100 writes per second and 100,000 reads per second, paying a small extra projection cost on each write can significantly reduce total read computation.

| Metric                      |                            Traditional |                             CQRS Projection |
| --------------------------- | -------------------------------------: | ------------------------------------------: |
| Writes/sec                  |                                    100 |                                         100 |
| Reads/sec                   |                                100,000 |                                     100,000 |
| Average read cost           |                                  50 ms |                                        2 ms |
| Read computation per second |                           5,000,000 ms |                                  200,000 ms |
| Trade-off                   | Cheap writes, expensive repeated reads | Slightly heavier writes, much cheaper reads |

This is the main performance principle behind CQRS: **do slightly more work when data changes so that you do much less work every time the data is read**.

## Final Rule of Thumb

Use CQRS when the read side and write side are genuinely different problems. It is especially useful when the write model must prioritize business correctness while the read model must prioritize search, aggregation, low latency, dashboards, or large read volumes.

Do not use CQRS simply because it is considered scalable. A simple `API → Service → PostgreSQL` architecture is often the better solution until the application has clear evidence that read/write separation is valuable.

The real benefit of CQRS is not that it magically makes databases faster. Its value is that it allows you to stop forcing one data model, one schema, and one infrastructure stack to solve two fundamentally different concerns: **changing state correctly and retrieving information efficiently**.

