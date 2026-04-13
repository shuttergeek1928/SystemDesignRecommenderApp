Technology: CQRS
Category: architecture

When to use:
* Implementing Event Sourcing and CQRS can improve system scalability by separating read and write workloads.
* Simpler queries
* Reduced conflict
* improves clarity, performance, scalability
* CQRS is especially beneficial when the number of reads is greater than the number of writes.
* The read model scales horizontally to handle large query volumes, while the write model runs on fewer instances to minimize merge conflicts and maintain consistency.
* Optimized data schemas
* improve performance
* For applications with task-based user interfaces guiding users through complex processes.
* Optimize query performance
* To improve scalability
* When combining CQRS with Event Sourcing for better scalability
* When working in collaborative environments with multiple users accessing/modifying same data simultaneously to reduce merge conflicts.
* To separate read and write operations, which can optimize performance by allowing each to be scaled independently.
* optimize independent read and write operation models
* Increased complexity
* To use different storage technologies for optimized data access
* To reduce contention
* simplify tasks in complex domains
* scenarios requiring clear separation between commands and reads
* separation of development concerns
* For applications that guide users through complex processes as a series of steps or with complex domain models, benefiting from CQRS approach.
* To handle edge cases such as multiple users attempting to book the last available room
* To separate read and write operations for better scalability
* When you need to scale each model independently
* When dealing with complex systems that require different consistency levels for read and update operations
* system integration
* Security
* Eventual consistency
* improve performance and scalability
* evolving systems support
* When working in collaborative environments to reduce merge conflicts.
* Reduce update conflicts on aggregates
* Separation of concerns
* business processes that can be encapsulated in high-level business tasks
* Asynchronous processing for non-blocking operations
* To ensure the system's state can be reconstructed accurately
* When dealing with complex business transactions where different concerns need to be modeled separately.
* Systems where performance of data reads must be fine-tuned separately from performance of data writes benefit from CQRS.
* When applications have different performance and scaling requirements for reads and writes
* In systems where the performance tuning for read operations must be fine-tuned separately from write operations and when reads are greater than writes in volume. The pattern allows scaling horizontally to handle large query volumes while keeping a smaller number of instances running on fewer machines, thus minimizing merge conflicts.
* Independent scaling
* Event Sourcing combined with CQRS allows for complex business logic to be implemented in the event processing layer.

When not to use:
* simple CRUD-style user interface and data access operations
* simple domain or business rules

Tradeoffs:

Advantages:
* enhances user experience through immediate feedback and clear communication in case of unavailability
* Simplified domain modeling
* better captures the intent of user actions, aligning with business logic
* Improved performance by scaling out the system
* increased scalability due to separate optimization of data stores for reads and writes
* Separation of concerns between commands and queries simplifies system design.
* enabling compensating actions through the use of event sourcing pattern
* Simpler to maintain due to separation of concerns
* enhanced performance by segregating operations
* Can improve performance by optimizing each side separately
* Separates read and write operations for better scalability.
* Granularity reduces conflicting requests
* maintaining full audit trails and history for consistency of transactional data
* Reduces the likelihood of merge conflicts by treating data changes as separate commands and queries, allowing for more granularity in command processing.
* Optimized data retrieval by tailoring structures to query and display requirements
* Easily rebuild or create new views by preserving the history and intent of all data changes.
* Separation of development concerns allows teams to work independently.
* Optimized performance by managing partitions separately
* CQRS accommodates evolving systems, supporting new model versions or frequent changes without affecting existing functionality.
* Enables the use of different data models or query languages between reads and writes.
* Ability to deploy multiple replicas of the read model, reducing latency and increasing availability.
* Simpler queries due to materialized views in the read database avoiding complex joins
* Optimized data schemas for query efficiency in reads, updates focus on writes
* Commands represent specific business tasks, aligning with user intent.
* Ensure appropriate domain entities or operations have permission only perform write actions
* enhances query performance and responsiveness
* Allows for scaling read and write operations independently, which can improve performance efficiency as per Azure Well-Architected Framework's Performance Efficiency pillar.
* Separation of development concerns allowing teams to work independently. One team implements the complex business logic in write model and another develops read model and user interface components.
* Simplified auditing as writes are separated from reads
* Enable read models and write models to scale independently
* Real-time snapshot of the current state for optimized queries
* Asynchronous processing to build or update materialized views
* Minimize lock contention and improve system performance under load
* Separation of concerns between read and write operations
* Helps ensure that associated objects are always in a consistent state when treated as an aggregate.
* Cleaner, more maintainable models with separated concerns of read and complex business logic handling by the write side
* Improved performance through materialized views or snapshots
* System integration remains available even if a subsystem temporarily fails due to CQRS isolating failures.
* reduces unnecessary server requests by validating conditions client-side before sending commands
* CQRS helps reduce merge conflicts by treating a set of associated objects as an aggregate for data changes, ensuring these objects are always consistent.
* Allows scaling the read and write workloads independently
* optimizes for transactional integrity and business processes
* Independent evolution and fine-tuning of read models and write models
* Enhanced query performance and responsiveness by avoiding domain logic in read models.

Limitations:
* requires careful design to avoid race conditions, such as implementing a waiting list or suggesting alternatives for last available rooms
* Requires careful management to avoid race conditions in command handling
* Challenges in consistency due to separate data stores
* Requires more complex system design to handle eventual consistency issues.
* Requires additional infrastructure for command queues or event sourcing mechanisms which might increase operational costs.
* The complexity involved with maintaining two separate models (write and read) can be seen as one limitation. It requires careful management to ensure consistency between the write model and its corresponding read view.
* Asynchronous processing can introduce complexity in error handling
* Security challenges from overlapping entities subjected to read and write operations
* Lock contention during parallel operations on the same dataset
* Increased complexity due to separate models for reads and writes, potential data consistency issues with eventual consistency model
* Increased complexity in application design, especially when combined with Event Sourcing pattern
* CQRS might lead to a duplication of effort between maintaining two separate systems (read model and write model), potentially increasing maintenance overhead.
* CQRS might not provide significant benefits in systems where reads are less frequent or when there is a smaller volume of data.
* Negative impact on performance due to load, complexity of queries, and traditional approach's inefficiency for complex applications
* Combining CQRS pattern with Event Sourcing increases complexity requiring a different design approach, code for generating/processing events, and updating views. Performance of view generation can consume significant time and resources.
* Complexity in handling eventual consistency
* Updates to read data store might lag behind event generation resulting in eventual consistency.
* May introduce complexity in system design due to separate read and write paths, potentially affecting maintainability negatively if not carefully managed. This could conflict with Azure's Security pillar goals by increasing the attack surface.
* complexity in implementation
* Data mismatch between read and write representations of data
* The read and write models may require additional synchronization mechanisms when dealing with concurrent accesses, which can introduce complexity in the system design.
* Complexity added when ensuring synchronization between write and read models
