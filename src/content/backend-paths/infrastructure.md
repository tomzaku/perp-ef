---
slug: infrastructure
title: "Infrastructure & DevOps"
icon: "IN"
description: "Infrastructure covers the systems that run, deploy, and monitor your code — Docker containers, CI/CD pipelines, logging and observability, and load balancing. These topics bridge the gap between writing code and running it reliably in production."
pattern: "Containerize your application with Docker for consistency across environments. Automate builds, tests, and deployments with CI/CD pipelines. Instrument your code with structured logging, metrics, and tracing for observability. Distribute traffic with load balancers and reverse proxies. The goal: any developer can deploy confidently, and when things break, you can diagnose quickly."
whenToUse: [Setting up a new project's deployment, Debugging production issues, Improving deployment reliability, Scaling a service horizontally, Building observability into a system]
keyInsights:
  - Docker ensures "works on my machine" works everywhere
  - CI/CD automates the path from code to production
  - Observability = logs + metrics + traces working together
  - Load balancers distribute traffic and enable zero-downtime deploys
  - Blue-green and canary deployments reduce deployment risk
questionIds: [be-13, be-14, be-15, be-16]
---

## Infrastructure & DevOps

Infrastructure is what turns your code into a running, reliable service. Docker packages it, CI/CD deploys it, observability lets you understand it, and load balancers keep it available.

### Docker & Containerization

Docker packages your application with all its dependencies into a container — a lightweight, isolated environment that runs the same everywhere. A **Dockerfile** defines how to build the image. **Docker Compose** orchestrates multiple containers (app + database + cache) for local development. In production, container orchestrators like Kubernetes manage scaling, health checks, and rollouts.

Key concepts: layers and caching (order Dockerfile commands from least to most changing), multi-stage builds (separate build and runtime images for smaller sizes), and volume mounts for persistent data.

### CI/CD Pipelines

Continuous Integration automatically builds and tests every commit. Continuous Deployment automatically pushes passing builds to production. A typical pipeline: **lint → test → build → deploy staging → integration tests → deploy production**.

Deployment strategies minimize risk: **Blue-green** runs two identical environments and switches traffic instantly. **Canary** routes a small percentage of traffic to the new version first. **Rolling** updates instances one at a time.

### Observability

You can't fix what you can't see. The three pillars of observability:

- **Logs**: Structured events (JSON) from your application. Use log levels (debug, info, warn, error) meaningfully.
- **Metrics**: Numerical measurements over time — request rate, error rate, latency (the RED method), or saturation and utilization (the USE method).
- **Traces**: Follow a single request across multiple services. Distributed tracing (OpenTelemetry) shows where time is spent.

### Load Balancing

A load balancer distributes incoming requests across multiple server instances. **Reverse proxies** (Nginx, HAProxy) sit in front of your servers, handling SSL termination, compression, and static file serving. Algorithms include round-robin, least connections, and IP hash (for session affinity).

```mermaid
flowchart TD
    A[Code Push] --> B[CI Pipeline]
    B --> C[Lint & Test]
    C --> D[Build Docker Image]
    D --> E[Push to Registry]
    E --> F{Deploy Strategy}
    F --> G[Blue-Green]
    F --> H[Canary]
    F --> I[Rolling]
    G --> J[Production]
    H --> J
    I --> J
    J --> K[Monitoring & Alerts]
```

## ELI5

**Docker** is like a lunchbox. Instead of hoping the school cafeteria has what you need, you pack everything yourself. Your app runs the same way everywhere because it brings its own "food" (dependencies).

**CI/CD** is like an assembly line in a factory. Every time someone adds a part (code), the line automatically checks it, tests it, and ships it. No human has to push a button.

**Observability** is like the dashboard in a car. Logs are the check-engine light telling you something happened. Metrics are the speedometer and fuel gauge showing how things are going. Traces are GPS showing the exact route a trip took.

**Load balancing** is like having multiple checkout lanes at a grocery store. A greeter (load balancer) sends each customer to the shortest line.

## Poem

Docker packs your code up tight,
Runs the same in day or night.
CI tests what you commit,
CD ships if all is fit.

Logs will tell you what went wrong,
Metrics hum a steady song.
Traces follow each request —
Observability at its best.

## Template

```dockerfile
# Multi-stage Docker build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```
