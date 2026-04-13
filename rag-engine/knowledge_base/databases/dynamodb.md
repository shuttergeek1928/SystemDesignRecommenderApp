Technology: DynamoDB
Category: databases

When to use:
* single-digit millisecond performance at any scale
* applications requiring complex business logic
* Handles setup, configurations, maintenance, high availability, hardware provisioning, security, backups, monitoring
* Build resilient applications
* archival needs
* For full-text and vector search, and semantic search
* multi-region deployment
* Handling millions of requests per second
* on-demand capacity mode for unpredictable workloads
* Getting started
* For business continuity and disaster recovery objectives
* Financial service applications for live trading, routing, loan management, token generation, transaction ledgers.
* high availability
* supports both key-value and document data models
* NoSQL table creation and querying
* ideal for applications with an event-driven architecture
* For cost optimization by filtering events that Lambda processes from a DynamoDB stream
* provisioned capacity model when you have predictable traffic patterns
* Zero downtime maintenance
* free tier feature
* Fully managed database service
* access table data
* query data using an alternative key
* high-performance workloads
* As a media and entertainment company for metadata indexing of content or running user watchlist services.
* For use cases requiring high availability and the ability to serve hundreds or thousands of customers with peak traffic volumes.
* To achieve high durability with a 99.99% availability SLA
* DynamoDB is purpose-built for improved performance
* To enable easy integration with analytics and machine learning
* For gaming applications to manage game state, player data, session history, leaderboards.
* To eliminate undifferentiated heavy lifting
* Gaming applications for game state, player data, session history, leaderboards.
* Best practices for designing and architecting
* for mission-critical workloads
* When you need granular recovery without using provisioned capacity
* long-term retention
* To enable complex analytics
* Access DynamoDB using various methods
* When you need a serverless, fully managed NoSQL database that can scale to handle virtually any size of workload while providing consistent performance at any scale.
* stream media and entertainment content
* Control access with IAM
* Pay-as-you-go pricing model
* To build end-to-end serverless applications
* Optimize for lowest RTO and RPO
* support successful games
* Performance improvement from milliseconds to microseconds
* To recover data to any specific second within the last 35 days
* Fine-grained attribute level authorization
* For full or incremental exports of changed, updated, or deleted data between specified time periods
* To get more value from your data

When not to use:
None specified.

Tradeoffs:

Advantages:
* scalability in both directions (scale to zero with no cold start)
* Natively integrates with AWS services for building event-driven applications reacting to data modifications in DynamoDB tables
* Minimize throughput costs
* maximum flexibility in accessing data
* Automatic replication of data across three Availability Zones for high durability
* Multi-Region resilience
* Maximize performance
* Seamless integration with other Amazon services and APIs.
* eliminates the operational burden of manually scaling instances
* strong read consistency
* time-ordered sequence of every item-level change
* fast, local read and write performance for financial services applications
* Constantly improves its availability, reliability, performance, security, and functionality without requiring upgrades or downtime
* Single-digit millisecond performance for a wide range of operational workloads, regardless of size.
* Operate workloads at scale
* Up to 10 times performance improvement
* Free tier feature available
* Cost reduction compared to traditional relational databases while improving overall application performance at scale.
* eliminate the need to manage provisioning and scaling of resources in DynamoDB
* omits inefficient features like JOIN operations for better scalability and speed
* Full table export capabilities
* Granularity of per-second restores up to a maximum period of 35 days with no impact on performance or availability
* DynamoDB global tables provide fast local read and write performance across AWS Regions with minimal latency.
* Integration with AWS Fault Injection Service (AWS FIS)
* Transactions in DynamoDB ensure ACID properties for financial transactions or order fulfillment, supporting market conditions scaling.
* simplifies the developer experience of making coordinated, all-or-nothing changes to multiple items within and across tables
* Consistent performance regardless of scale-out architecture needs.
* single-digit millisecond read and write performance
* High availability without manual cache invalidation, data population or cluster management.
* Backups don't impact the performance of your table
* Simplified security posture due to no user names or passwords for accessing DynamoDB.
* Scalability that quickly scales throughput both in and out (scale to zero with no cold start).
* Zero impact on production workloads running on DynamoDB.
* 99.999% availability SLA
* No need to provision, patch, manage or operate servers.
* Enhanced data protection through encryption at rest using AWS KMS keys.
* ACID transactions to build enterprise-grade applications
* Instant scaling up/down of tables with zero administration.
* Ease of operations provided by its serverless architecture.
* near-real time streaming of item-level change data
* Allows cost optimization by filtering events that Lambda processes from a DynamoDB stream
* pay only for what I use with on-demand pricing
* supports ACID properties across multiple tables
* Instantly ready for production workloads

Limitations:
* Limited throughput when table doesn't have traffic and there are no cold starts
* Limited support for complex queries that require joins or aggregation operations across multiple tables.
* doesn't support a JOIN operator
* provisioned capacity model has a maximum read/write throughput limit per second
* DynamoDB's pricing model is based on throughput capacity, which may not be cost-effective for workloads with low read/write activity.
* The need to manage provisioned capacity and the potential impact of unused capacity charges.
