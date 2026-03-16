# DevAll - Advanced Multi-Agent DevOps Orchestrator

**DevAll** is a next-generation, high-fidelity command center designed for the orchestration, monitoring, and auditing of AI-driven DevOps agents. Built to integrate seamlessly into the **Microsoft enterprise ecosystem**, it leverages a sophisticated glassmorphism design language and a robust TypeScript-based data model to provide real-time observability across complex pipelines.

---

## Front-End Workflow & System Architecture

The DevAll architecture follows a highly decoupled, real-time workflow separated into three core pillars: Client Interaction, Front-End Logic, and Backend Services. The following diagram illustrates the precise telemetry and execution flow:

```mermaid
graph LR
    subgraph "1. USER INTERACTION (Client Browser)"
        UI[DevAll Dashboard] --> EV[Execution View Component]
        UI --> EIP[External Integration Panel]
        
        EV -.-> |1. Click Analyze| REST
        EV -.-> |6. Code View| VDB_Client
    end

    subgraph "2. FRONT-END SERVICES & LOGIC (Next.js /src)"
        REST[API Client - Axios]
        VDB_Client[API Client - Vector DB]
        FELogic[Front-end Agent Logic]
        State[State Management - Zustand/Context]
        WS[WebSocket Client]

        REST <--> FELogic
        VDB_Client <--> FELogic
        FELogic --> State
        State --> |2. Redux Update| WS
        
        EV <--> |5. Live Logs & BTL| WS
        EIP --> |7. Config / Repo URL| VDB_Client
    end

    subgraph "3. HACKATHON BACKEND SERVICES"
        Orch[Agent Orchestrator]
        BTL[Interactive BTL Service]
        Kernel[Live Kernel Terminal]
        Ext[External Integrations]

        REST --> |3. POST executeScenario| Orch
        WS <--> |4. Real-time Data| Orch
        WS <--> |9. BTL execCommand| BTL
        WS <--> Kernel
        VDB_Client <--> Ext
    end
