Technology: Microservices
Category: architecture

When to use:
* Support multiple technology stacks
* Improve agility and competitiveness through better software architecture
* A fast feedback loop enabled by a quick deployment pipeline benefits the system's agility
* Most large scale web sites including Netflix, Amazon
* When you want to isolate services for scalability
* CQRS, which implements a distributed query as a series of local queries
* Team autonomy
* minimize inefficient transactions
* frequent changes
* Amazon originally had a two-tier architecture
* To design a microservice architecture
* Each subdomain is part of a single service except for shared library subdomains that are used by multiple services
* Avoid the trap of creating a modern legacy system
* Saga, which implements a distributed command as a series of local transactions
* Microservices architecture allows us to develop scalable applications that can easily be updated without affecting the entire system
* Structures application as a set of two or more independently deployable components
* Segregate subdomains by their characteristics
* Simple components are easier to understand and maintain
* For application development
* Microservices are suitable for complex applications that require scalability, flexibility in development teams, or need to be deployed across different environments.
* Simple services
* To ensure that a failure in one service does not bring down the entire system
* Fast deployment pipeline
* avoid complex interactions
* API composition, which implements a distributed query as a series of local queries
* Command-side replica, which replicas read-only data to the service that implements a command
* Team autonomy is essential for independent development, testing, and deployment
* rapid delivery

When not to use:
* Some distributed operations might be complex and difficult to understand and troubleshoot
* Microservices can lead to increased complexity in managing distributed systems.
* Some distributed operations might need to be implemented using non-ACID transaction management, which can potentially reduce efficiency
* Microservices may not be suitable for simple, monolithic applications where a single service is sufficient.
* Complex components are harder to understand and maintain than simple ones.

Tradeoffs:

Advantages:
* Each API call fans out to an average of six calls to backend services.
* Facilitates continuous delivery and integration practices
* Ability to develop and deploy services independently
* Scalability: Microservices allow for scaling individual components independently.
* Resilience: Failures of one service do not bring down the entire system.
* Independently deployable each service allows parallel development and deployment.
* Flexibility in technology stack
* Flexibility: Different services can be developed using different programming languages or frameworks that best suit their specific requirements.
* Enables your organization to use microservices effectively
* Scalability: Microservices allow individual components to scale independently.
* Easier to understand and maintain due to simple service structure with potentially just one small number of subdomains.
* Independent deployment of services
* small, loosely coupled teams
* The application tier consists of multiple independent applications.
* Improved fault isolation between services
* Resilience through isolation, where a failure in one service does not necessarily bring down the entire application.
* Database per Service pattern describes how each service has its own database in order to ensure loose coupling.
* The Messaging and Remote Procedure Invocation patterns are two different ways that services can communicate.
* good microservice architecture through Assemblage process using dark energy and matter forces to group subdomains.
* Technology and language diversity among teams
* Easier scaling and deployment of individual components
* Simple interactions within or between services make operations easier to troubleshoot
* Allows scaling individual components without affecting the entire system
* DevOps practices including continuous deployment
* Efficient localized operations reduce network round trips, leading to better performance
* Services can be scaled independently based on demand.
* Enables independent deployment of services
* Flexibility in technology stacks as different services can use different technologies suited to their specific needs.
* Independent development, testing, and deployment capabilities for each team.

Limitations:
* Complexity of managing multiple services and ensuring they work together seamlessly.
* complex, inefficient interactions
* tight runtime coupling
* Potential for increased latency due to network calls between services
* Complex service discovery, network latency
* Data consistency challenges across services
* Risk of tight design-time coupling between services requires time consuming lockstep changes
* Can introduce network latency due to inter-service communication, requires a robust infrastructure for service discovery and load balancing
* Complexity in managing distributed systems and inter-service communication
* Implementing ACID transactions is simpler than BASE for certain consistency requirements but may not always align with the system's needs or performance goals
* Potential for increased latency due to network calls among microservices
* Increased overhead due to inter-service communication which can become significant as the number of microservices grows.
* Requires careful planning and management
* Challenges in distributed system design, such as data consistency across different databases.
* Complex distributed operations can be too inefficient due to large data transfers and numerous network requests
* Increased complexity in managing inter-service communication
