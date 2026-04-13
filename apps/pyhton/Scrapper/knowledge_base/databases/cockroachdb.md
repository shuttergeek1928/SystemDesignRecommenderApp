Technology: CockroachDB
Category: databases

When to use:
* fault tolerance
* Ensure strong consistency across distributed systems
* Offer industry-leading consistency even on massively scaled deployments
* For most types of tables and queries
* high-level understanding of CockroachDB
* Create an always-on database that accepts reads and writes without generating conflicts
* scalable and consistent database
* Maintains agreement among nodes during temporary disconnections
* Raft consensus algorithm ensures consistency across distributed systems
* To ensure that a transaction is completely isolated from other transactions
* stable version
* reason for using CockroachDB
* v26.1.1
* Ensures data is safely stored and maintained consistent across majority of nodes
* v25.2.15 LTS
* It enables symmetric read/write behavior without needing to know where in the cluster a specific portion of your data is stored.
* For distributed SQL database server with collaborative transaction organization and workload rebalancing
* efficient data distribution
* Allow flexible deployment in any environment, without tying you to any platform or vendor
* Efficiently handles large datasets by dividing them into manageable chunks
* Ensures consistency in distributed systems
* Maintains consistency and reliability
* support the SQL standard AS OF SYSTEM TIME clause
* To ensure that a transaction must change affected data only in allowed ways
* Perform other cluster actions
* CockroachDB ensures survivability by replicating data ranges across at least three nodes.
* Make life easier for humans
* To handle a subset of the stored data for each node
* Ensures ACID compliance
* Execute SQL statements
* Ensures safe storage across multiple nodes
* To optimize performance and fault tolerance
* To manage concurrent access and maintain data consistency

When not to use:
* Reduced consistency guarantees
* Single-node deployment

Tradeoffs:

Advantages:
* Improved availability and fault tolerance
* Flexible deployment in any environment, not tied to a platform or vendor
* It allows for easy integration with load balancers because it can distribute SQL requests across any node.
* built-in replication and partitioning support
* Data consistency across distributed systems
* Reduces locking overhead
* High availability and fault tolerance through data replication
* Provides strong consistency guarantees
* Data safety with replicas acknowledged by a quorum
* able to keep track of data's timestamp
* Allows for efficient data retrieval within a range
* Allows high availability through consensus-based replication
* Leader leases maintain a single leader for write requests
* High availability
* CockroachDB ensures ACID compliance for transactions
* Enhanced read performance
* efficient storage engine
* Reduces the need to scan entire tables, improving query performance
* Always-on database that accepts reads and writes on all nodes without generating conflicts
* Enabling distributed transactions
* Fault tolerance through replication
* Improves system throughput by allowing more transactions to proceed in parallel without waiting for locks.
* Supports distributed transactions across multiple nodes
* Maintains consistency within the cluster
* Single cluster management for authorization hierarchy, simplifying user role definitions within the same environment.
* Data replication provides fault tolerance
* Raft protocol ensures agreement among replicas before committing writes
* Advantage of using CockroachDB
* Reduces lock contention and improves concurrency
* Provides strong isolation guarantees
* CockroachDB provides consistent reads and writes regardless of which node you communicate with due to its consensus algorithm.
* Improves read performance by allowing reads from multiple copies
* Reduces write latency by distributing writes across multiple nodes
* Removing the pain of eventual consistency issues and stale reads
* strong consistency guarantees

Limitations:
* Can introduce latency due to consensus protocol
* Dependency on the Raft consensus algorithm, which may introduce latency in decision making and data propagation.
* Can impact performance negatively in high throughput scenarios because of the overhead associated with maintaining strict serializability guarantees.
* Requires a network to connect nodes together for replication and failover capabilities.
* May introduce latency in transaction processing
* complexity of SQL queries due to distributed nature
* May lead to higher abort rates for long-running queries due to increased isolation level
* Increased write latency due to synchronization overheads among replicas
* Potential for higher storage costs with multiple copies of data across nodes
* Reads may not always be up-to-date due to eventual consistency model
* Dependency on network connectivity and performance between cluster nodes for transaction consistency.
* Can lead to increased complexity of transaction management and potential issues with deadlocks
* Requires careful planning of node distribution to ensure optimal load balancing. Potential complexity in managing a self-hosted setup versus using CockroachDB Cloud or customer Organization infrastructure.
* Increased complexity in managing consistency across nodes
* Requires careful management of ranges as they split and grow over time
* Limitation of using CockroachDB
