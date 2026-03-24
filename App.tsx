import React, { useState, useEffect } from 'react';
import { NavBar } from './components/NavBar';
import { StatusCard } from './components/StatusCard';
import { ModuleList } from './components/ModuleList';
import { Terminal } from './components/Terminal';
import { AppView, LogEntry, Module, ChatMessage } from './types';
import { checkConnection, generateStreamResponse } from './services/aiService';
import { Wifi, Search as SearchIcon, Send, Settings, Bell, Mic } from 'lucide-react';

const DEFAULT_MODULES: Module[] = [
  {
    id: 'mod_assistant',
    name: 'Mirror AI',
    version: 'System',
    description: 'The core Black Mirror chat experience. Reflects your needs.',
    author: 'Mirror Team',
    enabled: true,
    systemInstruction: 'You are a helpful futuristic AI assistant named Mirror.',
    category: 'System',
    posterColor: 'from-slate-800 to-black'
  },
  {
    id: 'mod_cinema',
    name: 'Cinephile',
    version: '4K HDR',
    description: 'Expert in movies, series and entertainment recommendations.',
    author: 'Mirror Movies',
    enabled: false,
    systemInstruction: 'You are a movie expert. You give recommendations with IMDb ratings.',
    category: 'VOD',
    posterColor: 'from-red-900 to-rose-950'
  },
  {
    id: 'mod_coder',
    name: 'Dev Tools',
    version: 'v2.0',
    description: 'Advanced coding assistance for developers.',
    author: 'Mirror Dev',
    enabled: false,
    systemInstruction: 'You are a Senior Software Engineer.',
    category: 'Series',
    posterColor: 'from-blue-900 to-indigo-950'
  },
   {
    id: 'mod_sports',
    name: 'Sports Live',
    version: 'Live',
    description: 'Analysis and stats for all major sports.',
    author: 'Mirror Sport',
    enabled: false,
    systemInstruction: 'You are a sports analyst. Concise and stat-heavy.',
    category: 'Live',
    posterColor: 'from-orange-900 to-amber-950'
  }
];

export default function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [modules, setModules] = useState<Module[]>(DEFAULT_MODULES);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [promptInput, setPromptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    checkConnection().then(setIsConnected);
    return () => clearInterval(timer);
  }, []);

  const addLog = (level: LogEntry['level'], source: LogEntry['source'], message: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      level,
      source,
      message
    }]);
  };

  const handleToggleModule = (id: string) => {
    setModules(prev => prev.map(m => {
        if (m.id === id) {
            return { ...m, enabled: !m.enabled };
        }
        return { ...m, enabled: false }; 
    }));
    
    const target = modules.find(m => m.id === id);
    if (target && !target.enabled) {
        setView(AppView.LIVE);
        setChatHistory([{ role: 'model', text: `Switched to channel: ${target.name}. ${target.description}` }]);
    }
  };

  const getActiveSystemInstruction = () => {
    const enabled = modules.find(m => m.enabled);
    return enabled ? enabled.systemInstruction : "You are a helpful AI assistant.";
  };

  const handleSendPrompt = async () => {
    if (!promptInput.trim()) return;
    const prompt = promptInput;
    setPromptInput('');
    setIsProcessing(true);
    
    setChatHistory(prev => [...prev, { role: 'user', text: prompt }]);
    const systemInstruction = getActiveSystemInstruction();

    try {
      let responseText = '';
      setChatHistory(prev => [...prev, { role: 'model', text: '...' }]);

      await generateStreamResponse(prompt, systemInstruction, chatHistory, (chunk) => {
        responseText += chunk;
        setChatHistory(prev => {
          const newHist = [...prev];
          const last = newHist[newHist.length - 1];
          if (last.role === 'model') last.text = responseText;
          return newHist;
        });
      });
    } catch (error: any) {
      setChatHistory(prev => [...prev, { role: 'model', text: `Error: ${error.message}` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const TopBar = () => (
    <div className="flex justify-between items-center px-8 py-6 z-40 relative">
      <div className="flex items-center space-x-4">
         <div className="w-8 h-8 rounded bg-gradient-to-tr from-tv-focus to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
             <span className="font-bold text-white text-xs">B</span>
         </div>
         <div className="flex flex-col">
            <span className="font-bold text-lg text-white tracking-wide leading-none">BLACK <span className="text-tv-focus font-light">MIRROR</span></span>
         </div>
      </div>
      <div className="flex items-center space-x-8">
        <div className="hidden md:flex items-center space-x-6 bg-white/5 px-6 py-2 rounded-full border border-white/5 backdrop-blur-md">
            <Wifi size={16} className={isConnected ? "text-green-500" : "text-red-500"} />
            <div className="w-px h-4 bg-white/10"></div>
            <span className="font-mono text-xs font-bold text-gray-300 tracking-wider">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="h-full overflow-y-auto pb-20 scrollbar-hide animate-fade-in pr-2">
        <StatusCard 
          title="Black Mirror OS" 
          version="v4.0" 
          isConnected={isConnected} 
          onAction={() => setView(AppView.LIVE)}
          isProcessing={isProcessing}
        />
        <div className="mt-12">
            <ModuleList 
                modules={modules} 
                onToggle={handleToggleModule} 
                onDelete={() => {}} 
            />
        </div>
    </div>
  );

  const renderLiveChat = () => (
    <div className="flex flex-col h-full animate-slide-in pb-4">
        <div className="flex-1 bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden flex flex-col relative shadow-2xl">
            {/* Header of Chat Window */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/70">Mirror Link</span>
                </div>
                <span className="text-xs font-mono text-white/30">CH-001</span>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                 {chatHistory.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center text-tv-muted opacity-30">
                         <div className="w-24 h-24 rounded-full border-4 border-white/10 flex items-center justify-center mb-4">
                            <Mic size={32} />
                         </div>
                         <p className="text-sm font-light tracking-widest uppercase">Awaiting Reflection</p>
                     </div>
                 )}
                 {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-5 rounded-2xl backdrop-blur-sm ${
                            msg.role === 'user' 
                            ? 'bg-tv-focus text-white rounded-tr-sm shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                            : 'bg-white/5 text-gray-200 rounded-tl-sm border border-white/5'
                        }`}>
                            <p className="text-sm md:text-base leading-relaxed font-light">{msg.text}</p>
                        </div>
                    </div>
                 ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 md:p-6 bg-black/40 border-t border-white/5">
                <div className="flex items-center space-x-4 bg-white/5 rounded-2xl px-5 py-4 border border-white/10 focus-within:border-tv-focus focus-within:ring-1 focus-within:ring-tv-focus/50 transition-all hover:bg-white/10">
                    <SearchIcon className="text-gray-400" size={20} />
                    <input 
                        type="text" 
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
                        placeholder="Ask the Mirror..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 font-medium text-lg"
                        autoFocus
                    />
                    <button 
                        onClick={handleSendPrompt}
                        disabled={isProcessing}
                        className="p-3 bg-tv-focus hover:bg-blue-400 rounded-xl text-white transition-all hover:scale-105 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    >
                        {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderVOD = () => (
      <div className="h-full overflow-y-auto scrollbar-hide animate-fade-in pr-2">
          <ModuleList modules={modules} onToggle={handleToggleModule} onDelete={() => {}} />
      </div>
  );

  const renderSettings = () => (
      <div className="h-full overflow-y-auto p-4 animate-fade-in pr-2">
          <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Settings</h2>
          <div className="grid gap-6 max-w-3xl">
              <div className="bg-tv-card p-6 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors border border-white/5 group">
                  <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-tv-focus transition-colors">
                          <Settings size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">Parental Control</h4>
                        <p className="text-sm text-gray-500">Restricted Mode enabled</p>
                      </div>
                  </div>
                  <div className="w-12 h-7 bg-white/10 rounded-full relative transition-colors group-hover:bg-green-500/20">
                      <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-lg"></div>
                  </div>
              </div>
          </div>
          
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white mb-6">System Terminal</h3>
            <div className="h-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <Terminal logs={logs} onClear={() => setLogs([])} />
            </div>
          </div>
      </div>
  );

  return (
    <div className="flex h-screen w-full bg-tv-bg text-tv-text font-sans antialiased overflow-hidden selection:bg-tv-focus selection:text-white">
      {/* Global Background Ambient */}
      <div className="ambient-glow"></div>
      
      <NavBar currentView={view} setView={setView} />
      
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopBar />
        <div className="flex-1 px-6 md:px-12 pb-6 overflow-hidden">
            {view === AppView.HOME && renderHome()}
            {view === AppView.SEARCH && renderLiveChat()} 
            {view === AppView.LIVE && renderLiveChat()}
            {view === AppView.VOD && renderVOD()}
            {view === AppView.SETTINGS && renderSettings()}
        </div>
      </main>
    </div>
  );
}