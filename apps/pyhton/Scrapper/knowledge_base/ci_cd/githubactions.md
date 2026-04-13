Technology: GitHubActions
Category: ci_cd

When to use:
* create workflow using templates
* automate build, test, and deployment pipeline
* To perform specific tasks within a workflow
* Add a label whenever a new issue is opened
* deploying projects to third-party platforms via GitHub Actions
* When configuring GitHub Actions to automate tasks related to code changes
* continuous integration (CI) workflows for building and testing your code
* Reduce repetitive code
* building and publishing packages with GitHub Actions
* Build and test pull requests
* When someone creates a pull request
* automate nearly every aspect of application development processes
* Deploy your application every time a release is created
* run workflows when other events happen
* When you need to execute a set of steps that are dependent on each other
* When GitHub provides the required OS/hardware configurations
* When an issue is opened

When not to use:
* GitHub Actions may not be suitable for projects that require complex workflows or have specific CI/CD needs

Tradeoffs:

Advantages:
* Free of charge
* Flexibility in job execution order and parallelism
* allows you to host self-hosted runners in own data center or cloud infrastructure
* Easy to set up and use
* Flexibility in configuring dependencies among jobs
* Ability to configure actions based on repository events
* Each workflow runs in a fresh, newly-provisioned virtual machine
* Reusability of predefined, reusable sets of jobs or code
* GitHub also offers larger runners for more demanding tasks
* Configurable automated process that can run one or more jobs when triggered by an event, manually, or at a defined schedule.
* automate nearly every aspect of application development processes
* provides Linux, Windows, and macOS virtual machines to run your workflows
* Ability to share data between different steps within the same job

Limitations:
* Limited customization options compared to other tools like Jenkins or GitLab CI.
* Limited control over the underlying infrastructure
* Only one job can be executed at a time per runner
* Jobs that have a dependency on another job will run sequentially, which can lead to longer overall execution times if there are many dependent jobs.
