Technology: Envoy
Category: service_mesh

When to use:
* L3/L4 filter architecture
* Easier determination of the source when network and application problems occur
* Achieving the goal of making the network transparent to applications
* There are substantial benefits in using the same software at the edge, including TLS termination and HTTP/2 support.
* Envoy is well suited as an edge proxy for most modern web application use cases.
* HTTP L7 filtering and routing
* as a front/edge proxy
* in building a service to mesh

When not to use:
None specified.

Tradeoffs:

Advantages:
* Routes and redirects requests based on path, authority, content type, runtime values etc.
* High performance
* It supports distributed tracing via third-party providers.
* Can be deployed and upgraded quickly across an entire infrastructure transparently
* Optionally consumes dynamic configuration APIs for centralized management of hosts within a backend cluster, the clusters themselves, HTTP routing, listening sockets, cryptographic material.
* Works with any application language, forming a mesh between Java, C++, Go, PHP, Python etc.
* Supports both HTTP/1.1 and HTTP/2 protocols transparently.
* Statistics can be viewed via the administration port or plugged into a different sink like statsd (and compatible providers).
* Enables a mesh of persistent connections for multiplexing requests and responses in HTTP mode.
* Supports gRPC with HTTP/2 features for routing and load balancing
* Envoy includes robust statistics support for all subsystems.

Limitations:
* Health checking is recommended as an eventually consistent process.
* Advanced load balancing techniques are complex and may require additional configuration or understanding to implement effectively.
