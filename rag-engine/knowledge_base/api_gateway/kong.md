Technology: Kong
Category: api_gateway

When to use:
* prevent DoS attacks
* For applying entity configurations directly
* To ensure that load balancing works correctly
* limit web scraping
* To verify user identity
* Define routing policies
* Improve overall system responsiveness and reduce failures
* To ensure that only authenticated users can access certain services
* other forms of overuse
* key authentication
* To access external services securely and efficiently
* migrating existing systems
* provisioning of data plane locally
* lightweight
* Distribute API request traffic across multiple services
* To manage Kong Gateway declaratively
* When there is potential for abuse
* To define how requests are proxied
* verify every request comes from known client
* Manage traffic between services
* For securing sensitive information
* Kong Gateway Enterprise for rapid setup
* reduces backend load
* To ensure seamless communication between microservices
* conserve free trial credits
* fast
* accelerates performance by caching responses
* automatic provisioning of control plane
* flexible
* To ensure fair usage of resources
* avoid unnecessary charges

When not to use:
* When there is no cache to validate
* cURL may not be the best choice for complex request bodies or headers.

Tradeoffs:

Advantages:
* Simple and widely supported
* less backend load
* low-code approach
* Prevents overloading of individual resources by distributing load evenly among upstream targets.
* plugin-based policy implementation
* Simplifies security management for developers by centralizing authentication logic
* Directs traffic efficiently
* Enables easy integration with various protocols and services
* Allows for easy service configuration and management
* Simplifies service-level management by encapsulating all HTTP logic within a single object.
* Simplifies API development and management
* Ability to route requests through Kong Gateway
* Reduced load on the origin server
* Ensures API availability during high traffic periods
* Enables fine-grained control over request and response handling.
* faster replies
* identifies the client interacting with Kong Gateway
* Faster response times due to caching
* Prevents DDoS attacks by limiting request rates
* Recommended for upgrading to take advantage of the tool
* Access the /anything resource at httpbin.konghq.com

Limitations:
* Requires additional setup for Kong Gateway to be functional
* Requires additional setup if you need more complex routing policies or load balancing strategies outside of Kong's capabilities.
* recommended to let API gateway autogenerate a complex key in production
* Limited to managing traffic between services, not for internal microservices communication.
* May introduce latency due to additional processing
* May require fine-tuning to balance between usability and protection
