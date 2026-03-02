import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Activity, 
  Lock, 
  Cpu, 
  HardDrive, 
  Zap,
  RefreshCw,
  AlertTriangle,
  FileSearch,
  Terminal,
  ChevronRight,
  Settings,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { analyzeThreat } from './services/securityService';

// --- Components ---

const StatCard = ({ icon: Icon, label, value, colorClass }: { icon: any, label: string, value: string, colorClass: string }) => (
  <div className="bg-security-card border border-white/5 p-4 rounded-xl flex items-center gap-4">
    <div className={cn("p-3 rounded-lg bg-opacity-10", colorClass.replace('text-', 'bg-'))}>
      <Icon className={cn("w-5 h-5", colorClass)} />
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-xl font-bold text-white font-mono">{value}</p>
    </div>
  </div>
);

const ThreatLevelIndicator = ({ level }: { level: 'Safe' | 'Warning' | 'Danger' }) => {
  const colors = {
    Safe: 'text-security-success',
    Warning: 'text-security-warning',
    Danger: 'text-security-danger'
  };
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full animate-pulse", 
        level === 'Safe' ? 'bg-security-success' : 
        level === 'Warning' ? 'bg-security-warning' : 'bg-security-danger'
      )} />
      <span className={cn("text-xs font-bold uppercase tracking-tighter", colors[level])}>
        System {level}
      </span>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [threatsFound, setThreatsFound] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputText, setInputText] = useState('');

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setThreatsFound(0);
  };

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            return 100;
          }
          // Randomly increment
          return prev + Math.random() * 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeThreat(inputText);
    setAnalysisResult(result || "No analysis available.");
    setIsAnalyzing(false);
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result as string;
      setInputText(text);
      // Automatically trigger analysis for small files
      if (text.length < 5000) {
        setIsAnalyzing(true);
        const result = await analyzeThreat(text);
        setAnalysisResult(result || "No analysis available.");
        setIsAnalyzing(false);
      }
    };
    reader.readAsText(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: false,
    noClick: true
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-bottom border-white/5 bg-security-bg/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-security-accent/10 rounded-lg flex items-center justify-center border border-security-accent/20">
            <Shield className="text-security-accent w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold tracking-tight leading-none">AEGIS AI</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Security Suite v4.0</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <ThreatLevelIndicator level={threatsFound > 0 ? 'Danger' : 'Safe'} />
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-security-accent to-blue-600 border border-white/20" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        
        {/* Left Column: System Overview & Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Main Scanner Widget */}
          <div className="bg-security-card rounded-2xl border border-white/5 p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
              <motion.div 
                className="h-full bg-security-accent scanner-glow"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
              />
            </div>

            <div className="relative mb-6">
              <div className={cn(
                "w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                isScanning ? "border-security-accent animate-pulse" : "border-white/10"
              )}>
                {isScanning ? (
                  <RefreshCw className="w-12 h-12 text-security-accent animate-spin" />
                ) : (
                  <ShieldCheck className="w-12 h-12 text-security-success" />
                )}
              </div>
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-mono font-bold text-security-accent">
                    {Math.round(scanProgress)}%
                  </span>
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              {isScanning ? "Scanning System..." : "System Protected"}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {isScanning 
                ? "Analyzing files and network traffic for anomalies." 
                : "Last deep scan performed 2 hours ago. No threats detected."}
            </p>

            <button 
              onClick={startScan}
              disabled={isScanning}
              className={cn(
                "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                isScanning 
                  ? "bg-white/5 text-slate-500 cursor-not-allowed" 
                  : "bg-security-accent text-security-bg hover:brightness-110 active:scale-95 shadow-lg shadow-security-accent/20"
              )}
            >
              <Zap className="w-4 h-4" />
              {isScanning ? "SCAN IN PROGRESS" : "START FULL SCAN"}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4">
            <StatCard 
              icon={Activity} 
              label="Network Traffic" 
              value="1.2 GB/s" 
              colorClass="text-security-accent" 
            />
            <StatCard 
              icon={AlertTriangle} 
              label="Blocked Threats" 
              value="24" 
              colorClass="text-security-danger" 
            />
            <StatCard 
              icon={Lock} 
              label="Encrypted Files" 
              value="14,202" 
              colorClass="text-security-success" 
            />
          </div>

          {/* System Health */}
          <div className="bg-security-card rounded-2xl border border-white/5 p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-security-accent" />
              SYSTEM RESOURCES
            </h3>
            <div className="space-y-4">
              {[
                { label: 'CPU Usage', value: 12, color: 'bg-security-accent' },
                { label: 'Memory', value: 45, color: 'bg-security-warning' },
                { label: 'Disk Health', value: 98, color: 'bg-security-success' }
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-white">{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      className={cn("h-full rounded-full", item.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Threat Analysis */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-security-card rounded-2xl border border-white/5 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <FileSearch className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">AI Threat Analysis</h2>
                  <p className="text-xs text-slate-500">Paste code, logs, or drop files for deep inspection</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setInputText(''); setAnalysisResult(null); }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  CLEAR
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
              <div 
                {...getRootProps()} 
                className={cn(
                  "flex-1 min-h-[200px] border-2 border-dashed rounded-xl transition-all flex flex-col relative",
                  isDragActive ? "border-security-accent bg-security-accent/5" : "border-white/10 bg-black/20"
                )}
              >
                <input {...getInputProps()} />
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste suspicious code, system logs, or drag a file here..."
                  className="flex-1 bg-transparent p-4 text-sm font-mono text-slate-300 resize-none focus:outline-none"
                />
                {inputText.length === 0 && !isDragActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                    <Terminal className="w-12 h-12 mb-2" />
                    <p className="text-sm font-bold">AWAITING INPUT</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-security-success" />
                    SANDBOX ACTIVE
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-security-accent" />
                    AI ENGINE READY
                  </div>
                </div>
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputText.trim()}
                  className={cn(
                    "px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all",
                    isAnalyzing || !inputText.trim()
                      ? "bg-white/5 text-slate-500 cursor-not-allowed"
                      : "bg-white text-black hover:bg-security-accent hover:text-security-bg shadow-lg shadow-white/5"
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      ANALYZING...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      ANALYZE THREAT
                    </>
                  )}
                </button>
              </div>

              {/* Analysis Result Area */}
              <AnimatePresence mode="wait">
                {analysisResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-black/40 rounded-xl border border-white/10 p-6 overflow-y-auto max-h-[400px] custom-scrollbar"
                  >
                    <div className="flex items-center gap-2 mb-4 text-security-accent">
                      <ShieldAlert className="w-5 h-5" />
                      <h3 className="font-bold uppercase tracking-wider text-sm">Security Report</h3>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <Markdown>{analysisResult}</Markdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-security-card rounded-2xl border border-white/5 p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-security-accent" />
              REAL-TIME ACTIVITY LOG
            </h3>
            <div className="space-y-3 font-mono text-[11px]">
              {[
                { time: '19:24:01', event: 'Inbound connection from 192.168.1.45 blocked', type: 'danger' },
                { time: '19:22:15', event: 'System integrity check completed: 100% clean', type: 'success' },
                { time: '19:20:44', event: 'AI Engine updated to latest threat definitions', type: 'accent' },
                { time: '19:18:32', event: 'Encrypted tunnel established for user session', type: 'success' }
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <span className="text-slate-600 shrink-0">{log.time}</span>
                  <span className={cn(
                    "flex-1",
                    log.type === 'danger' ? 'text-security-danger' : 
                    log.type === 'success' ? 'text-security-success' : 'text-security-accent'
                  )}>
                    {log.event}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-slate-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 bg-security-card border-t border-white/5 px-6 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-security-success" />
            FIREWALL: ACTIVE
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-security-success" />
            VPN: CONNECTED
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>LATENCY: 12ms</span>
          <span>UPTIME: 14D 02H 11M</span>
        </div>
      </footer>
    </div>
  );
}
