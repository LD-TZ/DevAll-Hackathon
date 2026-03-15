import React, { useState } from "react";
import {
    X,
    Code2,
    Database,
    Table,
    Activity,
    Layout,
    Copy,
    ChevronRight,
    Zap,
    Box,
    Terminal
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid
} from "recharts";

const TabButton = ({ active, icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${active
            ? "bg-white/10 text-white border border-white/10 shadow-lg"
            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
    >
        <Icon size={16} />
        <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </button>
);

const CodeBlock = ({ code, title, color }) => (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{title}</span>
            <button className="text-zinc-600 hover:text-white transition-colors">
                <Copy size={14} />
            </button>
        </div>
        <div className="glass-devall bg-black/40 p-4 font-mono text-xs overflow-auto custom-scrollbar h-[350px] border-white/5">
            <pre className="text-zinc-300">
                {code.split("\n").map((line, i) => (
                    <div key={i} className="flex gap-4 group">
                        <span className="w-8 text-zinc-700 text-right select-none">{i + 1}</span>
                        <span className={line.startsWith("+") ? "text-emerald-400" : line.startsWith("-") ? "text-rose-400" : ""}>
                            {line}
                        </span>
                    </div>
                ))}
            </pre>
        </div>
    </div>
);

// esto es el componente principal del modal del inspector
const InspectorModal = ({ isOpen, onClose, data }) => {
    const [activeTab, setActiveTab] = useState("code");

    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass-devall w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl border-white/10">

                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                            <Activity size={24} className="text-[#00a4ef]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Agent Output Inspector</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Pipeline Node</span>
                                <ChevronRight size={10} className="text-zinc-700" />
                                <span className="text-[10px] font-bold text-[#00a4ef] uppercase tracking-widest">{data.agentName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Exec Time</span>
                                <span className="text-xs font-mono font-bold text-emerald-400">{data.metrics?.executionTime || "---"}</span>
                            </div>
                            <div className="w-px h-6 bg-white/10" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Payload</span>
                                <span className="text-xs font-mono font-bold text-[#00a4ef]">{data.metrics?.payloadSize || "---"}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* esto es la barra de pestañas para navegar entre vistas */}
                <div className="px-6 py-4 flex gap-2 border-b border-white/5 bg-black/20">
                    <TabButton
                        active={activeTab === "code"}
                        onClick={() => setActiveTab("code")}
                        icon={Code2}
                        label="Code Diff"
                    />
                    <TabButton
                        active={activeTab === "json"}
                        onClick={() => setActiveTab("json")}
                        icon={Box}
                        label="Raw JSON"
                    />
                    <TabButton
                        active={activeTab === "table"}
                        onClick={() => setActiveTab("table")}
                        icon={Table}
                        label="Data View"
                    />
                    <TabButton
                        active={activeTab === "integration"}
                        onClick={() => setActiveTab("integration")}
                        icon={Database}
                        label="Integrations"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-black/40">

                    {activeTab === "code" && (
                        /* esto es el comparador de codigo side by side */
                        <div className="flex gap-6 h-full animate-in slide-in-from-bottom-2 duration-500">
                            <CodeBlock title="Original Source" code={data.originalCode || "// No data available"} />
                            <div className="flex items-center text-zinc-800">
                                <ChevronRight size={32} />
                            </div>
                            <CodeBlock
                                title="Sugerencia / Refactor"
                                code={data.suggestedCode || "// No data available"}
                                color="#00a4ef"
                            />
                        </div>
                    )}

                    {activeTab === "json" && (
                        <div className="h-full glass-devall bg-black/60 p-6 font-mono text-xs text-orange-200/80 overflow-auto custom-scrollbar border-white/5">
                            <pre>{JSON.stringify(data.jsonResponse, null, 2)}</pre>
                        </div>
                    )}

                    {activeTab === "table" && (
                        <div className="glass-devall overflow-hidden border-white/5 bg-black/20">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-white/5 text-zinc-500 font-black uppercase tracking-widest">
                                    <tr>
                                        {data.transformedData?.[0] && Object.keys(data.transformedData[0]).map(key => (
                                            <th key={key} className="px-6 py-4">{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {data.transformedData?.map((row, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                            {Object.values(row).map((val, j) => (
                                                <td key={j} className="px-6 py-4 text-zinc-300 font-mono">
                                                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "integration" && (
                        /* esto es la vista de integraciones con el grafico Power BI */
                        <div className="grid grid-cols-2 gap-6 h-full">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Database size={16} className="text-zinc-500" />
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">SQL Schema / Modeling</span>
                                </div>
                                <div className="glass-devall bg-black/40 p-5 font-mono text-xs text-blue-300/70 border-white/5 flex-1">
                                    <pre>{data.sqlSchema || "-- No schema defined for this agent"}</pre>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Layout size={16} className="text-zinc-500" />
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Power BI Mock Preview</span>
                                </div>
                                <div className="glass-devall bg-black/40 p-5 border-white/5 flex-1 flex flex-col items-center justify-center">
                                    {data.transformedData && data.transformedData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={240}>
                                            <BarChart data={data.transformedData.slice(0, 5)} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey={Object.keys(data.transformedData[0])[0]} stroke="#3f3f46" tick={{ fontSize: 9 }} />
                                                <YAxis stroke="#3f3f46" tick={{ fontSize: 9 }} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                                                />
                                                <Bar
                                                    dataKey={Object.keys(data.transformedData[0]).find(k => typeof data.transformedData[0][k] === 'number') || "value"}
                                                    fill="#00a4ef"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">No data for visualization</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-black/40 flex justify-between items-center text-[10px]">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-zinc-500 font-bold uppercase tracking-widest">Endpoint Active</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-700">
                                <Zap size={12} />
                                <span className="font-bold uppercase tracking-widest">Real-time Sync Enabled</span>
                            </div>
                        </div>
                        {data.recommendations && (
                            /* esto es la seccion de recomendaciones que se autoplementan */
                            <div className="flex flex-col gap-1 mt-1 border-l-2 border-[#00a4ef] pl-3 py-1 bg-[#00a4ef]/05">
                                <span className="text-[8px] font-black text-[#00a4ef] uppercase tracking-widest">IA Auto-Append Recommendations:</span>
                                <div className="flex gap-2">
                                    {data.recommendations.map((rec, i) => (
                                        <div key={i} className="flex items-center gap-2 text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                            <Terminal size={10} className="text-[#ffb900]" />
                                            <span>{rec.type}: {rec.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="text-zinc-600 font-mono italic self-end">
                        DevAll Advanced Intelligence Inspection Layer v1.0.4
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InspectorModal;
