Technology: OpenTelemetry
Category: observability

When to use:
* To understand the end-to-end journey of requests in distributed systems
* To troubleshoot and handle novel problems, that is, “unknown unknowns”
* as part of a span
* To track specific operations that make up the request lifecycle
* For communication of reliability expectations within the organization
* improves visibility
* for tracking code execution
* To debug performance problems by breaking down request flow
* To measure and understand service behavior from a user's perspective
* To ask questions about your system without knowing its inner workings
* helps debug nondeterministic problems

When not to use:
None specified.

Tradeoffs:

Advantages:
* Allows you to easily understand a system from the outside
* Makes debugging and understanding distributed systems less daunting
* provides insights into system behavior
* Provides insights into system performance over time
* Helps in setting realistic reliability goals for services
* Enables fine-grained telemetry and monitoring of individual components
* Provides a detailed context of what occurs during a request
* Provides detailed information about each operation within a request
* provides contextual information when correlated with traces and spans

Limitations:
* Requires careful management to avoid performance overhead from excessive span creation or recording too much data in spans.
* Requires continuous monitoring and data collection to be effective
* lacks contextual information on its own
