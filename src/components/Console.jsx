import React, { useRef, useEffect } from "react";
import { Terminal as ConsoleIcon, MoreHorizontal, ArrowRight } from "lucide-react";

const MicrosoftLogo = () => (
    <div className="ms-logo-grid">
        <div className="ms-box bg-[#f25022]" />
        <div className="ms-box bg-[#7fbb00]" />
        <div className="ms-box bg-[#00a4ef]" />
        <div className="ms-box bg-[#ffb900]" />
    </div>
);

// esto es el componente de la terminal de logs
function Console({ logs }) {
    const consoleRef = useRef(null);

    useEffect(() => {
        if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }, [logs]);

    return (
        <div className="glass-devall flex-1 p-5 flex flex-col overflow-hidden border-white/5">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] flex items-center gap-2">
                    <ConsoleIcon size={14} /> System Terminal
                </span>
                <MoreHorizontal size={18} className="text-zinc-800" />
            </div>

            {/* esto es la lista de mensajes que se muestran en tiempo real */}
            <div ref={consoleRef} className="flex-1 overflow-auto p-4 flex flex-col gap-1.5 custom-scrollbar bg-black/40">
                {logs.map((l, i) => (
                    <div key={i} className="flex gap-4">
                        <span className="text-zinc-900 font-bold">[{l.t}]</span>
                        <span className={
                            l.type === 'sys' ? 'text-blue-500/80' :
                                l.type === 'error' ? 'text-red-500/80' :
                                    'text-zinc-600'
                        }>
                            &gt; {l.m}
                        </span>
                    </div>
                ))}
                <div className="animate-pulse text-zinc-800">_</div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5">
                        <ArrowRight size={20} className="text-zinc-500" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">DevAll Automated Hub</p>
                </div>
                <MicrosoftLogo />
            </div>
        </div>
    );
}

export default Console;