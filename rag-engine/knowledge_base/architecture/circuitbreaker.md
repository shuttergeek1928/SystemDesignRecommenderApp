Technology: CircuitBreaker
Category: architecture

When to use:
* When there's intermittent connectivity issues with remote services
* System recovery is based on external operations
* To prevent excessive overhead and blocking concurrent requests
* To manage intermittent connectivity problems in distributed environments to reduce request failures.
* Substitute for handling exceptions
* The Circuit Breaker pattern provides stability while the system recovers from a failure
* When there is an increased load on services
* When using shared resources that might be overloaded
* Prevents system overloads
* Exception handling
* To protect application from further overload
* For intelligent traffic routing based on real-time failure signals, enhancing multiregion resilience.
* Maintains user experience
* To prevent an application from repeatedly trying to run an operation that's likely to fail
* To handle and prevent cascading failures
* Use accelerated circuit breaking when failure response contains enough information
* To prevent cascading failures in web applications when dependencies become unresponsive
* When an application needs to quickly recognize and handle failures
* To prevent a function from failing when it's likely that the failure is due to external services
* To prevent overloading recovering services with requests
* Circuit breaker adds overhead to your system
* To limit traffic during high-demand periods
* Handle exceptions based on application needs
* To enable the application to continue running without waiting for the fault to be fixed or wasting CPU cycles on determining that the fault is persistent
* Record details of each request in a journal for replay when service becomes available
* Provide manual override for extremely variable recovery time
* The Circuit Breaker pattern helps prevent a single failing service call from bringing down an entire application.
* To prevent cascading failures in distributed systems
* As an alternative to retries which can lead to increased load and potential system overload
* When circuit breaker receives a first 429 response
* When workload team approves increased provisioned throughput but expects system recovery
* To manage transient faults in distributed environments
* To prevent system failure by stopping cascading failures
* Monitoring
* To protect against slow dependencies and maintain service-level objectives without performance degradation from high-latency services.
* To prevent quota overrun by using Azure Cosmos DB lifetime free tier
* When demand spikes occur
* To prevent cascading failures by stopping excessive remote service calls if these operations are likely to fail.
* improves stability and resiliency
* When the operation experiences occasional but frequent failures
* Record details of each request for replay when remote resource becomes available
* To test if an issue has been resolved without fully opening
* To prevent a function from failing when it's experiencing issues
* handles varying amounts of time to recover from faulty services

When not to use:
* When managing access to local private resources, as a circuit breaker adds unnecessary overhead and complexity.
* When the system is already resilient to failures
* Failure recovery is managed at the infrastructure level
* As a substitute for handling exceptions within the business logic of applications; well-known retry algorithms are sufficient in this case.
* Built-in failure isolation and retry mechanisms often enough
* Well-known retry algorithms are sufficient
* When there is a high rate of failed requests that could potentially overload the system.

Tradeoffs:

Advantages:
* Improves cost and operational efficiency by delaying immediate alert on recoverable issues.
* Allows the system to recover from temporary issues without human intervention
* Improves the resilience of an application by isolating faulty services
* Prevents a single failing service from causing total system shutdown or crash
* Reduces unnecessary traffic to downstream services when they are experiencing issues
* Allows limited volume of requests during recovery
* temporarily blocks access after detecting failures, preventing repeated unsuccessful attempts
* Prevents an application from performing operations likely to fail, thus avoiding unnecessary retries or wasted CPU cycles
* Provides clear observability into both failed and successful requests for operations teams to assess system health.
* Allows for graceful degradation of functionality
* Prevents cascading failures by stopping traffic to an unstable service.
* Reduces load on slowed-down dependencies or services
* Improves system resilience by isolating faulty components.
* Improves the resilience of your application by isolating failures
* Improves the resilience of a service by detecting failures early, thus preventing cascading failures
* It allows the system to continue functioning despite failures in one or more components.
* Controls capacity surges so workload teams can manage cost increases deliberately and maintain service quality.
* Allows for latency optimization and regulatory compliance.
* Minimizes impact on performance by quickly rejecting requests for an operation that's likely to fail.
* Prevents service from being flooded by a sudden influx of work
* Allows for a more accurate threshold calculation that waits for higher error rates before notifying.
* Provides a way to prevent cascading failures in distributed systems
* Immediate short-circuiting of subsequent requests to prevent additional load on the system
* Maintains response time of the system.
* Improves the resilience of distributed systems by isolating faults.
* Allows monitoring of recent failure counts and decision-making based on this information
* Accelerated circuit breaking with immediate tripping based on error response information
* Enhances resilience that aligns with business justification.
* Allows parts of an application to be temporarily bypassed when they are unresponsive
* Allows for quicker recovery as it can be re-enabled once issues are resolved, reducing downtime and costs associated with manual intervention or extensive troubleshooting.
* Reduces load on downstream systems by preventing cascading failures
* Improves cost and operational efficiency by delaying immediate alerts when the load isn't too high.
* Reduces unnecessary traffic to downstream resources when a service fails.
* Ensures controlled failover in multiregion deployments using global load balancers or custom region-aware strategies.
* Provides immediate feedback to the client about potential delays or failures
* Reduces load on a failing service, allowing it to recover
* Reduces load on the downstream systems when a service is unavailable.
* Allows limited traffic to pass through, which can help in identifying and resolving issues quickly.
* Returns default or cached responses while informing users about temporary degradation
* By isolating faulty services, it prevents cascading failures across interconnected systems.

Limitations:
* It relies on the system's ability to recover without intervention from operations team.
* Circuit breakers might not be suitable when waiting times to reset can introduce unacceptable delays.
* Using a single circuit breaker for multiple independent providers may lead to incorrect access decisions, blocking successful operations or allowing failed ones.
* In message-driven or event-driven architectures, where built-in failure isolation and retry mechanisms are often sufficient.
* Complexity in designing multiregion deployments
* Possible tie up of numerous threads before all fail
* Requires careful configuration of the time-out period and trial request limit to balance between isolating faulty components and maintaining functionality.
* Requires careful configuration to avoid false positives and unnecessary closures
* May introduce latency when a circuit is open for recovery
* Potential issues when a single resource experiences temporary problems while others are accessible
* Potential risk of prolonged outages if 429 errors cease and threshold calculation does not detect it.
* Requires additional configuration and monitoring for effective implementation
* Circuit breaker adds unnecessary complexity to your system
* Requires careful configuration and monitoring to avoid misuse or over-reliance on it
* Depends heavily on the accuracy of historical data used in threshold calculations, which might lead to delayed responses if patterns change unexpectedly.
* May introduce latency due to fallback mechanisms
* Potential performance impact due to the added latency of monitoring mechanisms.
* Can block concurrent requests, potentially exhausting critical resources
* The pattern may not be suitable for all types of applications and can introduce additional latency during the Open state due to time-outs or retries.
* May not always accurately reflect the health of a system if used in isolation without monitoring failures.
* May not be suitable for all types of failures or applications
* Requires external operations for recovery
* Requires a threshold for the number of recent failures within a given time period before transitioning states
* Concurrency can block concurrent requests if not handled properly by the implementation of circuit breaker.
* May not be suitable for critical systems where an outage cannot afford to wait.
* It requires careful configuration of thresholds, such as failure count before opening/closing a circuit.
* Requires careful configuration to avoid false positives or negatives
* May not be suitable for systems with high availability requirements as it temporarily disrupts service.
* May introduce latency as the circuit opens and closes
* Requires additional infrastructure or configuration, such as health endpoints.
* Success counter resets after entering Half-Open state if any invocation fails next time it enters this state
* Can raise exceptions even if the reason for failure is resolved when it remains in Open state too long.
* The circuit breaker time-out elapses naturally, which might lead to delayed responses in some scenarios.
* Requires manual resetting after the fault is fixed
* Potential blocking thread if time-out is too long
* If switching from Open to Half-Open happens too quickly, can reduce response times of applications due to fluctuation.
* Immediate tripping without retrying might cause unnecessary failures.
* May introduce latency as it temporarily diverts requests away from the failing component
* Can lead to service unavailability for legitimate requests during transient issues that do not require circuit breaking, potentially impacting user experience.
* May introduce latency if the circuit breaker is tripped frequently
* Adaptive techniques require additional complexity and resources for AI/ML implementation
* May not be suitable for services with very fast recovery times as it can lead to unnecessary circuit openings and closures.
* Traditionally, circuit breakers relied on preconfigured thresholds which resulted in suboptimal behavior.
