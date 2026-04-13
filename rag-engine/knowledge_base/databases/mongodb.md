Technology: MongoDB
Category: databases

When to use:
* native data types in many programming languages
* data redundancy
* Shard Key Refinement
* flexible object-oriented data model
* flexible document database
* When you need to ensure atomicity and durability for complex operations that span multiple documents.
* For applications that require a flexible schema and can benefit from the rapid prototyping MongoDB offers.
* Zone Sharding
* When handling non-uniform data or evolving your application's data model without downtime is crucial.
* complex operations requiring data consistency
* automatic failover
* When coordinating distributed transactions across sharded MongoDB clusters is required.
* Automatic Data Distribution

When not to use:
* When you need to ensure atomicity and durability for complex operations that span multiple documents.

Tradeoffs:

Advantages:
* MongoDB natively supports horizontal scaling through a technique called sharding.
* mapping your data to application's needs with flexible schema.
* supporting multi-document ACID transactions for complex, consistent operations.
* Stores data in flexible, JSON-like documents that mirror the structure of modern applications.
* Maintains data consistency when performing multi-document operations
* Supports horizontal scaling and built-in high availability for various workloads including OLTP.
* Embedded documents and arrays reduce need for expensive joins that can slow down performance.
* Dynamic schemas support polymorphism, which allows varied structures among documents in the same collection.
* writes remain available during primary server failure
* Provides ACID guarantees for complex, cross-document and clustered transactions

Limitations:
* Transactions in MongoDB are limited to a single document per operation.
