Technology: Docker
Category: deployment

When to use:
* When you need to package and run applications in isolation
* To create a read-write filesystem for containers
* When you need to package and deploy applications consistently across different environments.
* Ideal for environments requiring efficient resource utilization
* For networking connectivity without specifying options
* separate applications from infrastructure
* reduce delay between coding and deployment
* Docker provides a cost-effective alternative
* To streamline development lifecycle
* For distributing and testing application components
* Separation of concerns between user interaction and container operations
* The Docker client is used for interacting with Docker using commands like 'docker run'.
* manage Docker objects like images, containers, networks, and volumes
* communicate with other daemons to manage Docker services
* for building containerized applications
* When you want an isolated environment that shares resources with other containers
* For efficient image creation and rebuilding using Dockerfile
* For microservices architecture where each service can be developed, shipped, and scaled independently.
* Store and share Docker images
* For continuous integration and delivery workflows
* When creating read-only templates with instructions for running applications
* Client-server architecture simplifies container management
* Run custom applications
* for sharing microservices
* When you need an isolated workspace called the container
* highly portable workloads
* To encapsulate dependencies for consistency across multiple environments
* easy dynamic management of workloads

When not to use:
None specified.

Tradeoffs:

Advantages:
* Docker uses namespaces technology for isolation
* Standardized environments for developers to work in using local containers.
* Enhances security through isolation of applications in containers.
* significantly reduce the delay between writing code and running it in production
* Simplifies the deployment process by containerizing your application's environment.
* Cost savings by using more of server capacity efficiently
* Centralized storage for multiple projects
* It simplifies the process of running containers by abstracting away most command-line details.
* Easy to create, start, and stop containers.
* Provides a layer of isolation with limited access to that namespace
* Improves scalability and resource utilization efficiency.
* easy-to-install application for Mac, Windows, or Linux environments
* Ability to orchestrate multi-container applications with Docker Compose
* Allows container to interact with the host's terminal and provide input directly
* Lightweight, small, fast images when compared to other virtualization technologies due to layered architecture of images.
* Allows users to execute container operations without needing detailed knowledge about Docker internals.
* portability across different environments (local, VMs in data centers, cloud providers)
* Lightweight containers that contain everything needed to run the application, ensuring consistency across different environments.
* Ability to share data between containers using volumes or bind mounts.
* Lightweight and fast performance
* Efficient use of resources as only changed layers are rebuilt during image updates.
* Ease of use for managing containers across different systems
* Easy access to shared images without downloading them locally

Limitations:
* Limited networking options
* Potential performance overhead due to network communication between client and daemon
* Potential security risks if not properly configured and managed
* Changes made within a container disappear if the container is removed without persistent storage options. Containers may not be suitable for applications that require permanent data persistence across restarts or removals.
* Can introduce complexity when managing stateful services or databases that require persistent storage outside the container.
* May lead to overhead if not managed properly, due to potential for creating too many containers.
* The client is limited in its ability to manage complex multi-container setups and orchestration tasks, which are better handled by higher-level tools like Docker Compose or Kubernetes.
* Containers are ephemeral
* Requires a learning curve and understanding of orchestration tools like Kubernetes.
* Dependency on the underlying daemon for executing commands can be a single point of failure.
