import React from "react";
import { Sparkles, Clock, Maximize2 } from "lucide-react";

// esto es el componente de los insights de la IA
function Insights({ agent, aiAnalysis }) {
    return (
        <div className="glass-devall p-5 flex flex-col gap-4 bg-gradient-to-br from-white/[0.04] to-black border-white/10">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Sparkles size={14} style={{ color: agent.color }} />  Insights
                </span>
                <button className="text-zinc-700 hover:text-white transition-colors">
                    <Maximize2 size={16} />
                </button>
            </div>

            <div className="min-h-[60px] text-sm text-zinc-400 leading-relaxed font-medium italic">
                {`"${aiAnalysis}"`}
            </div>

            <div className="flex justify-between items-center mt-4">
                <span className="text-[9px] text-zinc-700 font-black uppercase flex items-center gap-2">
                    <Clock size={12} /> Active
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color }} />
                    <span className="text-[9px] font-bold text-zinc-500">Secure Node</span>
                </div>
            </div>
        </div>
    );
}

export default Insights;
