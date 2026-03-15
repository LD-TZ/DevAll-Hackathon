import type { LucideIcon } from "lucide-react";
import { Wrench, PlusCircle, Activity } from "lucide-react";

export interface KPI {
    label: string;
    value: string;
    color: string;
    trend?: string;
}

export interface ChartData {
    name: string;
    uv: number;
    pv: number;
    amt: number;
}

export interface BI {
    kpis: KPI[];
    chartData: ChartData[];
}

export interface Inspection {
    originalCode: string;
    suggestedCode: string;
    jsonResponse: any;
    transformedData: any[];
    sqlSchema: string;
    recommendations: { type: string; desc: string }[];
    metrics: { executionTime: string; payloadSize: string };
}

export interface Agent {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    desc: string;
    role: string;
    bi: BI;
    inspection: Inspection;
}

//    base de datos de los agentes del sistema son datos falso los e pa tu sabe, para tener la idea de como se veria el front(borrralo)
export const agents: Agent[] = [
    {
        /*configuracion del primer agente David */
        id: "agent1",
        name: "David",
        icon: Wrench,
        color: "#f25022",
        desc: "Pipeline Repair Specialist",
        role: "Maintenance & Recovery",
        bi: {
            kpis: [
                { label: "Fixed Issues", value: "24", color: "#00a4ef", trend: "↑ 4 this week" },
                { label: "Avg Repair Time", value: "14m", color: "#7fbb00", trend: "↓ 2m" },
                { label: "Critical Bugs", value: "0", color: "#f25022", trend: "Clean" },
                { label: "Uptime", value: "99.9%", color: "#ffb900" }
            ],
            chartData: [
                { name: "Ene", uv: 120, pv: 240, amt: 2400 },
                { name: "Feb", uv: 90, pv: 139, amt: 2210 },
                { name: "Mar", uv: 200, pv: 980, amt: 2290 },
                { name: "Abr", uv: 150, pv: 390, amt: 2000 },
                { name: "May", uv: 110, pv: 480, amt: 2181 },
                { name: "Jun", uv: 80, pv: 380, amt: 2500 },
                { name: "Jul", uv: 60, pv: 430, amt: 2100 },
            ]
        },
        inspection: {
            originalCode: `function executePipeline(node) {\n  return node.run();\n}`,
            suggestedCode: `function executePipeline(node) {\n+ try {\n    return node.run();\n+ } catch (err) {\n+   return DavidRepair.autoFix(node, err);\n+ }`,
            jsonResponse: {
                status: "REPAIR_REQUIRED",
                error_detected: "Unhandled Exception in Node 4",
                patch_available: true,
                severity: "High"
            },
            transformedData: [
                { error: "Timeout", count: 12, impact: "Medium" },
                { error: "NullPointer", count: 8, impact: "High" },
                { error: "DBConnection", count: 4, impact: "Critical" }
            ],
            sqlSchema: `CREATE TABLE repair_logs (\n  log_id UUID PRIMARY KEY,\n  fixed_node TEXT,\n  resolution_status TEXT\n);`,
            recommendations: [
                { type: "Patch", desc: "Deploy automated bug fix" },
                { type: "Rollback", desc: "Revert to v1.2.4" }
            ],
            metrics: { executionTime: "1.2s", payloadSize: "4.5 KB" }
        }
    },
    {
        id: "agent2",
        name: "Rauli",
        icon: PlusCircle,
        color: "#00a4ef",
        desc: "Pipeline Creation Architect",
        role: "Deployment & Infrastructure",
        bi: {
            kpis: [
                { label: "Pipelines Built", value: "156", color: "#00a4ef", trend: "↑ 12" },
                { label: "Success Rate", value: "98.4%", color: "#7fbb00", trend: "↑ 1.2%" },
                { label: "Active Flows", value: "42", color: "#f25022", trend: "↑ 5" },
                { label: "Deploy Time", value: "3.2m", color: "#ffb900" }
            ],
            chartData: [
                { name: "Ene", uv: 2500, pv: 4000, amt: 1200 },
                { name: "Feb", uv: 2100, pv: 3000, amt: 1500 },
                { name: "Mar", uv: 3200, pv: 2000, amt: 1800 },
                { name: "Abr", uv: 2900, pv: 2780, amt: 1400 },
                { name: "May", uv: 3400, pv: 1890, amt: 2200 },
                { name: "Jun", uv: 3100, pv: 2390, amt: 1900 },
                { name: "Jul", uv: 4000, pv: 3490, amt: 2300 },
            ]
        },
        inspection: {
            originalCode: `const newFlow = {};`,
            suggestedCode: `const newFlow = {\n+ name: "Fabric_Node_Alpha",\n+ region: "Azure-West",\n+ containers: 4,\n+ autoScale: true\n};`,
            jsonResponse: {
                status: "PROVISIONING",
                node_name: "Fabric_Node_Alpha",
                estimated_time: "45s",
                resources_allocated: ["CPU: 4", "RAM: 16GB"]
            },
            transformedData: [
                { region: "East", nodes: 4, health: "100%" },
                { region: "West", nodes: 8, health: "98%" },
                { region: "Central", nodes: 2, health: "100%" }
            ],
            sqlSchema: `CREATE TABLE pipeline_nodes (\n  node_id SERIAL PRIMARY KEY,\n  node_name VARCHAR(50),\n  active BOOLEAN\n);`,
            recommendations: [
                { type: "Scaling", desc: "Add +2 nodes for peak" },
                { type: "Config", desc: "Enable Edge distribution" }
            ],
            metrics: { executionTime: "0.24s", payloadSize: "2.1 KB" }
        }
    },
    {
        id: "agent3",
        name: "Carlos",
        icon: Activity,
        color: "#7fbb00",
        desc: "Real-time Monitoring Expert",
        role: "Observability & Security",
        bi: {
            kpis: [
                { label: "Threats Blocked", value: "1.4K", color: "#00a4ef", trend: "↑ 240" },
                { label: "Traffic Load", value: "85%", color: "#7fbb00", trend: "Normal" },
                { label: "Error Rate", value: "0.02%", color: "#f25022", trend: "↓ 0.01%" },
                { label: "API Latency", value: "12ms", color: "#ffb900" }
            ],
            chartData: [
                { name: "Ene", uv: 5000, pv: 2000, amt: 3000 },
                { name: "Feb", uv: 5500, pv: 2200, amt: 3200 },
                { name: "Mar", uv: 4800, pv: 2100, amt: 3100 },
                { name: "Abr", uv: 6000, pv: 2500, amt: 3500 },
                { name: "May", uv: 5800, pv: 2400, amt: 3400 },
                { name: "Jun", uv: 6200, pv: 2600, amt: 3600 },
                { name: "Jul", uv: 7000, pv: 3000, amt: 4000 },
            ]
        },
        inspection: {
            originalCode: `function handleRequest(req) {\n  process(req.body);\n}`,
            suggestedCode: `function handleRequest(req) {\n+ if (Security.isMalicious(req)) {\n+   return CarlosMonitor.quarantine(req.ip);\n+ }\n  process(req.body);\n}`,
            jsonResponse: {
                status: "SECURITY_ALERT",
                threat_level: "Critical",
                origin: "192.168.1.104",
                incident_id: "sec-404-b"
            },
            transformedData: [
                { type: "DDoS", blocked: 450, risk: "High" },
                { type: "SQLi", blocked: 12, risk: "Critical" },
                { type: "Scan", blocked: 2400, risk: "Low" }
            ],
            sqlSchema: `CREATE TABLE security_audit (\n  event_id BIGINT PRIMARY KEY,\n  threat_type TEXT,\n  detected_at TIMESTAMP\n);`,
            recommendations: [
                { type: "Firewall", desc: "Block origin CIDR range" },
                { type: "Audit", desc: "Run deep forensic scan" }
            ],
            metrics: { executionTime: "0.05s", payloadSize: "0.8 KB" }
        }
    },
]
