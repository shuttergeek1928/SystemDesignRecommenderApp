Technology: RabbitMQ
Category: messaging

When to use:
* Routing scenarios that are impossible or very hard to implement using publishing directly
* Distributed systems for broadcasting various state and configuration updates
* When using multiple connections with RabbitMQ
* Storing messages in queues
* Having more than one consumer per queue
* Reason for using RabbitMQ
* Group chats for distributing messages between participants
* exchange operations for declaring, deleting exchanges
* Direct ExchangeFanout
* using headers beginning with x-
* For stocks price updates and other kinds of financial data categorization or tagging (for example, only for a particular sport or team)
* When a message cannot be routed
* implement routing schemes that exchange types provided out-ofsoft
* Sport news sites for distributing score updates to mobile clients in near real-time
* For orchestration of services of different kinds in the cloud
* as a simple load balancing technique
* to improve throughput if messages tend to be published in batches
* Efficient message routing between different applications
* Eliminates duplicated work application developers have to do
* unicast routing of messages
* To prevent an application from processing messages that it cannot handle at the time
* queue with durable and exclusive properties for single consumer
* When you need a way to reject multiple messages
* understanding protocol operations
* routing based on multiple message attributes
* To use the feature of having an AMQP broker generate unique queue names on behalf of an app
* For background task processing done by multiple workers capable of handling specific sets of tasks
* include additional attributes for the broker
* For distributing data relevant to specific geographic locations, such as points of sale
* allows application developers a lot of freedom
* To make it possible for a single broker to host multiple
* AMQP 0-9-1 connections are typically long-lived
* interoperability
* multicast routing
* store messages that need to persist beyond broker restarts
* When using RabbitMQ to publish messages
* isolated 'environments' (groups of users, exchanges, queues and so on)
* routing messages into queues
* Massively multi-player online (MMO) games for leaderboard updates or other global events
* When a message needs immediate processing and acknowledgment
* AMQP 0-9-1 protocol
* Persistent message for ensuring no loss on server restart
* durability importance
* Whenever a problem involves multiple consumers/applications that selectively choose which type of messages they want to receive
* every queue created seems like it can be directly bound without additional configuration
* Connections use authentication and can be protected using TLS

When not to use:
None specified.

Tradeoffs:

Advantages:
* ability to store persistent messages, ensuring they are not lost in case of a broker restart
* ability to use non-string types as routing keys, like integers or hashes
* Reliable delivery through AMQP protocol over TCP.
* Sharing a single TCP connection among many protocol operations
* can specify how many messages each consumer can receive at once before sending the next acknowledgement, which may help with managing workload distribution and improving overall system efficiency.
* Reduces the amount of duplicate work for applications when sending messages directly to queues is not possible
* reduces the need for broker administrator intervention
* simplifies the process of message delivery to queues by automatically binding them with a routing key that matches their names
* Efficient and logical pairing of requests with responses
* easier communication with developers using different libraries
* Flexibility in having publishers, consumers and broker on separate machines
* Ideal for the broadcast routing of messages as it delivers a copy of a message to every queue bound to it.
* Performance cost can be managed with durability mode of the message itself.
* Topic exchanges are commonly used to implement various publish/subscribe pattern variations
* Allows for more flexible handling of messages, as the application can decide when to acknowledge them based on its own logic.
* Ability to route messages efficiently
* flexible routing using header values instead of string keys
* The generated queue name will be returned to the client with a queue declaration response, providing immediate feedback for further actions.
* messages are routed to specific queues based on the message's routing key, ensuring that they reach their intended destination(s)
* Push API is the recommended option for consuming RabbitMQ messages.
* They allow for multicast routing of messages based on matching between a message routing key and the binding patterns
* Efficient communication between distributed systems.
* Ensures messages are not lost if broker is restarted
* AMQP 0-9-1 Model is flexible and applicable to a broad range of problems.
* Advantage of AMQP protocols like reliability, security and flexibility.
* The model provides flexibility in routing messages through the use of bindings.
* Queue name generation can help in avoiding naming conflicts and ensuring uniqueness
* It allows for asynchronous communication between producers and consumers.
* Advanced Message Queuing Protocol enables communication between client applications and messaging middleware.
* Enables routing scenarios that are impossible or very hard to implement without bindings
* Separate communication on different channels
* gives application developers a lot of freedom
* Clear separation between client-side actions and broker's response mechanisms

Limitations:
* RabbitMQ only supports channel-level prefetching; it does not support connection or size based prefetching. This means that if a consumer is slow to process messages due to internal issues, the queue can become backlogged with unprocessed messages waiting for acknowledgement.
* Handling situations like undelivered messages requires additional logic in the application.
* Queue names must not exceed 255 bytes of UTF-8 characters, which might limit naming flexibility.
* Not suitable for applications using multiple threads/processes as it's common to open a new channel per thread/process.
* Publishing a message as persistent affects performance due to persistence costs
* A channel only exists in the context of its parent connection and is closed when that connection closes.
* Networks are unreliable, which may lead to message loss if acknowledgements aren't used properly.
* requires developer awareness to avoid definition conflicts
* Avoid creating infinite message delivery loops by not repeatedly rejecting and requeueing a message
* direct exchanges do not support fan-out delivery where messages can be delivered to multiple consumers simultaneously
* might be misleading as it seems like direct queue-to-exchange messaging is possible
* Lack of counterpart methods for some AMQP 0-9-1 commands
* Increases complexity in handling failures within the application layer as compared to automatic acknowledgement model where broker handles re-delivery.
* Queues starting with 'amq.' are reserved for internal use by the broker. Attempts to declare such queues may result in channel-level exceptions
* There is no built-in mechanism in basic.reject for acknowledging or confirming the rejection of individual messages.
* The model can become complex when dealing with a large number of queues, exchanges, and bindings.
* does not allow bind/unbind operations
* Requires careful implementation and monitoring by developers. If not handled correctly, it could lead to message loss or duplication.
