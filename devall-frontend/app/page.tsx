'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, CheckSquare, MessageSquare, Activity, Calendar, Settings, LogOut, Search, Bell, Plus, Code2, PlayCircle, X, Cpu, Server, FileTerminal, Network, Github, CheckCircle2 } from 'lucide-react';

interface ExecutionMetrics {
  executionTimeMs: number;
  status: string;
  memoryAllocatedMb: number;
}

interface ExecutionResponse {
  originalCode: string;
  correctedCode: string;
  diffDeltas: number;
  jsonOutput: string;
  sqlModeling?: string;
  metrics: ExecutionMetrics;
  aiRecommendation: string;
}

interface Incident {
  id: string;
  repo: string;
  error: string;
  time: string;
  status: string;
}

export default function DevAllDashboard() {
  // Navigation & UI State
  const [activePage, setActivePage] = useState<'dashboard' | 'incidents' | 'agents' | 'history' | 'settings'>('dashboard');
  const [activeTab, setActiveTab] = useState<'diff' | 'json' | 'sql' | 'chart'>('diff');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);

  // GitHub Settings State
  const [githubToken, setGithubToken] = useState('');
  const [isGithubConnecting, setIsGithubConnecting] = useState(false);
  const [isGithubConnected, setIsGithubConnected] = useState(false);

  // Execution State
  const [isExecuting, setIsExecuting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [executionData, setExecutionData] = useState<ExecutionResponse | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Dynamic Chart State
  const [activityData, setActivityData] = useState([
    { time: '10:00', ms: 120 }, { time: '10:15', ms: 150 }, 
    { time: '10:30', ms: 110 }, { time: '10:45', ms: 180 }, 
    { time: '11:00', ms: 140 }, { time: '11:15', ms: 130 }
  ]);

  const [sourceCode, setSourceCode] = useState("{\n  \"sensor_id\": 101,\n  \"temperature\": 45.2,\n  \"status\": \"active\"\n}");
  const [targetCode, setTargetCode] = useState("import polars as pl\nimport sys\nsys.stdout.reconfigure(encoding='utf-8')\n\n# Dynamic mapping executed securely via DevAll Agents...");

  useEffect(() => {
    const syncBackend = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/incidents');
        if (res.ok) {
          const data = await res.json();
          setIncidents(data);
        }
      } catch (e) {
        console.error("Backend Registry Sync Failed");
      }
    };
    syncBackend();
    const interval = setInterval(syncBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLogsModalOpen) return;
    const eventSource = new EventSource('http://localhost:8080/api/system/logs');
    eventSource.onmessage = (event) => {
      setSystemLogs(prev => [...prev.slice(-50), event.data]);
    };
    eventSource.onerror = () => eventSource.close();
    return () => eventSource.close();
  }, [isLogsModalOpen]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [systemLogs]);

  const approveAndExecute = async (runId: string) => {
    setIsExecuting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/execute/staged/${runId}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Execution trigger failed');
      const data: ExecutionResponse = await res.json();
      setExecutionData(data);
      setIsModalOpen(true);
      setActiveTab('diff');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExecuting(false);
    }
  };

  const triggerEtlGeneration = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:8080/api/data/generate-etl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceFormat: "JSON", sampleData: sourceCode, targetDestination: "Power BI" })
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const dataStr = await res.text();
      setTargetCode(dataStr);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerPreview = async (type: string) => {
    setIsExecuting(true);
    try {
      const res = await fetch('http://localhost:8080/api/execute/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalCode: sourceCode, newCode: targetCode, pipelineType: type })
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data: ExecutionResponse = await res.json();
      setExecutionData(data);
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setActivityData(prev => [...prev.slice(1), { time: timeStr, ms: data.metrics.executionTimeMs }]);
      
      setIsModalOpen(true);
      setActiveTab('json');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExecuting(false);
    }
  };

  const connectGitHub = () => {
    if (!githubToken) return;
    setIsGithubConnecting(true);
    setTimeout(() => {
      setIsGithubConnecting(false);
      setIsGithubConnected(true);
    }, 1500);
  };

  const renderDataTable = () => {
    if (!executionData?.jsonOutput) return null;
    try {
      const parsedData = JSON.parse(executionData.jsonOutput);
      const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
      if (dataArray.length === 0) return <span>No records</span>;
      const keys = Object.keys(dataArray[0]);
      
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-200">
            <thead className="bg-white/10 text-gray-300">
              <tr>{keys.map(k => <th key={k} className="px-4 py-3 font-semibold tracking-wider uppercase text-xs">{k}</th>)}</tr>
            </thead>
            <tbody>
              {dataArray.map((row, i) => (
                <tr key={i} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  {keys.map(k => <td key={k} className="px-4 py-3">{String(row[k])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } catch (e) {
      return <pre className="text-sm text-red-300 whitespace-pre-wrap">{executionData.jsonOutput}</pre>;
    }
  };

  const renderChart = () => {
    if (!executionData?.jsonOutput) return null;
    try {
      const parsedData = JSON.parse(executionData.jsonOutput);
      const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
      if (dataArray.length === 0) return null;
      const keys = Object.keys(dataArray[0]);
      const numericKey = keys.find(k => typeof dataArray[0][k] === 'number') || keys[1];
      const nameKey = keys[0];

      return (
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataArray}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey={nameKey} stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey={numericKey} stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    } catch (e) {
      return <span className="text-red-400">Invalid JSON payload for charting</span>;
    }
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-blue-500/20 text-blue-300 rounded-xl flex items-center justify-center border border-blue-400/30">
              <Code2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Interactive Execution Sandbox</h3>
              <p className="text-sm text-gray-300">Test Polars pipeline transformations instantly</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Raw Input Data / API</label>
              <textarea 
                value={sourceCode} onChange={(e) => setSourceCode(e.target.value)}
                placeholder="Paste API endpoint or JSON here..."
                className="w-full h-56 bg-black/60 border border-white/10 rounded-xl p-4 text-sm font-mono text-gray-200 focus:outline-none focus:border-blue-400/50 transition-colors resize-none shadow-inner"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Generated Script</label>
              <textarea 
                value={targetCode} onChange={(e) => setTargetCode(e.target.value)}
                placeholder="Generated code will appear here..."
                className="w-full h-56 bg-black/60 border border-white/10 rounded-xl p-4 text-sm font-mono text-green-300 focus:outline-none focus:border-green-400/50 transition-colors resize-none shadow-inner"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button onClick={triggerEtlGeneration} disabled={isGenerating || !sourceCode} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 font-bold shadow-lg shadow-purple-500/20 border border-purple-400/30">
              <Cpu size={16} /> {isGenerating ? 'Synthesizing...' : 'Generate AI Pipeline'}
            </button>
            <button onClick={() => triggerPreview('Data')} disabled={isExecuting || !targetCode} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 font-bold shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <PlayCircle size={16} /> {isExecuting ? 'Executing...' : 'Run Data Pipeline'}
            </button>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-6 shadow-2xl">
          <h3 className="font-bold text-lg mb-6 text-white">Execution Latency (ms)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                  <defs>
                  <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="ms" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorAct)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="col-span-1 space-y-6">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="font-bold text-white text-lg">Swarm Health</h3>
            <div className="h-3 w-3 bg-green-500 rounded-full shadow-[0_0_12px_#22c55e] animate-pulse"></div>
          </div>
          <div className="bg-black/40 rounded-xl p-5 text-sm text-gray-300 border border-white/5 relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">Micro-Agents</span>
              <span className="font-mono text-blue-300 font-bold bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">5 / 5 Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">Vector Memory</span>
              <span className="font-mono text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium">GitHub Status</span>
              {isGithubConnected ? (
                <span className="font-mono text-purple-300 font-bold bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20">Connected</span>
              ) : (
                <span className="font-mono text-yellow-400 font-bold bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">Offline</span>
              )}
            </div>
          </div>
        </div>

        <button onClick={() => setIsMcpModalOpen(true)} className="w-full bg-black/30 hover:bg-black/50 backdrop-blur-2xl border border-white/10 hover:border-blue-400/50 rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center h-48 transition-all group shadow-2xl border-dashed">
          <div className="h-16 w-16 bg-white/5 group-hover:bg-blue-500/20 rounded-full flex items-center justify-center mb-4 transition-colors shadow-inner">
            <Network className="text-gray-400 group-hover:text-blue-300" size={28} />
          </div>
          <p className="text-sm text-gray-200 font-bold tracking-wide">Connect MCP Server</p>
          <p className="text-xs text-gray-500 mt-2">Integrate external tools</p>
        </button>
      </div>
    </div>
  );

  const renderIncidents = () => (
    <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-8 shadow-2xl min-h-[500px]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Active Incidents</h2>
        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors">Filter: All</button>
      </div>
      <div className="space-y-4">
        {incidents.map((inc, i) => (
          <div key={i} className="p-5 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center hover:bg-white/10 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${inc.status.includes('RESOLVED') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {inc.status.includes('RESOLVED') ? <CheckCircle2 size={20} /> : <Activity size={20} />}
              </div>
              <div>
                <h4 className="text-gray-100 font-mono text-sm mb-1 font-bold group-hover:text-blue-300 transition-colors">{inc.error}</h4>
                <p className="text-gray-400 text-xs">Repo: <span className="text-gray-300">{inc.repo}</span> • {inc.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-4 py-1.5 rounded-lg border font-bold tracking-wide ${inc.status.includes('RESOLVED') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                {inc.status}
              </span>
              {inc.status === 'STAGED' && (
                <button 
                  onClick={() => approveAndExecute(inc.id)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all"
                >
                  EXECUTE
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAgents = () => (
    <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-8 shadow-2xl min-h-[500px]">
      <h2 className="text-3xl font-bold mb-8 text-white">Agent Swarm Array</h2>
      <div className="grid grid-cols-2 gap-6">
        {[
          { name: 'LogAnalyzerAgent', desc: 'Monitors GitHub Webhooks for workflow failures.' },
          { name: 'RootCauseAgent', desc: 'Analyzes traces against Semantic Memory vectors.' },
          { name: 'CodeFixAgent', desc: 'Synthesizes AST patches and new pipeline logic.' },
          { name: 'ValidatorAgent', desc: 'Executes ephemeral actions to verify patches.' },
          { name: 'ReviewerAgent', desc: 'Performs security checks and drafts PRs.' }
        ].map((agent) => (
          <div key={agent.name} className="p-6 bg-black/40 border border-white/5 rounded-2xl flex items-start gap-5 hover:border-blue-500/30 transition-all group">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 group-hover:scale-110 transition-transform">
              <Server size={24} />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">{agent.name}</h4>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">{agent.desc}</p>
              <p className="text-green-400 text-xs font-bold tracking-wide flex items-center gap-2 mt-3 uppercase"><span className="h-2 w-2 bg-green-500 rounded-full inline-block animate-pulse"></span> Online / Ready</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-8 shadow-2xl min-h-[500px] flex flex-col items-center justify-center text-center">
      <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
        <Code2 size={40} className="text-gray-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Semantic Memory is Empty</h2>
      <p className="text-gray-400 max-w-md mx-auto">The Vector Store has not yet recorded any successful autonomous resolutions. Trigger a GitHub Action failure to build history.</p>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-8 shadow-2xl min-h-[500px]">
      <h2 className="text-3xl font-bold mb-2 text-white">System Integrations</h2>
      <p className="text-gray-400 mb-8">Securely manage credentials and external API connections.</p>
      
      <div className="max-w-2xl bg-black/50 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Github className="text-white" size={24} />
          <h3 className="text-xl font-bold text-white">GitHub Connection</h3>
        </div>
        
        {isGithubConnected ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 flex items-center gap-4">
            <CheckCircle2 className="text-green-400" size={24} />
            <div>
              <p className="text-green-400 font-bold text-sm">Successfully Connected to GitHub</p>
              <p className="text-green-400/70 text-xs mt-1">Webhooks are active and listening for repository events.</p>
            </div>
            <button onClick={() => setIsGithubConnected(false)} className="ml-auto px-4 py-2 bg-black/40 hover:bg-black/60 text-gray-300 text-xs font-bold rounded-lg transition-colors border border-white/10">Disconnect</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Personal Access Token (Classic or Fine-Grained)</label>
              <input 
                type="password" 
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" 
                className="w-full bg-black/60 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 outline-none transition-all" 
              />
              <p className="text-[10px] text-gray-500 mt-2">Requires 'repo' and 'workflow' scopes to read logs and push PRs.</p>
            </div>
            <button 
              onClick={connectGitHub} 
              disabled={!githubToken || isGithubConnecting}
              className="w-full py-3.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <Github size={18} /> {isGithubConnecting ? 'Authenticating...' : 'Connect GitHub Account'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center bg-fixed text-gray-100 p-4 md:p-8 font-sans overflow-hidden relative">
      <div className="absolute inset-0 bg-black/60 pointer-events-none backdrop-blur-[2px]"></div>
      
      <div className="max-w-7xl mx-auto h-[90vh] bg-[#020617]/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 flex overflow-hidden shadow-2xl relative z-10">
        
        {/* SIDEBAR */}
        <div className="w-64 bg-black/20 border-r border-white/5 flex flex-col justify-between py-8 z-20">
          <div>
            <div className="px-8 mb-12 flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.8)] border border-blue-400/50">
                <Activity size={20} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-wide text-white drop-shadow-md">DevAll</span>
            </div>
            
            <nav className="space-y-2 px-4 font-medium">
              <div onClick={() => setActivePage('dashboard')} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${activePage === 'dashboard' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30 shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <LayoutDashboard size={20} /> Dashboard
              </div>
              <div onClick={() => setActivePage('incidents')} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${activePage === 'incidents' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30 shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <CheckSquare size={20} /> Incidents
              </div>
              <div onClick={() => setActivePage('agents')} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${activePage === 'agents' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30 shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <MessageSquare size={20} /> Agents
              </div>
              <div onClick={() => setActivePage('history')} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${activePage === 'history' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30 shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <Calendar size={20} /> History
              </div>
            </nav>
          </div>
          
          <div className="px-4 space-y-2 font-medium">
            <div onClick={() => setActivePage('settings')} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${activePage === 'settings' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30 shadow-inner' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <Settings size={20} /> Settings
            </div>
            <div className="flex items-center gap-4 px-4 py-3.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl cursor-pointer transition-colors">
              <LogOut size={20} /> Log out
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-20 bg-gradient-to-br from-white/5 to-transparent">
          <header className="h-24 flex items-center justify-between px-10 border-b border-white/5">
            <div className="flex items-center gap-3 text-sm text-gray-400 font-medium tracking-wide">
              <span>Home</span> <span className="text-gray-600">/</span> <span className="text-gray-100 capitalize">{activePage}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex gap-5 text-gray-300">
                <Search size={20} className="hover:text-white cursor-pointer transition-colors" />
                <Bell size={20} className="hover:text-white cursor-pointer transition-colors" />
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.4)] border-2 border-white/20"></div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-10">
            
            {/* Header dynamically updates based on page */}
            {activePage === 'dashboard' && (
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-sm tracking-tight">Orchestrator</h1>
                  <p className="text-gray-300 font-medium">SRE resolution and data modeling</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsLogsModalOpen(true)} className="px-5 py-3 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/30 rounded-xl text-sm font-bold transition-all backdrop-blur-md shadow-lg flex items-center gap-2 text-gray-200">
                    <FileTerminal size={18} /> Review Logs
                  </button>
                  <button onClick={() => {setSourceCode(""); setTargetCode("");}} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 border border-blue-400 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all flex items-center gap-2 text-white">
                    <Plus size={18} /> New Workflow
                  </button>
                </div>
              </div>
            )}

            {activePage === 'dashboard' && renderDashboard()}
            {activePage === 'incidents' && renderIncidents()}
            {activePage === 'agents' && renderAgents()}
            {activePage === 'history' && renderHistory()}
            {activePage === 'settings' && renderSettings()}

          </main>
        </div>
      </div>

      {/* EXECUTION PREVIEW MODAL */}
      {isModalOpen && executionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-[#0f172a]/95 backdrop-blur-3xl border border-white/20 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-8">
                <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-3"><Activity className="text-blue-400"/> AI Execution Preview</h2>
                <div className="flex bg-black/60 rounded-xl p-1.5 border border-white/5">
                  {(['diff', 'json', 'sql', 'chart'] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-colors bg-black/40 border border-white/5">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-8 bg-black/20">
              {activeTab === 'diff' && (
                <div className="grid grid-cols-2 gap-6 h-full">
                  <div className="flex flex-col h-full border border-red-500/30 rounded-2xl overflow-hidden bg-black/60 shadow-inner">
                    <div className="bg-red-500/10 border-b border-red-500/20 px-5 py-3 text-xs font-bold text-red-400 uppercase tracking-widest">Original Source</div>
                    <pre className="p-5 overflow-auto flex-1 text-sm font-mono text-gray-300">{executionData.originalCode}</pre>
                  </div>
                  <div className="flex flex-col h-full border border-green-500/30 rounded-2xl overflow-hidden bg-black/60 shadow-inner">
                    <div className="bg-green-500/10 border-b border-green-500/20 px-5 py-3 text-xs font-bold text-green-400 uppercase tracking-widest">DevAll Synthesized Code</div>
                    <pre className="p-5 overflow-auto flex-1 text-sm font-mono text-green-300">{executionData.correctedCode}</pre>
                  </div>
                </div>
              )}
              {activeTab === 'json' && (
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/60 h-full flex flex-col shadow-inner">
                  <div className="bg-white/5 border-b border-white/10 px-5 py-3 text-xs font-bold text-gray-200 uppercase tracking-widest">Transformed Data </div>
                  <div className="p-2 overflow-auto flex-1">{renderDataTable()}</div>
                </div>
              )}
              {activeTab === 'sql' && (
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/60 h-full flex flex-col shadow-inner">
                  <div className="bg-white/5 border-b border-white/10 px-5 py-3 text-xs font-bold text-blue-300 uppercase tracking-widest">SQL Pipeline Modeling</div>
                  <pre className="p-5 text-sm font-mono text-blue-300 whitespace-pre-wrap overflow-auto flex-1">{executionData.sqlModeling || '-- No SQL generated for this execution type --'}</pre>
                </div>
              )}
              {activeTab === 'chart' && (
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/60 h-full flex flex-col shadow-inner">
                  <div className="bg-white/5 border-b border-white/10 px-5 py-3 text-xs font-bold text-purple-300 uppercase tracking-widest">Power BI Endpoint Simulation</div>
                  <div className="p-8 flex-1 flex flex-col">
                    <p className="text-sm text-gray-400 mb-6 font-medium">Render of the JSON data payload.</p>
                    {renderChart()}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-white/10 bg-black/60 flex justify-between items-center text-sm backdrop-blur-2xl">
              <div className="flex items-center gap-8 font-mono text-sm bg-black/40 px-6 py-2.5 rounded-xl border border-white/5">
                <span className="text-gray-300 font-bold uppercase tracking-wider">Status: <span className={executionData.metrics.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>{executionData.metrics.status}</span></span>
                <span className="text-gray-300 font-bold uppercase tracking-wider">Time: <span className="text-blue-400">{executionData.metrics.executionTimeMs}ms</span></span>
                <span className="text-gray-300 font-bold uppercase tracking-wider">Memory: <span className="text-purple-400">{executionData.metrics.memoryAllocatedMb}MB</span></span>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 font-bold tracking-wide">Discard</button>
                <button onClick={() => setIsModalOpen(false)} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all border border-blue-400">Approve & Merge</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MCP INTEGRATION MODAL */}
      {isMcpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-[#0f172a]/95 backdrop-blur-3xl border border-white/20 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setIsMcpModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-white bg-black/20 p-2 rounded-xl"><X size={20}/></button>
            <div className="h-16 w-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
              <Network className="text-blue-400" size={32}/>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Connect MCP Server</h2>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">Integrate a new Model Context Protocol tool securely into the Swarm logic.</p>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Server Endpoint URL</label>
                <input type="text" placeholder="https://mcp.yourdomain.com/v1" className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 outline-none transition-all shadow-inner" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">API Key / Auth Token</label>
                <input type="password" placeholder="sk-..." className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 outline-none transition-all shadow-inner" />
              </div>
              <button onClick={() => setIsMcpModalOpen(false)} className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all border border-blue-400 text-lg">Connect Server</button>
            </div>
          </div>
        </div>
      )}

      {/* LOGS MODAL (LIVE STREAMING) */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-black/90 backdrop-blur-3xl border border-white/20 rounded-2xl w-full max-w-4xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            <div className="flex justify-between items-center p-5 border-b border-white/10 bg-gray-900/50">
              <h2 className="text-lg font-bold flex items-center gap-3 text-white"><FileTerminal className="text-gray-400"/> System Activity Logs</h2>
              <button onClick={() => setIsLogsModalOpen(false)} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg"><X size={20}/></button>
            </div>
            <div className="p-8 font-mono text-sm text-green-400 h-[32rem] overflow-y-auto space-y-3 shadow-inner">
              <p className="text-gray-500">{"// Streaming live from DevAll Kernel Cluster..."}</p>
              {systemLogs.map((log, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="text-gray-700 w-12 select-none">[{idx}]</span>
                  <span className={log.includes('[ERROR]') ? 'text-red-400' : log.includes('[WARN]') ? 'text-yellow-400' : 'text-green-400'}>{log}</span>
                </div>
              ))}
              {systemLogs.length === 0 && <p className="animate-pulse text-blue-400">_ Waiting for system events...</p>}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}