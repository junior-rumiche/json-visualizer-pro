
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Code, 
  Indent, 
  AlertCircle, 
  CheckCircle2,
  FileJson,
  Copy,
  LayoutDashboard,
  Network,
  Sparkles,
  Sun,
  Moon,
  Minimize,
  Wand2
} from 'lucide-react';
import JsonTree from './components/JsonTree';
import AiInsights from './components/AiInsights';
import JsonStats from './components/JsonStats';
import NodeInspector from './components/NodeInspector';
import JsonEditor from './components/JsonEditor';
import { ViewMode, NodeDetail } from './types';

const SAMPLE_JSON = {
  "project": "JSON Vision Pro",
  "version": 3.0,
  "metadata": {
      "created": "2023-10-27T10:00:00Z",
      "author": "Gemini Developer",
      "license": "MIT"
  },
  "features": [
    { "id": 1, "name": "Smart Analysis", "status": "active" },
    { "id": 2, "name": "Tree Visualization", "status": "active" },
    { "id": 3, "name": "Stats Dashboard", "status": "beta" }
  ],
  "metrics": {
    "performance": 98,
    "reliability": 99.9,
    "users": {
        "active": 12500,
        "total": 45000
    }
  },
  "config": {
      "theme": "dark",
      "notifications": true,
      "limits": null
  }
};

const App: React.FC = () => {
  // Theme State
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') !== 'light';
    }
    return true;
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const [rawInput, setRawInput] = useState<string>('');
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Dashboard);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse JSON safely
  const handleJsonChange = (value: string) => {
    setRawInput(value);
    if (!value.trim()) {
      setParsedJson(null);
      setError(null);
      setSelectedNode(null);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setParsedJson(parsed);
      setError(null);
    } catch (err: any) {
      setParsedJson(null);
      // Only show error if significant content
      if (value.length > 5) {
        setError(err.message);
      }
    }
  };

  // Handle File Upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handleJsonChange(text);
    };
    reader.readAsText(file);
  };

  // Drag and Drop
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/json") {
      readFile(file);
    } else if (file) {
        setError("Por favor, sube un archivo JSON válido.");
    }
  };

  // Utilities
  const formatJson = () => {
    if (parsedJson) {
      const formatted = JSON.stringify(parsedJson, null, 2);
      setRawInput(formatted);
      setParsedJson(JSON.parse(formatted)); // Refresh state
    }
  };

  const minifyJson = () => {
    if (parsedJson) {
      const minified = JSON.stringify(parsedJson);
      setRawInput(minified);
    }
  };

  const repairJson = () => {
    if (!rawInput) return;
    
    // Basic heuristics to fix common JSON errors
    let fixed = rawInput
      // Replace single quotes with double quotes (carefully)
      .replace(/'/g, '"')
      // Remove trailing commas in objects/arrays
      .replace(/,\s*([\]}])/g, '$1')
      // Add quotes to unquoted keys
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
    
    try {
      const parsed = JSON.parse(fixed);
      setParsedJson(parsed);
      setRawInput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e) {
      setError("No se pudo reparar automáticamente. El error es demasiado complejo.");
    }
  };

  const loadSample = () => {
    const sampleStr = JSON.stringify(SAMPLE_JSON, null, 2);
    setRawInput(sampleStr);
    setParsedJson(SAMPLE_JSON);
    setError(null);
    setSelectedNode(null);
  };

  const clearAll = () => {
    setRawInput('');
    setParsedJson(null);
    setError(null);
    setSelectedNode(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = () => {
      if(rawInput) {
          navigator.clipboard.writeText(rawInput);
      }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-9 h-9 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800">
                    <FileJson className="text-indigo-600 dark:text-indigo-400" size={20} />
                </div>
            </div>
            <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                JSON Vision <span className="text-indigo-600 dark:text-indigo-400">Pro</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Analyzer & Visualizer</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <Sparkles size={10} className="text-yellow-500" />
                <span>Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-4rem)]">
          
          {/* Left Panel: Input (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-[400px]">
            
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Code size={14} /> Fuente de Datos
              </label>
              <div className="flex items-center gap-1">
                 <button 
                  onClick={loadSample}
                  className="px-3 py-1.5 rounded-md hover:bg-indigo-500/10 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors border border-transparent hover:border-indigo-500/20"
                >
                  Cargar Demo
                </button>
              </div>
            </div>

            <div 
              className={`relative flex-1 rounded-2xl border transition-all duration-300 overflow-hidden group flex flex-col shadow-xl ${
                isDragging 
                  ? 'border-indigo-500 bg-indigo-500/5' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              } ${error ? 'border-red-500/30' : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
                {/* Input Toolbar */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 dark:bg-slate-950/80 p-1 rounded-lg border border-slate-200 dark:border-slate-800 backdrop-blur-sm z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
                    {error && (
                      <button 
                      onClick={repairJson}
                      className="p-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-md text-indigo-600 dark:text-indigo-400 transition-colors animate-pulse"
                      title="Intentar Reparar JSON (Smart Fix)"
                      >
                      <Wand2 size={16} />
                      </button>
                    )}
                    <button 
                    onClick={formatJson}
                    disabled={!parsedJson}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-30"
                    title="Formatear JSON (Prettify)"
                    >
                    <Indent size={16} />
                    </button>
                    <button 
                    onClick={minifyJson}
                    disabled={!parsedJson}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-30"
                    title="Minificar JSON"
                    >
                    <Minimize size={16} />
                    </button>
                    <button 
                    onClick={copyToClipboard}
                    disabled={!rawInput}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-30"
                    title="Copiar"
                    >
                    <Copy size={16} />
                    </button>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                    <button 
                    onClick={clearAll}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Limpiar"
                    >
                    <Trash2 size={16} />
                    </button>
                </div>

              {/* Replaced Textarea with JsonEditor */}
              <JsonEditor 
                value={rawInput} 
                onChange={handleJsonChange} 
                error={!!error}
                isDark={isDark}
              />
              
              {!rawInput && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 z-20">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 transition-all duration-500 ${isDragging ? 'bg-indigo-500/20 scale-110 shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800/30 shadow-inner'}`}>
                    <Upload size={32} className={isDragging ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'} />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">Arrastra un archivo JSON</p>
                </div>
              )}

              {/* File Input (Hidden) */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileUpload}
              />
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-20">
                 <div className="pointer-events-auto">
                    {!rawInput && (
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium hover:underline decoration-indigo-500/30 underline-offset-4"
                        >
                            Explorar archivos
                        </button>
                    )}
                 </div>
                 {parsedJson && !error && (
                     <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2 animate-in fade-in backdrop-blur-sm">
                         <CheckCircle2 size={12} />
                         VALID JSON
                     </div>
                 )}
              </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs flex items-start gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-mono leading-relaxed block mb-1">{error}</span>
                      <button 
                        onClick={repairJson} 
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 mt-1"
                      >
                        <Wand2 size={12} /> Intentar reparar automáticamente
                      </button>
                    </div>
                </div>
            )}
          </div>

          {/* Right Panel: Visualization (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4 h-full min-h-[500px]">
            
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-0.5">
                <div className="flex items-center gap-1">
                    {[
                        { id: ViewMode.Dashboard, label: 'Dashboard', icon: LayoutDashboard },
                        { id: ViewMode.Tree, label: 'Explorador', icon: Network }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setViewMode(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all border-t border-x border-transparent
                                ${viewMode === tab.id 
                                    ? 'bg-slate-200/50 dark:bg-slate-900/50 text-indigo-600 dark:text-indigo-400 border-slate-200 dark:border-slate-800 border-b-slate-200 dark:border-b-slate-900 relative top-px' 
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/30'
                                }
                            `}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white/50 dark:bg-slate-900/20 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col transition-colors duration-300">
              {parsedJson ? (
                <div className="flex-1 h-full overflow-hidden">
                  
                  {viewMode === ViewMode.Dashboard && (
                    <div className="h-full overflow-auto p-6 custom-scrollbar">
                        <div className="max-w-5xl mx-auto space-y-6">
                            <AiInsights jsonString={rawInput} />
                            <JsonStats data={parsedJson} />
                        </div>
                    </div>
                  )}

                  {viewMode === ViewMode.Tree && (
                    <div className="h-full flex">
                        {/* Tree Side */}
                        <div className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950/30 custom-scrollbar transition-colors duration-300">
                            <JsonTree 
                                data={parsedJson} 
                                name="root" 
                                onSelect={setSelectedNode}
                                selectedPath={selectedNode?.path}
                            />
                        </div>
                        
                        {/* Inspector Side (Conditional width or Overlay) */}
                        <div className="w-[320px] border-l border-slate-200 dark:border-slate-800 h-full bg-white dark:bg-slate-950/50 hidden md:block transition-colors duration-300">
                            <NodeInspector node={selectedNode} isDark={isDark} />
                        </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 opacity-60">
                   <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800">
                        <LayoutDashboard size={40} className="text-slate-400 dark:text-slate-700" />
                   </div>
                  <p className="text-sm font-medium">Selecciona una vista para comenzar</p>
                </div>
              )}
            </div>
          </div>

      </main>
    </div>
  );
};

export default App;
