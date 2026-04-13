Technology: Jaeger
Category: observability

When to use:
* For tracing operations that have dependencies
* Data enrichment with environment information
* To represent a logical unit of work with an operation name
* To attach additional, non-traced user data across service boundaries
* To prevent data loss between collectors and storage
* For monitoring distributed systems
* For simplicity and ease of setup
* Jaeger provides an easy-to-understand and consistent terminology for distributed tracing.
* Direct storage for traced data
* For querying Jaeger data
* Centralized serving of sampling configurations
* Simplified SDK configuration
* To generate tracing data
* Jaeger collector provides an easy way to process and store traces
* An additional component, jaeger-ingester, needs to be deployed
* Jaeger provides distributed tracing capabilities for microservices
* When you want to ingest traces from Kafka into Jaeger

When not to use:
* Avoid using traces for systems where performance is critical and trace data could introduce latency.

Tradeoffs:

Advantages:
* Extensible plugin framework for implementing custom storage plugins
* All-in-one binary simplifies the initial setup
* Easy-to-use API
* Kafka can act as a persistent queue ensuring no data is lost
* jaeger-ingesters automatically partition the load across multiple instances for scalability
* Helps identify bottlenecks, errors, or inefficiencies within a distributed application.
* Built-in support for several storage backends
* Simplified trace export endpoint and sampling config.
* Ability to handle average and peak traffic with in-memory queue smoothing short-term peaks
* Provides insights into the system's behavior by visualizing execution paths.
* Enhances traceability by carrying context information
* Provides detailed insight into the performance and behavior of distributed systems by tracking individual spans.
* Easier to deploy in environments where a full distributed system is not required
* The data model is logically very similar to OpenTelemetry Traces, which can facilitate interoperability with other tools that follow this specification.
* Allows tracing systems to carry arbitrary metadata through distributed services
* Short-circuit calls when trace is not sampled to minimize impact.
* Ability to add data enrichment by adding pod name or other host-specific information.
* It simplifies the understanding of complex distributed systems.
* No need to manage a separate collector process
* Easy to set up and use
* Supports both client-side instrumentation as well as server-side.
* Web UI available for analysis and searching
* Minimized overhead in production with various sampling strategies.
* Simplified configuration for systems already using Kafka

Limitations:
* Potential for dropped data during sustained traffic spikes if storage cannot keep up
* Profiling span data only captured and transmitted if a trace is sampled. No profiling data collected otherwise, which might lead to incomplete tracing information in non-sampled traces.
* May not be suitable for very fine-grained monitoring due to potential overhead in creating too many small spans
* Not all data can be represented as key-value pairs, which may limit the types of user data that can effectively utilize baggage.
* Requires instrumentation of applications with the Jaeger SDKs or other compatible tools.
* Jaeger traces can introduce overhead and potentially impact performance if not used judiciously.
* Complexity of visualizing large-scale, deeply nested systems with many concurrent transactions or distributed components.
* Extra layer of marshaling/unmarshaling the data
* Limited input protocols (only supports Kafka)
* Potential complexity in sharding capabilities
* May require additional infrastructure to store and process trace data efficiently.
* Limited support for complex distributed systems with multiple data centers
* May not be suitable if you require other trace ingestion methods
