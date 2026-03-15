import React from "react";
import { Code2, Settings, LogOut } from "lucide-react";

const MicrosoftLogo = () => (
    <div className="ms-logo-grid">
        <div className="ms-box bg-[#f25022]" />
        <div className="ms-box bg-[#7fbb00]" />
        <div className="ms-box bg-[#00a4ef]" />
        <div className="ms-box bg-[#ffb900]" />
    </div>
);

// esto es el componente de la barra lateral para navegar
function Sidebar({ agents, activeAgent, setActiveAgent, addLog }) {
    return (
        <aside className="w-64 border-r border-white/5 flex flex-col p-8 z-50 bg-black/40 backdrop-blur-2xl">
            <div className="flex flex-col gap-1 mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <MicrosoftLogo />
                    <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Partner Hub</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-2xl">
                        <Code2 size={22} className="text-black" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tighter text-white">DevAll</h1>
                </div>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-2">Fabric Multi-Agent Grid</p>
            </div>

            {/*  navegacion entre los diferentes agentes */}
            <nav className="flex flex-col gap-4 flex-1">
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-2 px-2">Pipeline Agents</span>
                {agents.map(agent => (
                    <button
                        key={agent.id}
                        onClick={() => {
                            setActiveAgent(agent.id);
                            addLog(`Switching to agent: ${agent.name}...`);
                        }}
                        className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${activeAgent === agent.id ? 'sidebar-btn-active' : 'hover:bg-white/5'}`}
                    >
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 shadow-inner"
                            style={{ backgroundColor: activeAgent === agent.id ? agent.color + '22' : 'transparent' }}
                        >
                            <agent.icon size={16} style={{ color: activeAgent === agent.id ? agent.color : '#52525b' }} />
                        </div>
                        <span className={`text-sm font-semibold tracking-tight ${activeAgent === agent.id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                            {agent.name}
                        </span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
                <div className="flex items-center gap-4 text-zinc-500 cursor-pointer hover:text-white transition-colors">
                    <Settings size={18} />
                    <span className="text-sm font-medium">Settings</span>
                </div>
                <div className="flex items-center gap-4 text-zinc-500 cursor-pointer hover:text-white transition-colors">
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Sign Out</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;