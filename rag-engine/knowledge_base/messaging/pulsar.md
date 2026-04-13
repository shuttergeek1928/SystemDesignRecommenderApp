Technology: Pulsar
Category: messaging

When to use:
* Very low publish and end-to-end latency ensures fast message delivery within the system.
* Native support for multiple clusters in a Pulsar instance, which allows seamless geo-replication of messages across clusters.
* for high availability
* multi-tenant
* in multi tenant environments
* high-performance

When not to use:
None specified.

Tradeoffs:

Advantages:
* built-in geo replication for disaster recovery and low latency access
* A simple client API with bindings for multiple programming languages and frameworks simplifies integration into various systems.
* Seamless scalability to over a million topics, which allows handling large volumes of data.
* server-to-server messaging capability

Limitations:
* requires additional setup for proxy routing with SNI (Subject Alternative Name)
* limited to Java clients, no native support in other languages
