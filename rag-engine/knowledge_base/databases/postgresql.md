Technology: PostgreSQL
Category: databases

When to use:
* for applications requiring ACID transactions

When not to use:
* When dealing with unstructured data or when the database schema is not well-defined

Tradeoffs:

Advantages:
* built-in replication and high availability features
* Highly reliable and robust
* Supports complex queries, transactions, and concurrency control
* strong consistency guarantees

Limitations:
* can be slower than NoSQL databases for write-heavy workloads
* Limited scalability in write operations due to MVCC (Multi-Version Concurrency Control)
* Performance can degrade with very large datasets
* Requires additional setup for replication or clustering if high availability is needed
