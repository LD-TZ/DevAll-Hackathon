import React from "react";
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Legend
} from "recharts";

const KPI = ({ label, value, color, trend }) => (
    <div className="flex flex-col gap-0.5 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
        <span className="text-lg font-bold font-mono" style={{ color }}>{value}</span>
        {trend && <span className="text-[9px] text-emerald-400 font-bold">{trend}</span>}
    </div>
);

const tooltipStyle = {
    contentStyle: {
        backgroundColor: "#0a0a0d",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        fontSize: 10,
        color: "#e4e4e7"
    },
    labelStyle: { color: "#71717a", fontWeight: 700 },
    cursor: { fill: "rgba(255,255,255,0.03)" }
};

// esto es el componente del dashboard analitico
function GraficBI({ agent }) {
    if (!agent || !agent.bi) return null;

    const { kpis, chartData } = agent.bi;

    return (
        <div className="px-4 pb-2 pt-2 border-b border-white/5 flex flex-col gap-2">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm bg-[#00a4ef]" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Analytics Dashboard</span>
                </div>
                <div className="flex gap-2">
                    {["1D", "1W", "1M"].map(t => (
                        <button key={t} className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${t === "1M" ? "bg-[#00a4ef]/20 text-[#00a4ef] border border-[#00a4ef]/30" : "text-zinc-700 hover:text-zinc-400"}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* esto es la fila de los KPIs principales */}
            <div className="grid grid-cols-4 gap-2">
                {kpis.map((kpi, idx) => (
                    <KPI key={idx} {...kpi} />
                ))}
            </div>

            {/* esto es la seccion de los graficos de barras y lineas */}
            <div className="grid grid-cols-2 gap-4">

                {/* Bar Chart */}
                <div>
                    <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest block mb-1">Monthly Flow (uv)</span>
                    <ResponsiveContainer width="100%" height={65}>
                        <BarChart data={chartData} barSize={14}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="name" stroke="#3f3f46" tick={{ fontSize: 9, fill: "#52525b" }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip {...tooltipStyle} />
                            <Bar dataKey="uv" fill="#00a4ef" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Line Chart */}
                <div>
                    <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest block mb-1">Trend Comparison</span>
                    <ResponsiveContainer width="100%" height={65}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="name" stroke="#3f3f46" tick={{ fontSize: 9, fill: "#52525b" }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip {...tooltipStyle} />
                            <Line type="monotone" dataKey="pv" stroke="#7fbb00" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="amt" stroke="#ffb900" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
}

export default GraficBI;