# DevAll: Agentic DevOps System

[![Hackathon](https://img.shields.io/badge/Hackathon-AI%20Dev%20Days-blue)](https://developer.microsoft.com/)
[![Azure](https://img.shields.io/badge/Cloud-Microsoft%20Azure-0078D4)](https://azure.microsoft.com/)
[![AI](https://img.shields.io/badge/AI-Azure%20OpenAI-5C2D91)](https://learn.microsoft.com/azure/ai-services/)
[![Framework](https://img.shields.io/badge/Framework-Spring%20Boot%203-6DB33F)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Next.js-61DAFB)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Prototype-orange)]()

---

# Overview

This project was developed as part of the **AI Dev Days Hackathon**, focusing on building a practical AI-powered solution that addresses real-world infrastructure and data engineering bottlenecks using Microsoft AI technologies.

**DevAll** is an autonomous **Site Reliability Engineering (SRE)** and **Data Orchestration** platform. It utilizes a multi-agent Large Language Model (LLM) swarm to monitor infrastructure, diagnose pipeline failures, synthesize code patches, and deploy validated fixes while maintaining a **human-in-the-loop approval stage**.

The repository contains the full implementation, API definitions, and supporting documentation required to understand and evaluate the project.

---

# Problem Statement

Organizations increasingly rely on complex **CI/CD pipelines** and **large-scale data workflows**. When these pipelines fail, resolving them requires several manual steps:

- reading raw logs
- diagnosing the root cause
- writing a patch
- rerunning CI/CD pipelines

This process results in:

- high **Mean Time To Recovery (MTTR)**
- heavy operational toil for DevOps teams
- fragmented institutional knowledge
- repeated debugging of previously solved incidents

DevAll addresses this challenge by providing an **AI-driven self-healing system** capable of intercepting failure events, diagnosing logs using historical semantic memory, generating patches, and staging validated fixes for operator approval.

---

# Solution

DevAll implements a **Reactive Micro-Kernel architecture** that combines cloud services, AI orchestration, and developer tooling to provide an autonomous workflow.

Key capabilities include:

- **Autonomous SRE Swarm**  
  A multi-agent system that reads logs, finds root causes, generates patches, and validates fixes through CI/CD.

- **Enterprise ETL Forge**  
  Generates production-ready **Python Polars data pipelines** from raw JSON schemas.

- **Late Execution Orchestration**  
  Maintains an in-memory **Job Registry** where incidents remain staged until a human operator approves execution.

- **Semantic Memory**  
  Records successful incident resolutions in a vector-like memory layer, enabling the system to reuse historical fixes when similar error signatures appear.

---

# Business Impact

DevAll significantly reduces operational overhead by automating repetitive debugging workflows.

| Phase | Traditional Workflow | DevAll Workflow | Time Savings |
|------|----------------------|----------------|-------------|
| Detection | Slack or email alert | GitHub webhook triggers incident | — |
| Triage | Developer reads CI logs | `LogAnalyzerAgent` extracts stack traces | 30–60 minutes |
| Root Cause | Developer searches documentation | `RootCauseAgent` consults semantic memory | 1–2 hours |
| Patch Creation | Manual debugging and coding | `CodeFixAgent` generates AST patch | 2–4 hours |
| Validation | Manual commit and CI wait | `ValidatorAgent` runs sandbox execution | Hours |
| Decision | Developer manually creates PR | Human approves fix via UI | Instant |
| **Total MTTR** | **4–8+ hours** | **< 3 minutes** | **~98% reduction** |

---

# Technologies Used

The project leverages the Microsoft AI ecosystem and modern backend frameworks.

### AI & Cloud

- **Microsoft Semantic Kernel** — Multi-agent LLM orchestration
- **Azure OpenAI** — LLM inference and reasoning

### Backend

- **Java 21**
- **Spring Boot 3.2**
- **Spring WebFlux / Project Reactor** for non-blocking execution
- **ConcurrentHashMap-based Semantic Memory**

### Infrastructure

- **GitHub Webhooks** — CI/CD failure triggers
- **GitHub REST API** — Git tree manipulation and log retrieval
- **Server-Sent Events (SSE)** — Real-time telemetry streaming

### Data Processing

- **Python 3.11**
- **Polars DataFrame Engine**

---

# Architecture

The architecture demonstrates how **Multi-Agent AI components interact within a production-grade system**.

[![DevAll Structure](https://mermaid.ink/img/pako:eNqVVn9v4jgQ_SpWVtq_QgrhZ9nTSS1Q6G57RU33Tlo4nUyYgNVg5xynhTb97je2Q0hpe3cLAtnOmzfjmedxnp1QLMHpO1EsHsM1lYrcDeec4CfNFitJkzW5kIIr4EsyuwUaKjKk6XohqFz-aYH68_1ydslDtgReeY6rFcjlcIQYBRI52AOQ0d0VCShfLsS2groDuWGcxrMrjfkGkkNcLhY4jGXOj4I8p-G9iTFIJOMrci6EIjcyXEOqJFVC9nv1Xr3i6Gx6OTtbYbwsHOD-pIhjkJXnI75iHGajLYSZYoLbeQDygYVQwVV9zAKIownQGCOorlfgQ6qocTsrR285r2FTLCLjhuoYcUnI3VtoEIxm-CPBLlWwIVdiRQIlgW7-JVfBI5UbMrvOYsVqJgRydXVtlyvUyGUj1QPM_u4JpFmoYG4xzRakRwOapXAMGaDALESPLtj2GPA75mtpEWaoM_bGDzwUbuCBwePrQN7b42iLSsOgyawcafHhQ13MtEI9nszGTE2yBfkDFmsh7lPyWaujqpWnmwT4GQrmKZNA7ITsS1OotLojCIfnM_zHnZiKL2gKb4MdT0it9mve8PaeyaOQ9_ok_iUzTiLKYnSX62CsAQ6Mhe9hkekKUrI_dPkrHVr0dwtuemR6E9yREzBShpNUmy7foW155E6y1QpkasVwzGrh1TVj16YeuQAVrtGchpDmpXSswX5mwNMsjlPygyV6GaHjiQV9xL3wSCE-IzZiNJYfhGftyin5Ba0qB8g-Psztc1OgY0sTnRSbRKVFSfOy8h_vPcRa7LjCVYYhnmGipxRTkR90by3LqTEbA8dGqLCC051aC_5_PC09JNlsmEJ9Di7JFDtWXjk81uwwL7KdIgs5l5RjeT4boxStbd4_8gS4J9SKZGpHgpBybXibl4ewSFwxMyY6dtwL1hbX_86QruoBW79Bne2liGecnqyKHNRAxe-o8dzD2qBeiRLEOMoPzdMiy6nBD5C8qB52QIYX1dfg5rdqYt_aDNEHqExi7IMYcKM0Sbxkl-uIj4MfHZ-jRJpe9E7oF5XQiysuLy4UC7RjqwTEZnyvAxKLkMbx7kP45BDxNeht6m41ZFGUvgp6f2Mam0uP2PrgRcexKTGtN7w03iu_h_ivuFOrG7zLpFoAVdqLPa-lnb51NPs3r7hxUvS6VWT0YF8CFM3LMPZhhTFN0yFERJo3iYjFcf9TPWp0fepiCOIe-p-ai54fdYpp7ZEt1brvJ1s3FDHe4p-iKPpyRJbaK79g8-udRrdk8_2w3YafYaOsYGpAY9FalEy0125H3Z9h0tkoqLr6W1J1m_r7H1QVMmzlLhbXLatq0ld1p6XnWpm41YK6pd7dQw90dels0l5x7Pu0W_ZEt-xa7qGxuOXJp-yV_Xji7g-bazqszsAXx3VWki2dfkTjFFxng5ugeu48a-O5g71zA3Onj8MllfdzZ85f0Cih_IcQG6evZIZmUmSr9X6SJdhBYMgo3ucHBF6tIAci48rp-81O23A4_Wdn6_RrjUa34zWbjUa70-n2Os2O6-ycfvPU67Tafqt72mrXfb9Tb724zpNx63utdstvtjrN09Zpr93r9VwHlgyTem1fmUPBI7ZyXv4BN9eqFg?type=png)](https://mermaid.live)

---

# Core Components

### AgenticController

Primary REST interface responsible for:

- receiving GitHub webhooks
- triggering incident execution
- streaming kernel telemetry via SSE

---

### SelfHealingOrchestrator

Central orchestration engine that:

- manages incident lifecycle
- coordinates the agent swarm
- maintains the **in-memory Job Registry**

---

### ExecutionEngineService

Secure sandbox environment responsible for:

- executing AI-generated patches
- computing AST diffs
- measuring execution time and memory allocation

---

### SemanticMemoryService

Stores successful incident resolutions to allow future recall when similar stack traces appear.

---

### DataAgentService

Generates **production-ready Polars ETL pipelines** from raw JSON schemas.

---

# Swarm Agents

DevAll splits responsibilities across specialized agents to prevent hallucinations and enforce structured reasoning.

| Agent | Responsibility |
|------|---------------|
| LogAnalyzerAgent | Retrieves CI/CD logs from GitHub |
| RootCauseAgent | Identifies root causes using semantic memory |
| CodeFixAgent | Generates AST-based patches |
| ValidatorAgent | Executes CI pipeline validation |
| ReviewerAgent | Performs security review and opens Pull Request |

---

# API Documentation

## Webhook & Incident Management

| Endpoint | Method | Payload | Description |
|--------|--------|--------|-------------|
| `/api/webhook` | POST | GitHub `workflow_run` event | Ingress point for CI failures |
| `/api/incidents` | GET | None | Retrieves active incidents |
| `/api/execute/staged/{runId}` | POST | None | Executes swarm pipeline |

---

## Telemetry & Diagnostics

| Endpoint | Method | Payload | Description |
|--------|--------|--------|-------------|
| `/api/system/logs` | GET | None | SSE stream for kernel activity |
| `/api/execute/preview` | POST | `{ originalCode, newCode, pipelineType }` | Sandbox execution preview |

---

## Data Orchestration

| Endpoint | Method | Payload | Description |
|--------|--------|--------|-------------|
| `/api/data/generate-etl` | POST | `{ sourceFormat, sampleData, targetDestination }` | Generates Polars ETL script |

---

# Self-Healing Lifecycle

DevAll resolves incidents through a structured multi-stage workflow.

1. **Detection & Staging**  
   GitHub webhook registers the failure and stages the incident.

2. **Manual Approval**  
   Engineer approves execution from the UI or API.

3. **Root Cause Analysis**  
   Logs are analyzed by `LogAnalyzerAgent` and `RootCauseAgent`.

4. **Patch Generation**  
   `CodeFixAgent` synthesizes a patch.

5. **Validation Loop**  
   If validation fails, the orchestrator retries up to three iterations with feedback context.

6. **Security Review**  
   `ReviewerAgent` verifies the patch and creates a Pull Request.

7. **Knowledge Retention**  
   The successful resolution is stored in `SemanticMemoryService`.

---

# Demo

A demonstration video showing the system in action is available here:

**[Demo Video Link](https://youtu.be/CK3hXHAj8NU?si=FxDLm_1mZtxuHd_1)**

