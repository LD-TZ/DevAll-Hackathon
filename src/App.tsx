import React, { useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AgentPanel from "./components/AgentPanel";
import Insights from "./components/Insights";
import Console from "./components/Console";
import InspectorModal from "./components/InspectorModal";


import { agents } from "./data/agents";

const apiKey = "";
const MODEL_NAME = "gemini-2.5-flash-preview-04-17";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --ms-red: #f25022;
    --ms-green: #7fbb00;
    --ms-blue: #00a4ef;
    --ms-yellow: #ffb900;
    --bg-black: #000000;
    --glass-border: rgba(255, 255, 255, 0.08);
  }

  body, html, #root {
    background-color: var(--bg-black) !important;
    color: #e6e6e6;
    font-family: 'Inter', sans-serif;
    margin: 0;
    height: 100%;
    overflow: hidden;
  }

  .liquid-bg {
    position: fixed; inset: 0; z-index: 0;
    overflow: hidden; background: #000; pointer-events: none;
  }

  .ms-blob {
    position: absolute; width: 500px; height: 500px;
    filter: blur(100px); border-radius: 50%; opacity: 0.12;
    animation: float-bg 25s infinite alternate ease-in-out;
  }

  @keyframes float-bg {
    0%   { transform: translate(-10%, -10%) scale(1); }
    100% { transform: translate(40%, 30%) scale(1.3); }
  }

  .glass-devall {
    background: rgba(15, 15, 18, 0.7);
    backdrop-filter: blur(40px) saturate(180%) contrast(110%);
    -webkit-backdrop-filter: blur(40px) saturate(180%) contrast(110%);
    border: 1px solid var(--glass-border);
    border-radius: 24px; position: relative; overflow: hidden;
  }

  .sidebar-btn-active {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.03);
  }

  .liquid-progress-container {
    height: 6px; background: rgba(255,255,255,0.05);
    border-radius: 10px; overflow: hidden; position: relative;
  }

  .liquid-fill-anim {
    height: 100%; position: relative; transition: width 1s ease-in-out;
  }

  .liquid-fill-anim::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: wave-move 2s infinite linear;
  }

  @keyframes wave-move {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .custom-scrollbar::-webkit-scrollbar { width: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

  .ms-logo-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 2px; }
  .ms-box { width: 8px; height: 8px; }
`;

// es el componente principal de la aplicacion
function App() {
  // esto es el estado de la aplicacion
  const [activeAgentId, setActiveAgentId] = useState("agent1");
  const [logs, setLogs] = useState([{ t: "21:54", m: "DevAll Pipeline Initialized.", type: "sys" }]);
  const [aiAnalysis] = useState("DevAll: Multi-agent pipeline based on active technical functions.");

  // estado del modal del inspector
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectionData, setInspectionData] = useState(null);

  const currentAgent = agents.find(a => a.id === activeAgentId);

  const addLog = (m, type = "info") => {
    const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs(prev => [...prev, { t, m, type }]);
  };

  // la funcion que maneja el analisis del agente
  const handleAnalysis = () => {
    if (!currentAgent || !currentAgent.inspection) return;

    setInspectionData({
      agentName: currentAgent.name,
      ...currentAgent.inspection
    });
    setIsInspectorOpen(true);
    addLog(`Analyzing ${currentAgent.name} output in Inspector...`, "sys");
  };

  return (
    <div className="min-h-screen w-full flex bg-black relative selection:bg-white/20">
      <style>{styles}</style>

      <div className="liquid-bg">
        <div className="ms-blob bg-[#f25022]" style={{ top: "0%", left: "0%" }} />
        <div className="ms-blob bg-[#7fbb00]" style={{ bottom: "0%", right: "0%", animationDelay: "-5s" }} />
        <div className="ms-blob bg-[#00a4ef]" style={{ top: "50%", left: "50%", opacity: 0.08 }} />
      </div>

      <Sidebar
        agents={agents}
        activeAgent={activeAgentId}
        setActiveAgent={setActiveAgentId}
        addLog={addLog}
      />

      <div className="flex-1 flex flex-col p-6 overflow-hidden relative z-10">
        <Header agent={currentAgent} />

        <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden">

          <AgentPanel
            agent={currentAgent}
            onAction={handleAnalysis}
            onLogs={addLog}
          />

          <aside className="col-span-4 flex flex-col gap-3 h-full overflow-hidden">
            <Insights
              agent={currentAgent}
              aiAnalysis={aiAnalysis}
            />
            <Console logs={logs} />
          </aside>

        </div>
      </div>

      <InspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        data={inspectionData}
      />
    </div>
  );
}


export default App;