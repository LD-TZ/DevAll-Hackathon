import React from "react";
import { ChevronRight, Search, Bell } from "lucide-react";

const MicrosoftLogo = () => (
    <div className="ms-logo-grid">
        <div className="ms-box bg-[#f25022]" />
        <div className="ms-box bg-[#7fbb00]" />
        <div className="ms-box bg-[#00a4ef]" />
        <div className="ms-box bg-[#ffb900]" />
    </div>
);

// esto es el componente de la cabecera del dashboard
function Header({ agent }) {
    return (
        <header className="flex justify-between items-center mb-4">
            <div className="space-y-1">
                <div className="flex items-center gap-3 text-zinc-600 text-[9px] font-black uppercase tracking-[0.4em]">
                    <span>Hackathon</span>
                    <ChevronRight size={10} />
                    <span>Fabric Pipeline</span>
                    <ChevronRight size={10} />
                    <span style={{ color: agent.color }}>{agent.name}</span>
                </div>
                <h2 className="text-4xl font-bold tracking-tighter text-white">
                    Fabric <span style={{ color: agent.color }}>Engine</span>
                </h2>
                <p className="text-zinc-500 font-medium text-sm leading-tight italic">
                    {agent.desc}
                </p>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                        <MicrosoftLogo />
                        <span className="text-xs font-bold text-white tracking-tight">Microsoft</span>
                    </div>
                    <span className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Official Platform</span>
                </div>
                <div className="flex gap-4">
                    {/* esto es el buscador global para comandos o nodos */}
                    <button className="w-12 h-12 glass-devall flex items-center justify-center text-zinc-400 hover:text-white transition-all">
                        <Search size={20} />
                    </button>
                    <button className="w-12 h-12 glass-devall flex items-center justify-center text-zinc-400 hover:text-white transition-all relative">
                        <Bell size={20} />
                        <div className="absolute top-3.5 right-3.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-black" />
                    </button>
                    <div className="w-12 h-12 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                        <img src="https://api.dicebear.com/7.x/shapes/svg?seed=devall-hub" alt="Hub" />
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
