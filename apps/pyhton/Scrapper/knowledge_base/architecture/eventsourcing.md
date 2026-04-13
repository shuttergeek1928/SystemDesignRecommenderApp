Technology: EventSourcing
Category: architecture

When to use:
* Event sourcing provides a way to capture all changes made to an entity over time
* EventSourcing minimizes conflicting updates
* performance
* Event sourcing is beneficial when the system's state changes frequently and needs a reliable way of reconstructing past states
* improve scalability
* Event sourcing minimizes conflicting updates
* The system could store information about bookings and cancellations as events held in an event store.
* Maintaining multiple versions for backward compatibility
* For decoupling producers and consumers
* The system should account for eventual consistency when creating materialized views or generating projections of data by replaying events.
* optimize performance
* reduce contention
* This approach can be more scalable due to the immutability of events.
* When handling operations driven by sequences of events
* When used with CQRS
* When there is a need to support multiple versions of events for different clients.
* To maintain backward compatibility with older systems or components.
* When the performance impact of rehydrating entities from an event stream is acceptable or can be mitigated.
* To handle complex business processes requiring event tracking and replay
* Event Sourcing pattern provides advantages for applications that require an audit trail
* prevent concurrent updates causing conflicts
* scalability
* Idempotency is a common implementation decision
* Command and Query Responsibility Segregation (CQRS) pattern
* When you want to record events that occur, to replay them to restore the state of a system, to roll back changes, or keep history and audit log.
* Materialized View pattern
* Handling inconsistencies that arise from Eventual Consistency
* EventSourcing for maintaining an accurate state of reservations by replaying events
* Event sourcing is suitable for scenarios where system states need to be recoverable beyond a simple database restore point
* To maintain historical accuracy of entities
* For systems where it's important to have a complete history for auditing purposes
* flexibility and extensibility
* Allows scalability
* Provides a complete history of bookings and cancellations
* To decouple input/update data process from tasks required for applying these actions.
* avoid direct object update requirement
* When it's vital to minimize or completely avoid the occurrence of conflicting updates to data.
* easy integration with other services
* Eventual consistency is acceptable while a read model is updated
* Event sourcing is beneficial when there's a need for complete data recovery and auditability
* Eventual consistency scenarios
* When simplicity and directness are required
* When used with CQRS (Command Query Responsibility Segregation), and when you accept that read models may become temporarily inconsistent while they are being updated.
* Applications where the domain model must protect itself from requests resulting in inconsistent state
* For decoupling event generating code from subscribing systems
* When using events is a natural feature of application operation requiring little extra development effort.
* When you want to capture intent, purpose, or reason in the data.

When not to use:
* Scalability challenges with synchronous systems leading to bottlenecks under load
* Lack of auditability without a separate logging mechanism
* Performance degradation due to contention for resources and locking issues
* Small or simple domains, systems that have little or no business logic, or nondomain systems that naturally work well with traditional CRUD data management mechanisms.
* Applications that do not require hyper-scale or performance.

Tradeoffs:

Advantages:
* Flexibility in handling complex business rules
* Easily replay events to restore state at any point in time without needing additional persistence methods.
* history of changes that were reversed through compensating events
* Provides an immutable, durable record of all changes that can be queried as needed
* No contention during processing transactions improves performance and scalability.
* The approach can be more scalable due to the immutability of events.
* useful business information from event list
* Reduces the chance of conflicts due to eventual consistency and lack of transactions.
* Enables scalability by distributing event processing across multiple services
* Allows complex business processes and workflows
* enhanced scalability
* Immutability and traceability of changes through events
* Scalability due to immutability of events
* Eventual consistency is acceptable while updating a read model with event sourcing.
* list of events for analyzing application performance and detect user behavior trends
* Ability to replay events for state reconstruction
* Helps to avoid conflicting updates by recording each change as an event that is replayed later if needed.
* ability to regenerate current state as materialized views or projections by replaying events at any time
* Immutability of events prevents conflicts from concurrent updates.
* It provides an immutable history, which can be used for auditing purposes
* Immutability of events
* Ordering consistency in multi-threaded applications and multiple instances
* Allows the system to reconstruct past events, which can be useful in debugging or understanding complex workflows.
* assistance in testing and debugging the system
* Allows the system to evolve without breaking existing functionality that depends on old event formats.
* Efficient querying through Materialized Views at regular intervals or when data changes.
* Facilitates easier debugging and testing by maintaining backward compatibility with older systems.
* Maintains a complete history of entity states for auditing purposes.
* Event sourcing allows for storing changes incrementally, which could improve system performance and reliability. It also provides a complete history of all actions that have occurred within an application.
* Events are immutable and can be stored using append-only operation, improving performance and scalability for applications.
* Event sourcing allows the system to evolve over time without losing historical data
* better auditability in complex systems
* Ability to replay historical data for materializing the current state of an entity on demand
* Allows replaying of events to recover the state
* audit trail for monitoring actions taken against a data store
* improved performance
* Reduced load on the database system
* Complete audit trail for accurate record keeping
* Facilitates complex event processing
* Ability to recover the system's state after a failure
* Ability to replay or undo operations by compensating actions
* Flexibility to change the format of materialized models and entity data if requirements change, or adapt a read model when using CQRS.
* Allows for capturing intent and purpose in data changes, such as specific events like 'Moved home', 'Closed account', or 'Deceased' which can be recorded.
* Simple objects that describe some action occurred with associated data required to represent the event described by the Event Sourcing pattern simplifies implementation and management.
* Event sourcing allows the permanent storage of all changes to an entity as a sequence of events, which can be beneficial for audit trails and complex business processes that require undo/redo capabilities.

Limitations:
* Updating historical events breaks the immutability principle and may require significant data migration efforts.
* Cost of recreating state can be high if streams are large and snapshots may not capture all changes
* No standard approach for querying events without using an event identifier as the criteria
* Complexity in maintaining multiple versions and handling schema migrations
* Event sourcing may not be suitable for applications that require real-time updates or immediate consistency across multiple instances. It also introduces latency in updating the system state.
* Lack of auditability without a separate logging mechanism
* Delay in achieving eventual consistency affecting real-time data accuracy
* Possibility of infinite loops due to circular logic
* Flexibility in changing materialized models and entity data formats can be challenging with this pattern or CQRS.
* Existing data in an event sourcing store isn't updated. Instead, new entries are added that transition the state of entities to the new values.
* To reverse a change, compensating transactions must be used because it is not possible to directly undo previous operations without them.
* Requires additional logic in handlers for version management, increasing complexity.
* Potential scalability issues with a large number of concurrent bookings or cancellations, especially in short periods before closing dates.
* Scalability challenges with synchronous systems leading to bottlenecks under load
* Requires handling inconsistencies that result from eventual consistency
* Potential infinite loops due to circular logic
* May introduce latency as historical data is materialized before performing actions.
* data will be only eventually consistent
* Need for efficient event processing and storage
* Can introduce complexity in the system design and may require additional infrastructure for event storage
* Requires additional infrastructure and complexity due to event storage and processing needs.
* Need for idempotency in consumers can be challenging
* Performance degradation due to contention for resources and locking issues as the system scales
* domain model must be designed to protect against requests resulting in an inconsistent state
* The complexity of implementing event sourcing and handling late events
* Event sourcing can be challenging for simple applications due to its complexity
* Systems where consistency and real-time updates to the views of the data are required.
* The system will only provide eventual consistency when creating materialized views or generating projections.
* Maintaining multiple versions of events can lead to code duplication or complex refactorings when schema changes occur.
* Relatively expensive operation to read and replay events
* Requires updating historical events when a new schema is implemented, breaking immutability.
* Events are simple objects that describe actions, not complex data
* Domain model must be designed to protect itself against inconsistent states
* high cost to migrate between event sourcing and other models
* May require additional development effort for integrating events into the application, especially when decoupling input/update processes from actions applied.
* Systems where there's only a low occurrence of conflicting updates to the underlying data. For example, systems that predominantly add data rather than updating it.
* Maintaining event stores requires additional infrastructure for storing and querying data, which could increase complexity and cost.
* Requires a reliable, durable storage system to prevent data loss
* Updating an entity requires adding a compensating event, which can be cumbersome. Additionally, schema changes to events during migrations pose challenges for combining old and new versions of the data.
