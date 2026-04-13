Technology: Prometheus
Category: observability

When to use:
* Prometheus is suitable for monitoring time series data
* PromQL, a flexible query language
* Prometheus is suitable for monitoring applications that produce metrics in a format Prometheus understands, either directly through its scrape endpoint or indirectly via an intermediary push gateway.
* Machine-centric monitoring as well as highly dynamic service-oriented architectures
* Recording purely numeric time series
* You can always view what statistics are available about your system
* To understand why your web server becomes slow when there are many requests
* standalone open source project
* a multi-dimensional data model with time series data identified by metric name
* open source systems monitoring and alerting toolkit

When not to use:
* Prometheus is not a good choice as
* the collected data will likely not be detailed and complete enough for per-request billing.

Tradeoffs:

Advantages:
* multiple modes of graphing and dashboarding support
* collects and stores its metrics as time series data with timestamp information, along with optional key-value pairs called labels
* Facilitates capacity planning by understanding the load
* pushing time series is supported via an intermediary gateway
* The architecture of Prometheus allows it to store all scraped samples locally and run rules over this data for aggregation, alert generation, etc.
* no reliance on distributed storage; single server nodes are autonomous
* Most Prometheus components are written in Go, making them easy to build and deploy as static binaries.
* Prometheus can be used with Grafana or other API consumers to visualize the collected data.
* Helps in identifying performance bottlenecks
* Support for multi-dimensional data collection and querying
* time series collection happens via a pull model over HTTP

Limitations:
* May not capture all aspects of application behavior
* The architecture of Prometheus is not designed to handle real-time streaming metrics directly from applications. Instead, it relies on periodic scraping and push gateway for short-lived jobs.
* Prometheus does not support monitoring non-textual data types such as images or videos.
* Limited to recording purely numeric time series
* The reliability of Prometheus may lead to inaccurate or incomplete statistics under certain conditions, such as when 100% accuracy is required like for per-request billing
* Each Prometheus server is standalone, not depending on network storage or other remote services
