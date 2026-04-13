Technology: Kubernetes
Category: deployment

When to use:
* for container orchestration
* Increased ease and efficiency of container image creation compared to VM image use.
* Kubernetes provides a framework for running distributed systems resiliently.
* Google open sourced the project in 2014
* Resource allocation issues in traditional deployment era
* It takes care of scaling and failover for your application, providing deployment patterns.
* Kubernetes restarts containers that fail
* combines over 15 years of Google's experience running production workloads at scale
* manages batch and CI workloads
* replaces containers based on user-defined health check
* as an open platform
* Reliable, frequent container image build and deployment with quick rollbacks due to immutability.
* Kubernetes provides some generally applicable features common to PaaS offerings such as deployment, scaling, load balancing
* Kubernetes provides an abstraction layer for managing container infrastructure
* Underutilization of resources and high maintenance cost in virtualized deployment era

When not to use:
* Kubernetes does not limit the types of applications supported
* It is a container-level system and doesn't deploy source code or build your application.
* Doesn't provide built-in services like middleware, data processing frameworks, databases, caches, cluster storage systems.
* Ask specific, answerable questions about how to use Kubernetes on Stack Overflow

Tradeoffs:

Advantages:
* Kubernetes supports an extremely diverse variety of workloads including stateless and stateful applications
* Secret and configuration management without exposing secrets in stack configuration
* Improved scalability with ease to add or update applications
* Dev and Ops separation of concerns by decoupling applications from infrastructure.
* Environmental consistency across different environments such as development, testing, and production.
* Abstraction of complex management tasks
* Allocation of IPv4/IPv6 addresses to Pods and Services for dual-stack support
* Continuous development, integration, and deployment (CI/CD)
* Observability that surfaces OS-level information as well as health signals for the containerized app.
* Reduced hardware costs
* load balancing
* Presentation as a cluster of disposable VMs for better resource management
* Agile application creation and deployment
* Better utilization of physical server resources
* self-healing capabilities
* Storage orchestration: Automatically mounts storage systems of choice, such as local storage or public cloud providers.
* Scale application up and down easily with a simple command, UI or automatically based on CPU usage
* No need for centralized control systems
* best-of-breed ideas and practices from the community
* scalability
* Service discovery and load balancing: Kubernetes can expose a container using DNS or its own IP address. It distributes network traffic to ensure stable deployments.

Limitations:
* It does not dictate logging, monitoring or alerting solutions.
* Designed primarily for container orchestration rather than general purpose computing tasks.
* complexity of the system
* Kubernetes does not provide comprehensive machine configuration, maintenance, or self-healing capabilities
* Lacks comprehensive machine configuration, maintenance, management, self-healing systems.
* Doesn't provide nor mandate a configuration language/system like Jsonnet
