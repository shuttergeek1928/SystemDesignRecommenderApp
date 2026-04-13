Technology: Cassandra
Category: databases

When to use:
* To prevent data loss from any given datacenter's hardware failure
* Fault tolerance
* When rapid organization and analysis of extremely high-volume, disparate data types are needed.
* Helps system self-heal if something goes wrong like a node failure or AWS reset
* Ensures reliability
* To double the throughput
* When an application is under high stress
* To ensure data consistency when replication factor is high
* When a majority consensus on read/write operations is required
* When data needs to be distributed across multiple nodes for performance and fault tolerance.
* Ensures reliability and fault tolerance
* For applications requiring horizontal scalability and distributed architectures.
* When needing more power or capacity

When not to use:
None specified.

Tradeoffs:

Advantages:
* Tweak throughput of read or write queries in isolation
* Any node can act as a coordinator for flexibility and resilience.
* Replication factor of one provides reliability without unnecessary data duplication.
* Easy horizontal scaling with no downtime
* Load balancing amongst multiple nodes can achieve better performance
* Positive performance advantages, especially for worldwide user base support
* Rapid ad-hoc organization and analysis capabilities for Big Data
* Masterless architecture allows any Cassandra node to provide exact same functionality, contributing to robustness and resilience
* Data isn't lost even when one of the replicas has gone down, as other two are still available to fulfill requests
* Flexibility in deployment across different environments like cloud and on-premises
* Data is automatically distributed based on token ranges, ensuring efficient query processing.
* Easily scales when the application is under high stress
* Linear scalability indefinitely using commodity hardware
* Horizontal scalability to handle increasing loads by adding more nodes
* Distributed architecture prevents data loss from a single node’s hardware failure
* Reduces latency due to distance in a cloud computing environment
* Control over granularity of consistency for optimal performance, availability, and data integrity

Limitations:
* Data locality is dependent on the partition key, which may not always align with query patterns leading to potential hotsp0tions in certain scenarios.
