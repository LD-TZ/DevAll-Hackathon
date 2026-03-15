import React from "react";
import { Sparkles } from "lucide-react";
import GraficBI from "./GraficBI";

// esto es la funcion que renderiza el panel del agente
function AgentPanel({ agent, onAction, onLogs }) {
    return (
        <div className="col-span-8 h-full flex flex-col gap-3 overflow-hidden pr-2">
            <div className="flex items-center gap-4">
                <div className="bg-white/5 px-6 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: agent.color }} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Status: Online</span>
                </div>
                <button
                    onClick={onAction}
                    className="ml-auto glass-devall px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all flex items-center gap-2 border-white/10"
                >
                    {/* esto es el boton para abrir el inspector de la analitica */}
                    <Sparkles size={14} style={{ color: agent.color }} /> Function Analysis
                </button>
            </div>

            <div className="glass-devall flex-1 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent flex justify-between items-center">
                    <div>
                        {/* esto es la informacion del rol y nombre del agente */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Module Operations</span>
                            <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-zinc-500 font-bold uppercase tracking-widest">{agent.role}</span>
                        </div>
                        <h3 className="text-2xl font-bold mt-1 text-white">{agent.name} Pipeline</h3>
                        <p className="text-[10px] text-zinc-500 mt-1 italic">{agent.desc}</p>
                    </div>
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl"
                        style={{ backgroundColor: agent.color + '22', border: `1px solid ${agent.color}33` }}
                    >
                        <agent.icon size={24} style={{ color: agent.color }} />
                    </div>
                </div>

                {/* esto e el dashboard del BI que cambia por agente */}
                <GraficBI agent={agent} />

                <div className="p-4 flex flex-col gap-4 flex-1 overflow-hidden">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Active Flows</span>
                            <span className="text-2xl font-bold text-white">42</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Health Score</span>
                            <span className="text-2xl font-bold text-emerald-400">98%</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Throughput</span>
                            <span className="text-2xl font-bold text-white font-mono">1.8 Tb/s</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Operation in Progress</span>
                            <span className="text-xl font-bold font-mono text-white">92.4%</span>
                        </div>
                        <div className="liquid-progress-container">
                            <div className="liquid-fill-anim w-[92%]" style={{ backgroundColor: agent.color }} />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => onLogs(`Action executed on: ${agent.name}`)}
                            className="px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-white text-black hover:bg-zinc-200 transition-all"
                        >
                            Run Action
                        </button>
                        <button
                            onClick={() => onLogs(`Logs for ${agent.name} requested.`, "sys")}
                            className="px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest glass-devall border-white/10 text-zinc-400 hover:text-white transition-all"
                        >
                            View Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AgentPanel;