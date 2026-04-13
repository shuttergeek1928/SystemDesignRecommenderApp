Technology: ECS
Category: deployment

When to use:
* AWS Management Console provides a web interface for accessing Amazon ECS resources
* When running containerized workloads on-premises and wanting them integrated with Amazon ECS.
* The blueprint for the application
* ECS is suitable when you need a serverless compute platform that allows containers to run on AWS without managing servers.
* When you need specific compute capabilities such as GPU acceleration, specialized CPU architectures or high network performance while offloading infrastructure management to AWS.
* Registering an external instance such as a VM for compatibility with existing infrastructure
* To use other AWS services to help deploy tasks and services on Amazon ECS
* deploy, manage, and scale containerized applications
* integrated with both AWS tools, such as Amazon Elastic Container Registry, and third-party tools, such as Docker
* An application such as a batch job that performs work, and then stops
* Helps ensure correct number of EC2 instances available for load handling

When not to use:
None specified.

Tradeoffs:

Advantages:
* can run and scale container workloads across AWS Regions in the cloud, and on-premises
* Amazon ECS Managed Instances offloads the management of underlying EC2 instances, including provisioning and maintenance
* Amazon ECS Managed Instances enables you to access specific compute capabilities such as GPU acceleration, specialized CPU architectures or high network performance.
* Access to specific compute capabilities such as GPU acceleration or specialized instance types
* Cost-effective pricing model
* Automatically distribute incoming service traffic
* With Fargate, there's no need to manage servers and handle capacity planning.
* Provides commands for a broad set of AWS services, including Amazon ECS
* Supported on Windows, Mac, and Linux
* easier for teams to focus on building the applications, not the environment
* Pay only for the resources your tasks consume
* Allows access to features
* fully managed service comes with AWS configuration and operational best practices built-in

Limitations:
* On-premises infrastructure may not be fully compatible with Amazon ECS Anywhere
* Limited control over server infrastructure
