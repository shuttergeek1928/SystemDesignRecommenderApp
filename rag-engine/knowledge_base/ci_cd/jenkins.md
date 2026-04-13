Technology: Jenkins
Category: ci_cd

When to use:
* Defines a conceptually distinct subset of tasks performed through the entire pipeline
* Declarative Pipeline syntax provides a simpler and more readable way to define Jenkins pipelines.
* Define a Jenkins Pipeline through Blue Ocean
* Pipelines support complex real-world CD requirements
* When using Docker with Jenkins requires a consistent environment setup
* Define a Jenkins Pipeline using classic UI or SCM
* When you want to define your pipeline as code for better version control and collaboration
* Automatically creates a Pipeline build process for all branches and pull requests.
* Schedules the steps contained within the block to run by adding an item to the Jenkins queue.
* Pipelines for automating build, test and deployment processes
* Building on the core Jenkins value of extensibility
* A node can execute pipelines
* To execute specific commands or scripts within Jenkins
* Declarative pipeline is easier to read, write, understand
* Code review/iteration on the Pipeline (along with the remaining source code).
* For complex workflows that require version control
* Easily model Continuous Delivery (CD) scenarios
* Declarative pipeline is designed to make writing and reading Pipeline code easier
* Audit trail for the Pipeline.
* A Pipeline's code defines your entire build process
* The ability to fork/join, loop, and perform work in parallel
* Jenkinsfile to define pipeline as code
* Single source of truth
* Best practice
* Creates a workspace (a directory specific to that particular Pipeline) where work can be done on files checked out from source control.
* To define a pipeline as code

When not to use:
* Define complex logic within a single stage

Tradeoffs:

Advantages:
* Schedules tasks for execution when executors are free, potentially reducing build times.
* Extensible by users with Pipeline Shared Libraries and plugin developers
* Used by many plugins to visualize or present Jenkins Pipeline status/progress
* Improved visibility into the CI/CD process with Pipeline Syntax
* Provides a dedicated space for each pipeline to manage its own artifacts and workspace cleanup more effectively.
* Provides richer syntactical features over Scripted Pipeline syntax
* Automatically creates a Pipeline build process for all branches and pull requests.
* Provides more readable syntax compared to scripted pipelines.
* Easier to read and maintain
* Code: Pipelines are implemented in code and typically checked into source control, giving teams the ability to edit, review, and iterate upon their delivery pipeline.
* Enforces structure and readability
* Makes sequential tasks a first-class citizen in Jenkins
* Ability to extend Pipeline DSL with custom steps for specialized tasks.
* Code review/iteration on the Pipeline (along with the remaining source code).
* Stronger enforcement of best practices through the Groovy Domain Specific Language (DSL).
* Ability to create reusable pipeline code
* Pausable: Optionally stop and wait for human input or approval before continuing the Pipeline run.
* Durable: Pipelines can survive both planned and unplanned restarts of the Jenkins controller.
* Improved visibility and traceability of the build process
* Use Docker to invoke containers on agents/nodes from a Jenkinsfile.
* Reusability of code through Shared Libraries
* Simplifies pipeline syntax
* Flexibility in defining different stages for various environments (e.g., development, testing)
* Enables continuous integration/continuous delivery (CI/CD) practices.
* Audit trail for the Pipeline.
* Pipelines are user-defined models of a CD pipeline
* Scalability in managing Jenkins for large projects
* Easier pipeline definition with less code.
* Can be viewed and edited by multiple members of the project.
* More structured syntax
* Include stages for building an application, testing it and delivering
* Improved readability for new developers or non-technical stakeholders
* Nodes provide the necessary computing resources for pipeline execution.
* Work with branches and pull requests.

Limitations:
* More restrictive syntax compared to Scripted Pipeline.
* Requires learning new concepts like Groovy scripting and Jenkinsfiles syntax
* Workspaces may not get automatically cleaned up after inactivity without proper configuration. This can lead to disk space issues if left unchecked, as discussed in JENKINS-2111 tickets and discussions.
* Requires familiarity with DSL and understanding its limitations.
* Limited to Groovy scripting language for more advanced use cases
* Potential complexity and learning curve associated with advanced features like Blue Ocean
* Pipeline can become complex if not well-structured or documented
* Limited support for older systems that may require additional plugins to integrate with
* Limited by available hardware and network connectivity
