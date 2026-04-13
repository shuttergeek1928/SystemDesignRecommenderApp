Technology: Kafka
Category: messaging

When to use:
* When building distributed applications that require high throughput of data streams
* To store streams of events durably and reliably for as long as you want.
* When you need high scalability and decoupled producers/consumers
* To connect, store, and make available data produced by different divisions of a company
* get hands-on experience with Kafka
* scalability
* produce a stream of events
* To monitor patients in hospital care and predict changes in condition to ensure timely treatment in emergencies
* To collect and immediately react to customer interactions and orders
* For integrating with existing systems like relational databases
* capturing real-time data from various sources
* To track and monitor cars, trucks, fleets, and shipments in real-time
* To continuously capture and analyze sensor data from IoT devices or other equipment
* ensuring a continuous flow and interpretation of data
* understand Kafka in more detail
* manage and inspect topics
* To process payments and financial transactions in real-time
* fault tolerance and high availability
* When processing events exactly-once guarantees are required
* To publish (write) and subscribe to (read) streams of events, including continuous import/export of data from other systems.

When not to use:
None specified.

Tradeoffs:

Advantages:
* Continuous monitoring of patients' conditions leading to timely treatment
* Immediate reaction to customer interactions and orders in retail or mobile applications
* Constant performance regardless of data size, allowing for long retention periods.
* higher-level functions to process event streams including transformations, stateful operations like aggregations and joins, windowing, processing based on event-time
* flexibility in routing the event streams as needed
* Supports a variety of programming languages through included clients as well as community contributions, facilitating development in multiple ecosystems
* High scalability due to fully decoupled producers and consumers.
* Highly scalable, elastic, fault-tolerant, secure manner of operation.
* Real-time processing capabilities for various industries such as finance, logistics, IoT
* Allows client applications to read/write data from/to many brokers simultaneously
* world-wide community value out of Kafka
* real-time processing and reaction to event streams
* All-in-one solution combining three key capabilities: publishing/subscribing to event streams, storing them durably and reliably, and processing events in real time or retrospectively.
* Highly scalable and fault-tolerant cluster design ensuring continuous operations without any data loss

Limitations:
* The decoupled nature of producers/consumers might complicate error handling, as failures in one part do not necessarily propagate or affect the other.
* Events are not deleted after consumption but retained indefinitely until a specific configuration setting is changed or the topic expires based on its retention policy. This could lead to storage issues if events need to be purged regularly and timely.
