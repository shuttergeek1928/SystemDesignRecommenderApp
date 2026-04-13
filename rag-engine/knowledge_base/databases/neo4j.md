Technology: Neo4j
Category: databases

When to use:
* A node can have relationships with itself.
* To represent entities of a domain
* Neo4j is suitable for applications that require complex relationships between entities
* To represent a specific type of connection between two nodes
* gain performance
* Node labels are case sensitive
* modeling benefits
* make sure that data adheres to domain rules
* To find out which movies Tom Hanks acted in
* Grouping similar entities together
* Perform operations only on specific types of nodes
* Properties are key-value pairs that can be used for storing data on nodes and relationships.
* Increase query performance
* Example to understand basic properties and structure
* Relationships organize nodes into structures, allowing a graph to resemble various entities or complex inter-connected structures.

When not to use:
None specified.

Tradeoffs:

Advantages:
* Enables the use of pattern matching to find complex relationships
* Efficiently finds answers to questions by visiting a subset of the graph.
* Graph databases like Neo4j provide a more intuitive way to represent and query data with interconnected objects
* The ability of the relationship type: ACTED_IN to describe specific roles and performance metrics for an actor in a movie, providing detailed information about their involvement. This allows users to query data based on these properties.
* Consistency with Cypher® naming rules and recommendations
* Can hold a homogeneous list (array) containing strings, numbers, or boolean values.
* Clarity in identifying node types
* The graph model allows efficient traversal of connected nodes, which is beneficial for social networks or recommendation systems
* Flexibility in adding and removing labels during runtime
* Can hold different data types, such as number, string, or boolean.
* flexibility of not having a schema up front
* Nodes provide an easy way to model and store data about discrete objects.
* Ability to mark temporary states for nodes with suspended or seasonal labels
* Allows for more precise querying and filtering based on relationship types
* Useful for beginners learning Neo4j
* Clear illustration of property graph concepts
* Faster search results by reducing the number of nodes and relationships that need to be examined during a match operation.

Limitations:
* The need to create duplicate relationships in the opposite direction unless it is needed for proper data modeling can lead to unnecessary complexity and redundancy.
* Limited flexibility in representing different kinds of connections between nodes with a single type
* Indexes consume additional disk space, which can lead to increased memory usage. Additionally, maintaining indexes on frequently updated data may result in performance degradation due to index rebuilds or updates required after each change.
* May require additional logic or custom properties for more nuanced representation
* Relationships always have direction which might not be necessary or useful in some cases.
* Neo4j's strict directionality in relationships can be limiting if bidirectional connections are needed
