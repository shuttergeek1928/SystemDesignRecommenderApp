Technology: SQS
Category: messaging

When to use:
* Amazon MQ is recommended when migrating applications from existing message brokers that rely on compatibility with APIs such as JMS or protocols like AMQP, MQTT, OpenWire, and STOMP.
* Customization
* Security
* decouple distributed components
* When you have a distributed system with producers and consumers
* Amazon SQS provides redundancy across servers for reliable message delivery.
* Security - When you need control over who sends and receives messages
* order and loss prevention critical workflows
* For decoupling services in your application architecture
* real-time user engagement or alarm systems
* integrate distributed software systems
* To enable asynchronous processing

When not to use:
None specified.

Tradeoffs:

Advantages:
* Integrating Amazon SNS with Amazon SQS enables fanout messaging pattern effectively pushing messages to multiple subscribers at once.
* Amazon SQS decouples distributed software components as a queue service, ideal for specific roles within distributed systems.
* Flexibility with support for multiple AWS Regions and endpoints within a Region
* Scalability to handle load increases or spikes without provisioning instructions.
* It supports a flexible retention period that can be set according to the application's needs (up to 14 days).
* Scalability to handle millions of messages per day without impacting performance
* Integration capabilities such as Amazon SNS, Lambda functions, Kinesis Data Streams
* Availability to provide highly-concurrent access and high availability.
* secure and durable hosted queue
* generic web services API accessible with any programming language supported by AWS SDK
* Scalability - Amazon SQS can process each buffered request independently, scaling transparently to handle any load increases or spikes without provisioning instructions.
* Enhances reliability by redundantly storing messages across multiple servers
* Availability - Highly-concurrent access to messages and high availability for producing and consuming messages is provided by redundant infrastructure.
* Durability for safety of your messages.
* Distributed messaging systems provide decoupling of components
* Amazon MQ offers unlimited scalability and simple APIs. It generally provides more cost-effective solutions for high-volume applications with its pay-as-you-go pricing model.
* common constructs like dead-letter queues
* Message processing is decoupled, allowing producers and consumers to operate independently.
* cost allocation tags
* Durability - For the safety of your messages, Amazon SQS stores them on multiple servers.
* Reliability with lock mechanisms allowing simultaneous producers/consumers.

Limitations:
* Potential for increased costs due to large numbers of messages or data transfer charges
* Limited to 12 MB per message size, which may not be suitable for large data transfers.
* Amazon MQ is recommended only when migrating from existing message brokers that rely on standard protocols like AMQP and MQTT, Apache ActiveMQ, RabbitMQ.
* Maximum throughput per second and queue size
* Limited message retention time of up to 14 days (extendable)
* Reliability - While multiple producers and consumers are allowed simultaneously due to lock mechanisms during processing, this might not be suitable for all use cases where real-time data consistency is critical.
* Messages are not returned until they have been processed or deleted by a consumer, which may lead to processing delays if consumers take longer time. Also, once messages expire and get automatically deleted after their retention period ends without being read.
* Customization - The ability to store contents larger than 1 MiB using Amazon S3 or DynamoDB with pointers in the queue adds complexity and potential latency.
* The document does not provide specific limitations for Amazon SQS or Amazon SNS.
