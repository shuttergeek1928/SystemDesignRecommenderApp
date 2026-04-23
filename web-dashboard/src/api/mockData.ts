import { RecommendationResponse } from "@/types/recommendation";

export const MOCK_RECOMMENDATIONS: RecommendationResponse = {
  recommendations: [
    {
      id: "rec-1",
      title: "Scalable Event-Driven Microservices",
      description:
        "An architecture designed for high throughput and extreme scalability, leveraging asynchronous communication.",
      confidenceScore: 94,
      architecture: [
        {
          component: "Frontend",
          selection: "Next.js (App Router)",
          rationale:
            "Provides excellent SEO and performance with Server Components.",
          alternatives: ["Vite + React SPA", "Remix"],
          pros: ["Performance", "Developer Experience"],
          cons: ["Complexity in hybrid rendering"],
        },
        {
          component: "API Gateway",
          selection: "AWS AppSync (GraphQL)",
          rationale:
            "Simplifies data fetching and provides real-time capabilities.",
          alternatives: ["Apollo Server", "Kong"],
          pros: ["Real-time support", "Managed service"],
          cons: ["Vendor lock-in"],
        },
        {
          component: "Primary Backend",
          selection: "Go Gofiber Services",
          rationale:
            "High performance and low memory footprint for microservices.",
          alternatives: ["Node.js", "Python FastAPI"],
          pros: ["Speed", "Concurrency"],
          cons: ["Higher learning curve for junior devs"],
        },
        {
          component: "Messaging",
          selection: "Apache Kafka",
          rationale: "Highly reliable and scalable event streaming.",
          alternatives: ["RabbitMQ", "AWS SQS"],
          pros: ["Durability", "Scalability"],
          cons: ["Operational complexity"],
        },
      ],
      tradeOffs: [
        {
          factor: "Latency vs Consistency",
          choiceA: "Eventual Consistency",
          choiceB: "Strong Consistency",
          impact:
            "Choosing Eventual Consistency allows for higher availability and lower latency in a distributed system.",
        },
        {
          factor: "Development Speed vs Performance",
          choiceA: "Go",
          choiceB: "Node.js",
          impact:
            "Go provides better performance but might have a slower initial development speed compared to Node.js for smaller teams.",
        },
      ],
      productivityImpact: {
        learningCurve: "High",
        maintenanceEffort: "Medium",
        developmentSpeed: "Steady",
      },
      deploymentStrategy: "Blue/Green deployment on Kubernetes (EKS)",
    },
    {
      id: "rec-2",
      title: "Monolithic Productivity Suite",
      description:
        "A streamlined architecture focused on rapid delivery and high developer productivity for medium-scale applications.",
      confidenceScore: 89,
      architecture: [
        {
          component: "Framework",
          selection: "Next.js Fullstack",
          rationale:
            "Uses Next.js for both frontend and API routes to minimize context switching.",
          alternatives: ["Ruby on Rails", "Laravel"],
          pros: ["Single language", "Rapid development"],
          cons: ["Scalability bottlenecks if not careful"],
        },
        {
          component: "Database",
          selection: "PostgreSQL with Prisma",
          rationale:
            "Type-safe ORM for fast and reliable database interactions.",
          alternatives: ["TypeORM", "Drizzle"],
          pros: ["Type safety", "Ease of use"],
          cons: ["Abstraction overhead"],
        },
      ],
      tradeOffs: [
        {
          factor: "Simplicity vs Scalability",
          choiceA: "Monolith",
          choiceB: "Microservices",
          impact:
            "Monolith significantly reduces operational overhead and dev complexity at the cost of independent scaling.",
        },
      ],
      productivityImpact: {
        learningCurve: "Low",
        maintenanceEffort: "Low",
        developmentSpeed: "Fast",
      },
      deploymentStrategy: "Vercel with GitHub Integration",
    },
  ],
  metadata: {
    processingTime: "450ms",
    engineVersion: "v2.1.0-alpha",
  },
};
