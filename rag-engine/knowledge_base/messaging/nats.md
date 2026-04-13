Technology: NATS
Category: messaging

When to use:
* Allows for hybrid mix of SaaS/Utility computing with separately owned and operated systems
* Addressing and discovery tied to DNS
* addressing
* For cloud messaging services and microservices/service mesh environments
* Supporting patterns beyond 1:1 communications
* NATS can run anywhere, from large servers to IoT devices
* No need for client reconfiguration with backend server changes
* Real-time communication of topology changes
* 1:N systems require additional components like load balancers for production
* discovery
* Production system requires all moving parts just to get around a single-connection technology

When not to use:
None specified.

Tradeoffs:

Advantages:
* Fast delivery of messages with low latency
* Flexibility in choosing between NATS as a shared service or extending it by groups or individuals
* mobility
* Effortless M:N connectivity as it manages addressing and discovery based on subjects, not hostname and ports.
* Zero downtime deployments due to no frontend reboot requirement
* security
* Seamless handling of endpoint location transparency after initial DNS bootstrapping
* Scalability across different network topologies including edge computing scenarios
* location independence
* Deployable nearly anywhere regardless of the environment chosen.
* Promises the most return on investment

Limitations:
* Limited support for complex message routing and transformation
