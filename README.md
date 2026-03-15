# DevAll: Agentic DevOps System

[![Hackathon](https://img.shields.io/badge/Hackathon-AI%20Dev%20Days-blue)](https://developer.microsoft.com/)
[![Azure](https://img.shields.io/badge/Cloud-Microsoft%20Azure-0078D4)](https://azure.microsoft.com/)
[![AI](https://img.shields.io/badge/AI-Azure%20OpenAI-5C2D91)](https://learn.microsoft.com/azure/ai-services/)
[![Framework](https://img.shields.io/badge/Framework-Spring%20Boot%203-6DB33F)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Prototype-orange)]()

## Overview

This project was developed as part of the **AI Dev Days Hackathon**, focusing on building a practical AI-powered solution that addresses real-world infrastructure and data engineering bottlenecks using Microsoft AI technologies.

**DevAll** is an autonomous Site Reliability Engineering (SRE) and Data Orchestration platform. It utilizes a multi-agent Large Language Model (LLM) swarm to monitor infrastructure, diagnose pipeline failures, synthesize code patches, and deploy validated fixes without human intervention. 

The repository contains the full implementation, API definitions, and supporting documentation required to understand and evaluate the project.

---

## Problem Statement

Organizations increasingly rely on complex CI/CD pipelines and large-scale data workflows. However, when these pipelines fail, resolving them requires manual log analysis, root-cause diagnosis, code patching, and re-testing. This results in high Mean Time To Recovery (MTTR), fragmented systems, and manual toil for SRE and DevOps teams.

DevAll addresses this challenge by providing an AI-driven, self-healing system capable of intercepting failure events, diagnosing logs against historical vector memory, and autonomously deploying validated fixes, keeping human engineers strictly in a supervisory "approval" role.

---

## Solution

The project implements a Reactive Micro-Kernel system that combines cloud services, AI capabilities, and developer tooling to provide a structured, autonomous workflow.

Key capabilities include:
- **Autonomous SRE Swarm:** A multi-agent array that reads logs, finds root causes, patches code, and validates fixes via CI/CD.
- **Enterprise ETL Forge:** Generates production-ready Polars data pipelines from raw JSON schemas synchronously.
- **Late Execution Orchestration:** Maintains an in-memory Job Registry allowing human operators to manually approve and trigger staged AI fixes.
- **Semantic Memory:** Records successful incident resolutions to a vector-like cache, allowing the system to recall and apply historical fixes to matching error signatures.

---

## Technologies Used

The project leverages the Microsoft AI ecosystem and modern backend frameworks:

- **Microsoft Semantic Kernel** (for LLM orchestration)
- **Azure OpenAI** (Inference services)
- **Spring Boot 3.2.x** (Java backend runtime)
- **Project Reactor** (Non-blocking asynchronous operations / WebFlux)
- **GitHub API & Webhooks** (CI/CD triggers and Git tree manipulation)
- **Python / Polars** (Target generation language for the ETL Forge)
- **Server-Sent Events (SSE)** (Real-time telemetry streaming)

---

## Architecture

The architecture is designed to demonstrate how Multi-Agent AI components interact securely within a modern application stack.

![Automated self-healing software architecture diagram](https://mermaid.live/edit#pako:eNqVVn9v4jgQ_SpWVtq_QgrhZ9nTSS1Q6G57RU33Tlo4nUyYgNVg5xynhTb97je2Q0hpe3cLAtnOmzfjmedxnp1QLMHpO1EsHsM1lYrcDeec4CfNFitJkzW5kIIr4EsyuwUaKjKk6XohqFz-aYH68_1ydslDtgReeY6rFcjlcIQYBRI52AOQ0d0VCShfLsS2groDuWGcxrMrjfkGkkNcLhY4jGXOj4I8p-G9iTFIJOMrci6EIjcyXEOqJFVC9nv1Xr3i6Gx6OTtbYbwsHOD-pIhjkJXnI75iHGajLYSZYoLbeQDygYVQwVV9zAKIownQGCOorlfgQ6qocTsrR285r2FTLCLjhuoYcUnI3VtoEIxm-CPBLlWwIVdiRQIlgW7-JVfBI5UbMrvOYsVqJgRydXVtlyvUyGUj1QPM_u4JpFmoYG4xzRakRwOapXAMGaDALESPLtj2GPA75mtpEWaoM_bGDzwUbuCBwePrQN7b42iLSsOgyawcafHhQ13MtEI9nszGTE2yBfkDFmsh7lPyWaujqpWnmwT4GQrmKZNA7ITsS1OotLojCIfnM_zHnZiKL2gKb4MdT0it9mve8PaeyaOQ9_ok_iUzTiLKYnSX62CsAQ6Mhe9hkekKUrI_dPkrHVr0dwtuemR6E9yREzBShpNUmy7foW155E6y1QpkasVwzGrh1TVj16YeuQAVrtGchpDmpXSswX5mwNMsjlPygyV6GaHjiQV9xL3wSCE-IzZiNJYfhGftyin5Ba0qB8g-Psztc1OgY0sTnRSbRKVFSfOy8h_vPcRa7LjCVYYhnmGipxRTkR90by3LqTEbA8dGqLCC051aC_5_PC09JNlsmEJ9Di7JFDtWXjk81uwwL7KdIgs5l5RjeT4boxStbd4_8gS4J9SKZGpHgpBybXibl4ewSFwxMyY6dtwL1hbX_86QruoBW79Bne2liGecnqyKHNRAxe-o8dzD2qBeiRLEOMoPzdMiy6nBD5C8qB52QIYX1dfg5rdqYt_aDNEHqExi7IMYcKM0Sbxkl-uIj4MfHZ-jRJpe9E7oF5XQiysuLy4UC7RjqwTEZnyvAxKLkMbx7kP45BDxNeht6m41ZFGUvgp6f2Mam0uP2PrgRcexKTGtN7w03iu_h_ivuFOrG7zLpFoAVdqLPa-lnb51NPs3r7hxUvS6VWT0YF8CFM3LMPZhhTFN0yFERJo3iYjFcf9TPWp0fepiCOIe-p-ai54fdYpp7ZEt1brvJ1s3FDHe4p-iKPpyRJbaK79g8-udRrdk8_2w3YafYaOsYGpAY9FalEy0125H3Z9h0tkoqLr6W1J1m_r7H1QVMmzlLhbXLatq0ld1p6XnWpm41YK6pd7dQw90dels0l5x7Pu0W_ZEt-xa7qGxuOXJp-yV_Xji7g-bazqszsAXx3VWki2dfkTjFFxng5ugeu48a-O5g71zA3Onj8MllfdzZ85f0Cih_IcQG6evZIZmUmSr9X6SJdhBYMgo3ucHBF6tIAci48rp-81O23A4_Wdn6_RrjUa34zWbjUa70-n2Os2O6-ycfvPU67Tafqt72mrXfb9Tb724zpNx63utdstvtjrN09Zpr93r9VwHlgyTem1fmUPBI7ZyXv4BN9eqFg)

### 1. Core Components Layer
* **AgenticController:** The primary REST interface handling GitHub webhooks, manual pipeline triggers, and Server-Sent Events (SSE) for kernel log streaming.
* **SelfHealingOrchestrator:** The central state machine managing the lifecycle of an incident. It coordinates the Swarm Array and maintains an in-memory Job Registry for late execution.
* **ExecutionEngineService:** A secure sandbox execution layer that evaluates AI-generated Python/Polars patches, computes AST diffs, and extracts performance metrics (execution time, memory allocation).
* **SemanticMemoryService:** An in-memory cache that records successful incident resolutions to apply historical fixes to matching error signatures.
* **DataAgentService:** A specialized generative agent configured to output strict, synchronous, and resilient Polars ETL scripts.

### 2. The Swarm Array (Agents)
* **LogAnalyzerAgent:** Interfaces with the `GitHubIntegrationClient` to extract workflow execution logs.
* **RootCauseAgent:** Correlates logs with the `SemanticMemoryService` to identify technical root causes.
* **CodeFixAgent:** Generates Abstract Syntax Tree (AST) patches and outputs structured JSON containing the corrected code.
* **ValidatorAgent:** Commits the patch to a temporary branch and polls the GitHub Actions CI/CD pipeline to verify build success.
* **ReviewerAgent:** Conducts a security audit of the proposed fix. Upon approval, it authors the Markdown description and opens a Pull Request.

---

## API Documentation

### Webhook & Incident Management
| Endpoint | Method | Payload | Description |
| :--- | :--- | :--- | :--- |
| `/api/webhook` | `POST` | GitHub `workflow_run` event | Ingress point for CI failures. Stages the workflow for late execution. |
| `/api/incidents` | `GET` | None | Retrieves all active and staged incidents from the registry. |
| `/api/execute/staged/{runId}` | `POST` | None | Triggers the autonomous swarm execution for a specific staged incident. |

### Telemetry & Diagnostics
| Endpoint | Method | Payload | Description |
| :--- | :--- | :--- | :--- |
| `/api/system/logs` | `GET` | None | Streaming endpoint (`text/event-stream`) for real-time kernel activity. |
| `/api/execute/preview` | `POST` | `{ originalCode, newCode, pipelineType }` | Executes an AI patch in the local sandbox and returns performance metrics. |

### Data Orchestration
| Endpoint | Method | Payload | Description |
| :--- | :--- | :--- | :--- |
| `/api/data/generate-etl` | `POST` | `{ sourceFormat, sampleData, targetDestination }` | Synthesizes a Polars Python script based on raw input schemas. |

---

## Process Documentation: Self-Healing Lifecycle

The system handles failures through a strict, multi-step orchestration process:

1. **Detection & Staging:** A failure in the main repository triggers the GitHub Webhook. The `SelfHealingOrchestrator` registers the incident as `STAGED`.
2. **Manual Approval (Late Execution):** An engineer triggers the execution via the REST API or UI.
3. **Root Cause Analysis:** The orchestrator dispatches the `LogAnalyzerAgent` to fetch traces, passing them to the `RootCauseAgent` for analysis against historical memory.
4. **Synthesis & Retry Loop:** The `CodeFixAgent` generates a patch. If validation fails, the orchestrator triggers a retry loop (up to 3 attempts) with feedback context.
5. **Validation & Review:** The `ValidatorAgent` runs the code through the CI pipeline. The `ReviewerAgent` performs a final security check and merges the code via Pull Request.
6. **Memory Storage:** The successful fix is committed to the `SemanticMemoryService` for future recall.

---

## Demo

A demonstration video showing the system in action is available here: 
