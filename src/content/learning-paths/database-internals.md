---
slug: database-internals
category: System Design
title: "Basics & Database Internals"
icon: "DB"
description: "The foundation of every systems design interview: how databases actually store, index, and protect your data. Following the 'Systems Design Interview: 0 to 1' curriculum — indexes (hash, B-tree, LSM), ACID transactions and every isolation level up to full serializability, then column stores and binary serialization. Master this and every 'which database?' decision becomes an argument you can win."
pattern: "Every lesson is one trade-off, stated honestly. Indexes trade write speed for read speed. Hash indexes trade range queries for O(1) lookups. LSM trees trade read amplification for sequential-write throughput. Isolation levels trade anomalies for performance: read committed (cheap, allows read skew) → snapshot isolation (consistent reads, allows write skew) → serializable (correct, pick your price: serial execution, 2PL blocking, or SSI retries). Column stores trade point-lookup speed for scan speed. Binary serialization trades human readability for size and schema safety. In the interview, name the mechanism, then name the cost — that pattern is the whole game."
whenToUse: [Choosing a database in any design interview, Explaining SQL vs NoSQL beyond buzzwords, Designing booking/payment flows that must not double-book, Write-heavy ingest pipelines, Analytics and data warehouse questions, Any 'why is this slow?' deep dive]
keyInsights:
  - An index is a derived structure that makes reads fast by taxing every write
  - Sorted structures (B-tree, LSM) buy range queries; hashing buys O(1) but destroys order
  - LSM trees turn random writes into sequential I/O — the write-heavy default
  - Weak isolation is the default; know which anomalies your level allows
  - Write skew is invisible to snapshot isolation — check-then-write needs locks or serializability
  - Serializability has exactly three implementations - serial execution, 2PL, and SSI
  - Row stores serve OLTP, column stores serve OLAP; real systems run both
  - Schemas with evolution rules (Protobuf tags, Avro resolution) are deployment insurance
questionIds: [sd-17, sd-18, sd-19, sd-20, sd-21, sd-22, sd-23, sd-24, sd-25, sd-26, sd-27, sd-28, sd-29, sd-30, sd-31]
---

## Course Map

Based on the **"Basics & Database Internals"** section of the *Systems Design Interview: 0 to 1* playlist (Jordan has no life). Follow the lessons in order — each builds on the previous.

**Part 1 — Storage & Indexes (lessons 1-6).** Start with what an interview measures and the framework to attack it. Then the core question of storage: how does a database find anything fast? Indexes trade write speed for read speed, and three data structures dominate: the **hash index** (an in-memory map over an append-only log — O(1), no ranges), the **B-tree** (sorted pages, in-place updates, the relational default), and the **LSM tree** (memtables flushed to immutable SSTables — the write-heavy champion). Lesson 6 consolidates them into a decision procedure.

**Part 2 — Transactions & Isolation (lessons 7-13).** What happens when operations run concurrently or crash halfway? **ACID** defines the guarantees; isolation is the negotiable one. Climb the ladder: **read committed** (no dirty reads/writes — but read skew slips through) → **snapshot isolation/MVCC** (consistent frozen views — but write skew survives) → the anomaly that breaks booking systems (**write skew & phantoms**) → the three genuine routes to **serializability**: execute serially (VoltDB/Redis), lock pessimistically (**2PL**), or detect optimistically (**SSI** — Postgres's SERIALIZABLE).

**Part 3 — Analytics & Data Movement (lessons 14-15).** Transactional storage answered, two remaining questions: how do we *analyze* billions of rows (**column-oriented storage** and Parquet — compression, vectorization, predicate pushdown), and how does data *move between systems* without breaking during deploys (**binary serialization** — Protobuf, Thrift, Avro, and schema evolution).

### How to study each lesson

1. Read the question description and try to answer out loud before reading the solution — these are explanation questions, and interviews are oral exams.
2. Reproduce the core diagram from memory.
3. Say the trade-off sentence: *"X buys you A at the cost of B, so I'd use it when C."* If you can't fill in all three blanks, reread.
4. Watch the corresponding video afterward as reinforcement — the lessons follow the playlist one-to-one.

### Where this leads

The playlist continues into replication, partitioning, and consensus — the "distributed" half of systems design. Everything there builds on this foundation: replication logs are WALs shipped over the network, partitioned secondary indexes are the index structures here sharded, and distributed transactions are these isolation problems with node failures added.

## ELI5

A systems design interview is a restaurant inspection. Anyone can say "the kitchen makes food." The inspector wants to know if *you* know how the kitchen actually runs: where ingredients are shelved so cooks find them fast (indexes), what happens when two cooks grab the same pan (transactions and isolation), how the pantry differs from the walk-in freezer full of bulk stock (row vs column storage), and how orders are written so the morning shift understands the night shift's tickets (serialization).

This course is a tour of the kitchen, one station at a time. Fifteen stops, each one a single idea with a single trade-off. By the end, when someone asks "why did you choose that database?", you won't recite a brand name — you'll explain the machine inside it.

## Template

```text
── THE DEEP-DIVE CHEAT SHEET ──────────────────────────────

PICKING STORAGE (say choice → mechanism → cost):
  point lookups, keys fit in RAM ......... hash index (Redis/Bitcask)
  ranges + transactions + balance ........ B-tree (Postgres/MySQL)
  write-heavy firehose ................... LSM (Cassandra/RocksDB)
  analytics over billions of rows ........ columnar (Parquet/warehouse)

INDEX RULES:
  index WHERE / JOIN / ORDER BY columns; every index taxes writes
  composite (a,b) serves a AND a+b — never b alone

CONCURRENCY BUGS → MINIMUM FIX:
  lost update  (r-m-w race) .... atomic op / SELECT FOR UPDATE / CAS
  read skew    (multi-read) .... snapshot isolation (MVCC)
  write skew   (check-then-write) FOR UPDATE on premise rows,
                                  or SERIALIZABLE + retry
  phantom      (rows don't exist) unique constraint /
                                  materialize the conflict / SSI

SERIALIZABILITY, THREE WAYS:
  serial execution ... in-RAM data + stored procedures (Redis/VoltDB)
  2PL ................ S/X locks held to commit; deadlock → retry
  SSI ................ MVCC + rw-conflict detection; abort → retry
                       (Postgres SERIALIZABLE — handle error 40001)

DATA IN MOTION:
  public API → JSON | internal RPC → Protobuf | events → Avro+registry
  evolution: new fields optional w/ defaults; NEVER renumber tags

MAGIC WORDS: write amplification, bloom filter, compaction,
  MVCC, predicate pushdown, schema evolution, tail latency
───────────────────────────────────────────────────────────
```
