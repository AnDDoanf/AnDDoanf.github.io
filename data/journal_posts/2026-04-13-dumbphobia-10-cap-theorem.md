---
title: "DumbPhobia#10 CAP Theorem"
date: 2026-04-13
tags: [system-design]
---

> CAP theorem is one of the most referenced — and most misunderstood — concepts in distributed systems. Whether you're designing a database, building a microservice, or answering a design design interview, understanding CAP at a deep level separates engineers who make intentional tradeoffs from those who just pick technologies at random.

## What is CAP Theorem?

Formally proposed by Eric Brewer in 2000 and later proved by Gilbert and Lynch in 2002, CAP theorem states:

> **A distributed system can guarantee at most two of the following three properties simultaneously.**

| Letter | Property | What it means |
|---|---|---|
| **C** | Consistency | Every read receives the most recent write or an error |
| **A** | Availability | Every request receives a response — not necessarily the most recent data |
| **P** | Partition Tolerance | The system continues operating even when network messages between nodes are lost or delayed |

The critical insight is the word **"at most two."** In the presence of a real distributed system, **partition tolerance is not optional** — networks fail, packets get dropped, and nodes become unreachable. This means every real distributed system must choose between **C and A** when a partition occurs.

The real question CAP forces is: **when your network splits, do you prioritize correctness or uptime?**

---

## Understanding Each Property

### C — Consistency

In CAP, consistency means **linearizability** — not the same as ACID consistency in databases. A system is linearizable if every operation appears to occur instantaneously at some point between its invocation and completion, and every read reflects the most recent write.

```
Without consistency:
  Node A writes: x = 10
  Node B (not yet synced) reads x → returns 5  ← stale data

With consistency:
  Node A writes: x = 10
  Node B reads x → returns 10 (or blocks until it can)
```

A consistent system refuses to return stale data. If it cannot guarantee a fresh read, it returns an error rather than an outdated value.

### A — Availability

Availability means **every request receives a response** — no timeouts, no errors due to system state. The system is always up and always answers. However, the response might not contain the most recent data.

```
Without availability:
  Node B is partitioned from Node A
  Client sends read to Node B → Node B refuses / times out

With availability:
  Node B is partitioned from Node A
  Client sends read to Node B → Node B responds with whatever it has (possibly stale)
```

A highly available system prioritizes uptime over accuracy. It will always try to serve a response, even if it can't guarantee that response reflects the latest state.

### P — Partition Tolerance

A network partition occurs when nodes in a distributed system cannot communicate with each other — due to network failure, hardware issues, or latency spikes. Partition tolerance means the system **continues to function** even when some messages between nodes are lost.

```
Partition scenario:
  [Node A] ----✗---- [Node B]
     |                  |
  (writes)           (reads)

  Messages between A and B are being dropped.
  The system must still respond to clients on both sides.
```

In any real distributed system, you **cannot eliminate partitions** — they are a physical reality of networked computers. A "CA" system (consistent and available but not partition-tolerant) is essentially a single-node system, because the moment you have multiple nodes over a network, partitions become possible.

---

## The CAP Triangle

```
         Consistency
             /\
            /  \
           /    \
          / CP   \
         /        \
        /____  ____\
       /     \/     \
      /  CA   /\  AP  \
     /________/  \______\
Availability        Partition
                    Tolerance

Real distributed systems live on the CA — CP — AP edges.
Pure CA only exists in single-node or tightly-coupled non-distributed systems.
```

---

## Why You Always Sacrifice CA (Not P)

When a partition happens in a distributed system, you face a binary choice:

```
Option 1: Maintain Consistency (CP)
  → Reject writes or reads that cannot be guaranteed consistent
  → System returns errors or blocks until partition heals
  → Availability is sacrificed

Option 2: Maintain Availability (AP)
  → Continue serving reads and accepting writes on all nodes
  → Nodes diverge — different nodes may return different values
  → Consistency is sacrificed
```

There is no third option that preserves both. During a partition, you cannot be consistent AND available simultaneously — not without violating the laws of physics (network latency makes synchronization impossible in real time).

---

## CP Systems — Consistency + Partition Tolerance

### How they work

CP systems prioritize returning **correct data** over always being available. When a partition occurs, a CP system will refuse to respond rather than risk returning stale or conflicting data. Nodes may require a quorum (majority agreement) before acknowledging reads or writes.

```
Normal operation (no partition):
  Client → Write x=10 → Node A syncs to Node B → Both confirm → Success

During partition:
  [Node A] ---✗--- [Node B]
  Client → Write x=10 → Node A
  Node A cannot confirm Node B got the write
  Node A returns ERROR or blocks → Client must retry
  Consistency preserved, availability sacrificed
```

### Quorum-based consistency

Many CP systems use **quorum writes and reads** to ensure consistency:

```
Cluster: 5 nodes
Write quorum: 3 nodes must acknowledge a write for it to succeed
Read quorum:  3 nodes must agree on a value for it to be returned

If fewer than 3 nodes are reachable → operation fails
This guarantees the read and write quorums always overlap by at least one node
→ You always read at least one node that received the latest write
```

### Real-world CP systems

| System | Type | Why CP |
|---|---|---|
| **HBase** | Columnar store | Strong consistency for analytical workloads |
| **Zookeeper** | Coordination service | Configuration, leader election must be consistent |
| **etcd** | Key-value store | Kubernetes cluster state — wrong data is worse than no data |
| **MongoDB** (default config) | Document store | Single-primary writes ensure consistency |
| **Redis** (with clustering) | In-memory store | Cluster mode sacrifices some availability for consistency |
| **Consul** | Service mesh | Service discovery must be correct |

### Frontend relevance

```javascript
// CP behavior in practice — a failed write is better than a wrong state
async function transferFunds(fromAccount, toAccount, amount) {
  try {
    const result = await db.transaction(async (trx) => {
      await trx('accounts').where({ id: fromAccount }).decrement('balance', amount);
      await trx('accounts').where({ id: toAccount }).increment('balance', amount);
    });
    return result;
  } catch (err) {
    // CP system: if nodes can't agree, the transaction is rejected
    // Better to show an error than deduct money without crediting the other account
    throw new Error('Transaction failed — please retry');
  }
}
```

### Use cases

- **Financial systems** — bank transfers, payment processing, ledgers
- **Inventory management** — stock counts must be accurate; overselling is worse than unavailability
- **Distributed coordination** — leader election, distributed locks, configuration management
- **Healthcare records** — patient data must be accurate; a stale read could be dangerous

### Pros

- Data is always correct when returned
- No conflicting versions of the same record
- Simpler application logic — you don't need to handle stale or conflicting data

### Cons

- Reduced availability during partitions — system may return errors
- Higher latency — writes must be acknowledged by a quorum before returning
- More complex infrastructure — requires consensus algorithms (Raft, Paxos)
- Not suitable for global, geographically distributed systems with high latency

---

## AP Systems — Availability + Partition Tolerance

### How they work

AP systems prioritize **always responding** over always being correct. When a partition occurs, nodes continue to serve reads and accept writes independently. When the partition heals, the nodes reconcile their diverged state — a process called **eventual consistency**.

```
Normal operation (no partition):
  Client → Write x=10 → Node A → Replicates to Node B
  Read from Node B → returns 10 ✓

During partition:
  [Node A] ---✗--- [Node B]
  Client → Write x=10 → Node A (accepted)
  Client → Write x=20 → Node B (accepted simultaneously)
  Both nodes respond — they don't know about each other's writes

After partition heals:
  Node A has x=10, Node B has x=20
  System must reconcile — uses conflict resolution strategy
  (last-write-wins, merge, vector clocks, etc.)
```

### Conflict resolution strategies

```javascript
// Last Write Wins (LWW) — simplest, most common
// Use the write with the most recent timestamp
function resolveConflict(versionA, versionB) {
  return versionA.timestamp > versionB.timestamp ? versionA : versionB;
}

// Vector Clocks — track causality across nodes
// Each node maintains a counter; allows detecting concurrent writes
const vectorClock = {
  nodeA: 3,
  nodeB: 2,
  nodeC: 5,
};
// If versionA's clock dominates versionB's → A happened after B (no conflict)
// If neither dominates → concurrent writes → genuine conflict requiring merge

// Application-level merge — domain-specific logic
function mergeShoppingCarts(cartA, cartB) {
  // Take the union of both carts — never lose an item
  const merged = new Map();
  [...cartA.items, ...cartB.items].forEach(item => {
    const existing = merged.get(item.id);
    // Take the higher quantity if the same item appears in both
    merged.set(item.id, existing
      ? { ...item, quantity: Math.max(item.quantity, existing.quantity) }
      : item
    );
  });
  return { items: Array.from(merged.values()) };
}
```

### Eventual consistency

AP systems are eventually consistent — given enough time with no new writes, all nodes will converge to the same value. The key word is **eventually** — there is no guarantee of how long convergence takes.

```
t=0   Node A: x=10,  Node B: x=10   (in sync)
t=1   Partition begins
t=2   Client writes x=20 to Node A
t=3   Client reads from Node B → returns 10  (stale but available)
t=4   Client reads from Node A → returns 20  (fresh)
t=5   Partition heals — replication resumes
t=6   Node B receives x=20 from Node A
t=7   Both nodes: x=20  (eventually consistent)
```

### Real-world AP systems

| System | Type | Why AP |
|---|---|---|
| **Cassandra** | Wide-column store | Global distribution, always-on writes prioritized |
| **DynamoDB** | Key-value store | Amazon's "always available" shopping cart design |
| **CouchDB** | Document store | Designed for offline-first sync, peer-to-peer |
| **Riak** | Key-value store | Conflict resolution via vector clocks |
| **DNS** | Name resolution | Propagation delays are acceptable; downtime is not |
| **CDNs** | Content delivery | Edge caches may serve stale content briefly |

### Frontend relevance

```javascript
// AP behavior in practice — optimistic updates and eventual consistency

// Shopping cart — AP approach (Amazon's actual design)
// Write locally immediately, sync to server, handle conflicts later
async function addToCart(item) {
  // 1. Update local state immediately (available)
  dispatch({ type: 'ADD_ITEM', payload: item });

  // 2. Sync to server in background
  try {
    await api.post('/cart/items', item);
  } catch (err) {
    // If sync fails, queue for retry — don't block the user
    offlineQueue.push({ action: 'ADD_ITEM', item });
  }
}

// React Query with stale-while-revalidate — AP at the HTTP caching layer
const { data } = useQuery({
  queryKey: ['feed'],
  queryFn:  fetchFeed,
  staleTime: 30 * 1000,   // serve cached (possibly stale) data for 30s
  // AP: always return something, refresh in background
});

// Optimistic UI — show the result before server confirms
const mutation = useMutation({
  mutationFn: likePost,
  onMutate: async (postId) => {
    // Immediately update cache (AP — available before consistent)
    queryClient.setQueryData(['post', postId], old => ({
      ...old,
      likesCount: old.likesCount + 1,
      isLiked:    true,
    }));
  },
  onError: (err, postId, context) => {
    // Roll back if server rejects (consistency eventually enforced)
    queryClient.setQueryData(['post', postId], context.previousPost);
  },
});
```

### Use cases

- **Social media feeds** — showing slightly stale posts is far better than showing nothing
- **Shopping carts** — users must always be able to add items
- **DNS** — stale records are acceptable; total unavailability is not
- **Collaborative documents** — Google Docs accepts offline edits and merges on reconnection
- **CDN caching** — edge nodes serve cached content even when origin is unreachable
- **IoT sensor data** — always record readings; reconcile later

### Pros

- Always responds to requests — no availability sacrifice during partitions
- Lower latency — no need to wait for quorum agreement
- Better suited for global distribution across geographically distant nodes
- Natural fit for offline-first applications

### Cons

- Data may be stale — reads do not guarantee the latest write
- Conflicts are possible and must be resolved — adds application complexity
- Eventual consistency is hard to reason about for developers used to ACID
- Business logic may be incorrect on stale data (overselling inventory, double-spending)

---

## CA Systems — Consistency + Availability (No Partition Tolerance)

### What they are

CA systems are consistent and available but cannot tolerate network partitions. In practice, this means **a single-node system** or systems that run within a single, tightly-controlled network where partitions are treated as total failures rather than events to handle gracefully.

```
CA in practice:
  Single PostgreSQL instance — ACID compliant, always available
  → But: if the machine crashes, the whole system goes down
  → No partition tolerance because there's only one node

Traditional RDBMS (single node):
  MySQL, PostgreSQL, SQLite in single-server deployments
  → Consistent and available within one machine
  → Scale by vertical scaling (bigger machine), not horizontal
```

### The CA misconception

Many articles describe systems as "CA" — but in a truly distributed multi-node deployment, CA is not achievable. Any system you replicate across nodes must choose C or A when a partition occurs. What people usually mean by "CA" is:

```
"We prioritize consistency and availability, and we handle
 partitions by treating them as full outages rather than
 partial failures to route around."
```

### Use cases

- Traditional single-node RDBMS (PostgreSQL, MySQL) — the workhorse of most web applications
- Tightly-coupled in-process data stores
- Embedded databases (SQLite) — no network, no partitions

---

## PACELC — The Extension of CAP

CAP only addresses behavior **during** partitions. But partitions are rare — what about normal operation? **PACELC** extends CAP to cover the everyday tradeoff:

> **If there is a Partition (P), choose between Availability (A) and Consistency (C).  
> Else (E), even without a partition, choose between Latency (L) and Consistency (C).**

```
PACELC = PA/EL or PA/EC or PC/EL or PC/EC

Example classifications:
  Cassandra  → PA/EL  (AP during partition, low latency + eventual consistency normally)
  DynamoDB   → PA/EL  (AP during partition, tunable latency/consistency tradeoff)
  HBase      → PC/EC  (CP during partition, consistent reads normally — higher latency)
  PostgreSQL → PC/EC  (single node — always consistent, latency of disk I/O)
  Spanner    → PC/EC  (globally consistent — uses atomic clocks, high latency tradeoff)
```

The latency vs. consistency tradeoff in normal operation is often more relevant day-to-day than the partition scenario:

```
Strong consistency (no partition):
  Client writes x=10 → Leader propagates to all replicas
  → All replicas confirm → Leader responds to client
  → High latency — client waits for cross-node synchronization

Eventual consistency (no partition):
  Client writes x=10 → Leader responds immediately
  → Propagates to replicas asynchronously in background
  → Low latency — client doesn't wait for replication
```

---

## Consistency Models Beyond CAP

CAP's consistency is binary — linearizable or not. Real systems operate across a spectrum:

```
STRONG ──────────────────────────────────────────── WEAK

Linearizability   Sequential   Causal   Monotonic   Eventual
     │               │           │          │           │
   Strictest      Ordered      Causes    Reads        "Eventually"
   ordering       globally     visible   never go     all nodes
   across all     but not      causally  backwards    agree
   operations     real-time    related
     │
  Hardest to
  achieve across
  distributed
  nodes
```

### Linearizability (Strongest)

Every operation appears atomic and in real-time order. A read always reflects the most recent write. Used by: etcd, Zookeeper.

### Causal Consistency

Operations that are causally related (A caused B) are seen in order by all nodes. Concurrent unrelated operations may be seen in any order. Used by: some Cassandra configurations, MongoDB causal sessions.

```javascript
// Causal consistency example
// If you post a comment and then read comments, you always see your own comment
// (causally related — your write caused your read)
// Other users' concurrent comments may appear in any order

const session = await db.startCausalSession();
await session.write('comments', newComment);
const comments = await session.read('comments');
// Guaranteed to include newComment (causal), others may vary
```

### Monotonic Read Consistency

Once you read a value, you will never read an older value. Reads don't go backwards in time.

```javascript
// If you saw post count = 150, you will never see 148 again
// Even if you switch to a different replica
```

### Eventual Consistency (Weakest)

Given no new writes, all replicas will converge to the same value — eventually. No guarantees on timing or intermediate states.

---

## CAP in System Design Interviews

When you encounter a system design question, CAP drives your database choice. Use this framework:

```
Step 1: Identify the core data requirement
  └─ Is correctness critical? (money, inventory, health records)
     → Lean CP
  └─ Is uptime critical? (social feeds, search, caching)
     → Lean AP

Step 2: Identify the partition scenario
  └─ What happens if two data centers can't talk to each other?
  └─ Should we serve stale data or show an error?

Step 3: Choose and justify
  └─ "We'll use Cassandra here because the feed must be available
      even during network issues, and showing a slightly stale post
      is far less harmful than showing nothing."

  └─ "We'll use a CP database (PostgreSQL with synchronous replication)
      for the payments service because showing an incorrect balance
      is worse than a temporary error."
```

### Example decisions for common system design problems

```
Twitter/X feed          → AP — Cassandra, DynamoDB
                            (stale tweets are fine; unavailability is not)

Payment processing      → CP — PostgreSQL, CockroachDB
                            (wrong balance is catastrophic)

Uber driver locations   → AP — Cassandra
                            (slight staleness tolerable; always must update)

Distributed lock        → CP — Zookeeper, etcd
                            (wrong lock = race condition = data corruption)

User session store      → AP — Redis (with replication)
                            (occasional session loss tolerable vs. auth downtime)

Product catalog         → AP — Elasticsearch, DynamoDB
                            (stale product info is acceptable)

Inventory count         → CP — PostgreSQL
                            (overselling is a serious business problem)

DNS                     → AP — by design
                            (stale records tolerable; downtime is not)

Google Docs collab      → AP — operational transforms + eventual sync
                            (offline edits must work; conflicts resolved on merge)
```

---

## Common Misconceptions

**"You can choose any two of C, A, P."**
In a real distributed system with multiple nodes, partition tolerance is mandatory. The real choice is always between C and A when a partition happens.

**"AP means the system is inconsistent."**
AP means the system is *eventually* consistent. During normal operation, an AP system is often functionally consistent — divergence only occurs during and immediately after partitions.

**"CP systems are always slow."**
Not necessarily. A CP system with a well-tuned consensus algorithm (like Raft in etcd) can be extremely fast for read-heavy workloads within a single data center.

**"Choosing AP means giving up all correctness guarantees."**
AP systems offer many consistency models (monotonic reads, causal consistency, read-your-writes) that provide strong practical guarantees while remaining available.

**"CAP is the only tradeoff that matters."**
PACELC shows that latency vs. consistency is equally important in normal operation. Real-world database selection involves CAP, PACELC, ACID vs. BASE, read/write ratios, query patterns, and operational complexity.

---

## ACID vs. BASE

CAP is closely related to the ACID vs. BASE distinction in database design:

| Property | ACID | BASE |
|---|---|---|
| **Stands for** | Atomicity, Consistency, Isolation, Durability | Basically Available, Soft state, Eventually consistent |
| **Consistency model** | Strong (linearizable) | Eventual |
| **Availability** | Secondary concern | Primary concern |
| **CAP alignment** | CP | AP |
| **Typical systems** | PostgreSQL, MySQL, Oracle | Cassandra, DynamoDB, CouchDB |
| **Use when** | Correctness is critical | Availability and scale are critical |

```javascript
// ACID — all or nothing
BEGIN TRANSACTION;
  UPDATE accounts SET balance = balance - 100 WHERE id = 'alice';
  UPDATE accounts SET balance = balance + 100 WHERE id = 'bob';
COMMIT;
-- Either both updates happen or neither does

// BASE — write what you can, reconcile later
await cassandra.execute(
  'UPDATE accounts SET balance = balance - 100 WHERE id = ?', ['alice']
);
await cassandra.execute(
  'UPDATE accounts SET balance = balance + 100 WHERE id = ?', ['bob']
);
// These are separate operations — no atomicity guarantee across nodes
// Eventual consistency will propagate both changes — but not atomically
```

---

## Quick Reference Card

```
CAP Theorem
  ├─ C (Consistency)        Every read gets the latest write or an error
  ├─ A (Availability)       Every request gets a response (may be stale)
  └─ P (Partition Tolerance) System works even when nodes can't communicate

Real choice: C vs. A during a partition (P is mandatory)

CP Systems (Consistency + Partition Tolerance)
  ├─ Returns error during partition rather than stale data
  ├─ Uses quorum writes/reads for agreement
  ├─ Examples: HBase, Zookeeper, etcd, MongoDB (default)
  └─ Best for: Finance, inventory, coordination, healthcare

AP Systems (Availability + Partition Tolerance)
  ├─ Returns stale data during partition rather than an error
  ├─ Uses eventual consistency + conflict resolution
  ├─ Examples: Cassandra, DynamoDB, CouchDB, DNS, CDNs
  └─ Best for: Social feeds, carts, search, caching, IoT

CA Systems (Consistency + Availability)
  ├─ Single-node or tightly-coupled — no real partitions
  ├─ Examples: Single-node PostgreSQL, MySQL, SQLite
  └─ Best for: Traditional web apps, not truly distributed

PACELC extends CAP:
  ├─ During Partition → choose A or C (CAP)
  └─ Else (normal ops) → choose Latency or Consistency

Consistency spectrum (strong → weak):
  Linearizability → Sequential → Causal → Monotonic → Eventual

ACID ↔ BASE:
  ACID = CP = strong consistency = correctness first
  BASE = AP = eventual consistency = availability first
```

---

> CAP theorem does not tell you which system to build — it tells you which tradeoff you are making. Every distributed system makes this tradeoff, whether the architects knew it or not. The senior engineer's job is to make the tradeoff consciously, document it, and design the application layer to handle the consequences gracefully.
