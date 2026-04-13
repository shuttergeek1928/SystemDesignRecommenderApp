import subprocess
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('ingest_batch')

# Mapping of technology names, categories, and their documentation URLs
# Note: For real-world use, these URLs would be the specific architecture/use-case pages.
# Here we provide the top-level or introduction pages for demonstration.

docs = [
    # ── Databases ──────────────────────────────────────────────
    ("PostgreSQL", "databases", "https://www.postgresql.org/docs/current/index.html"),
    ("MongoDB", "databases", "https://www.mongodb.com/docs/manual/introduction/"),
    ("DynamoDB", "databases", "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html"),
    ("Cassandra", "databases", "https://cassandra.apache.org/_/cassandra-basics.html"),
    ("MySQL", "databases", "https://dev.mysql.com/doc/refman/8.0/en/what-is-mysql.html"),
    ("Neo4j", "databases", "https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/"),
    ("CockroachDB", "databases", "https://www.cockroachlabs.com/docs/stable/architecture/overview"),

    # ── Caching ────────────────────────────────────────────────
    ("Redis", "caching", "https://redis.io/docs/about/"),
    ("Memcached", "caching", "https://memcached.org/about"),
    ("Varnish", "caching", "https://varnish-cache.org/intro/"),

    # ── Messaging / Event Streaming ────────────────────────────
    ("Kafka", "messaging", "https://kafka.apache.org/intro"),
    ("RabbitMQ", "messaging", "https://www.rabbitmq.com/tutorials/amqp-concepts.html"),
    ("SQS", "messaging", "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html"),
    ("NATS", "messaging", "https://docs.nats.io/nats-concepts/overview"),
    ("Pulsar", "messaging", "https://pulsar.apache.org/docs/4.0.x/concepts-overview/"),

    # ── Deployment / Orchestration ─────────────────────────────
    ("Kubernetes", "deployment", "https://kubernetes.io/docs/concepts/overview/"),
    ("Docker", "deployment", "https://docs.docker.com/get-started/overview/"),
    ("ECS", "deployment", "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html"),
    ("Terraform", "deployment", "https://developer.hashicorp.com/terraform/intro"),
    ("Ansible", "deployment", "https://docs.ansible.com/ansible/latest/getting_started/introduction.html"),
    ("Nomad", "deployment", "https://developer.hashicorp.com/nomad/docs/concepts/architecture"),

    # ── Observability ──────────────────────────────────────────
    ("Prometheus", "observability", "https://prometheus.io/docs/introduction/overview/"),
    ("CloudWatch", "observability", "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html"),
    ("Grafana", "observability", "https://grafana.com/docs/grafana/latest/introduction/"),
    ("Jaeger", "observability", "https://www.jaegertracing.io/docs/1.47/architecture/"),
    ("OpenTelemetry", "observability", "https://opentelemetry.io/docs/concepts/observability-primer/"),

    # ── Security ───────────────────────────────────────────────
    ("OAuth2", "security", "https://auth0.com/intro-to-iam/what-is-oauth-2"),
    ("JWT", "security", "https://jwt.io/introduction"),
    ("TLS", "security", "https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/"),

    # ── API Gateway / Service Mesh ─────────────────────────────
    ("Nginx", "api_gateway", "https://nginx.org/en/docs/http/ngx_http_proxy_module.html"),
    ("Kong", "api_gateway", "https://docs.konghq.com/gateway/latest/get-started/"),
    ("Istio", "service_mesh", "https://istio.io/latest/docs/concepts/what-is-istio/"),
    ("Envoy", "service_mesh", "https://www.envoyproxy.io/docs/envoy/latest/intro/what_is_envoy"),

    # ── Search ─────────────────────────────────────────────────
    ("Elasticsearch", "search", "https://www.elastic.co/guide/en/elasticsearch/reference/current/elasticsearch-intro.html"),

    # ── CI/CD ──────────────────────────────────────────────────
    ("GitHubActions", "ci_cd", "https://docs.github.com/en/actions/about-github-actions/understanding-github-actions"),
    ("Jenkins", "ci_cd", "https://www.jenkins.io/doc/book/pipeline/"),

    # ── Architecture Patterns ──────────────────────────────────
    ("Microservices", "architecture", "https://microservices.io/patterns/microservices.html"),
    ("CQRS", "architecture", "https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs"),
    ("EventSourcing", "architecture", "https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing"),
    ("CircuitBreaker", "architecture", "https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker"),
]

import os
from pathlib import Path

KB_DIR = Path("knowledge_base")

def has_meaningful_content(tech: str, category: str) -> bool:
    """Check if the knowledge base markdown file already has real extracted content."""
    md_path = KB_DIR / category.lower() / f"{tech.lower()}.md"
    if not md_path.exists():
        return False
    
    content = md_path.read_text(encoding="utf-8")
    # A file is "meaningful" if at least one section has real bullet points
    # instead of only "None specified." placeholders.
    sections = ["When to use:", "When not to use:", "Advantages:", "Limitations:"]
    for section in sections:
        idx = content.find(section)
        if idx == -1:
            continue
        # Grab text after the section header until the next section or end
        after = content[idx + len(section):]
        # Check if there's a bullet point line (starts with "* ")
        for line in after.splitlines():
            line = line.strip()
            if line.startswith("* ") and line != "* None specified.":
                return True
            # Stop at the next section header
            if line and line in sections:
                break
    return False

def run_ingestion():
    total = len(docs)
    logger.info(f"Starting batch ingestion for {total} documents...")
    
    for i, (tech, category, url) in enumerate(docs):
        # Skip if the md file already has meaningful content
        if has_meaningful_content(tech, category):
            logger.info(f"[{i+1}/{total}] Skipping {tech} ({category}) — already has content.")
            continue
        
        logger.info(f"[{i+1}/{total}] Ingesting {tech} ({category}) from {url}")
        
        try:
            # We run the ingestion pipeline via subprocess to keep memory clean,
            # though calling it directly in Python is also possible.
            result = subprocess.run(
                [r".\.venv\Scripts\python", "main.py", "extract", "--url", url, "--tech", tech, "--category", category],
                capture_output=True,
                text=True,
                check=True
            )
            logger.info(f"Successfully finished parsing {tech}.")
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to ingest {tech}. Error: {e.stderr}")
            
        time.sleep(2) # Brief pause between scrapes
        
    logger.info("Batch ingestion process completed! You should run `python main.py index` next.")

if __name__ == "__main__":
    run_ingestion()
