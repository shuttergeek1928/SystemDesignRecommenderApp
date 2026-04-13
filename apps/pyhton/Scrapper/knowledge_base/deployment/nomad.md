Technology: Nomad
Category: deployment

When to use:
* When federating multiple regions together into a single cluster is required for availability or scalability.
* Nomad for job scheduling with resource utilization maximization
* Learn how regions, servers, and clients interact
* Understand data replication in Nomad clusters
* for jobs requiring specific technical and software features
* When you need a highly scalable system that can handle very large clusters by distributing jobs across multiple datacenters.

When not to use:
None specified.

Tradeoffs:

Advantages:
* Documentation helps users and developers build a mental model of how it works
* It supports federating multiple regions together into a single cluster for improved availability or scalability.
* Optimized task placement to make use of all machine resources without exhausting any dimension (bin packing)
* Ability to specify job constraints for appropriate environment ensuring application runs correctly
* Nomad allows you to run highly scalable systems with the ability to distribute jobs across different datacenters.

Limitations:
* The consensus group within each region can become progressively slower as more servers are added.
* Each region is expected to have either three or five servers, which may not be optimal in all scenarios. There's no limit on the number of clients per region.
