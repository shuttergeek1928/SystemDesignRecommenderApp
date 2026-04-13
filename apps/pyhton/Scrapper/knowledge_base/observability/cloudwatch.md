Technology: CloudWatch
Category: observability

When to use:
* Amazon CloudWatch Discussion Forums for community-based discussions
* monitors your AWS resources in real time
* For creating cross-account dashboards, setting up alarms across account boundaries, and performing root-cause analysis.
* interactive, fast queries on your log data
* When monitoring internet performance between applications and customers
* Operational visibility with metrics
* automatically detect key performance indicators without manual instrumentation
* collect detailed system metrics about processes, CPU, memory, disk usage, network performance
* To quickly implement monitoring with ready configurations
* monitor custom application metrics
* To enable centralized monitoring and troubleshooting of applications that span multiple accounts.
* For identifying increased latency or regional disruptions
* Enhanced operational awareness
* Database performance monitoring
* SQL query analysis
* AWS Support as a hub for creating and managing AWS cases
* monitor endpoints and APIs proactively through canaries to simulate user behavior
* provides system-wide observability of application performance, operational health, and resource utilization
* comprehensive log management

When not to use:
* Avoid unnecessary data transfers to Amazon S3 as it can increase your bill.

Tradeoffs:

Advantages:
* Automated insights about network traffic patterns and performance.
* simplified setup with curated dashboards for monitoring applications' KPIs like latency, error rates, request rates without code changes
* Application Performance Monitoring (APM)
* Unified view of resources and applications.
* Infrastructure monitoring
* proactive endpoint and API availability checks through CloudWatch Synthetics canaries to prevent impact on real users
* Collect, store, and query logs
* Allows viewing of metrics, logs, and traces from source accounts across the organization
* supports both Windows and Linux operating systems
* Operational visibility with metrics, alarms, and dashboards
* Quick visualization of packet loss and latency over a specified time frame.
* CloudWatch provides detailed monitoring and alerting for AWS resources, which helps in cost optimization by identifying underutilized services that could be downsized or terminated without impact on operations
* Easy organization of logs into groups and streams
* Share dashboards across accounts and Regions.
* Real-time database metrics collection and analysis
* Provides focused guidance for installation, configuration and alarm setup.
* Ease of use with the Amazon Management Console allowing most functions without programming.
* can integrate with Systems Manager for centralized configuration management
* Enables centralized monitoring for multi-account AWS environments
* Visualizations in a single location.

Limitations:
* There are limits to the number of alarms you can create per month. Exceed these limits at your own risk.
* Not explicitly mentioned in the text
