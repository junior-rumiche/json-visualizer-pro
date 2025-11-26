
import React, { useMemo } from 'react';
import { NodeDetail } from '../types';
import { highlightJson } from '../utils/highlight';
import { 
  Copy, 
  Type, 
  Hash, 
  ToggleRight, 
  Box, 
  Braces, 
  List, 
  MapPin,
  Maximize2,
  Info
} from 'lucide-react';

interface NodeInspectorProps {
  node: NodeDetail | null;
  isDark?: boolean;
}

const NodeInspector: React.FC<NodeInspectorProps> = ({ node, isDark = true }) => {
  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4">
            <Info size={24} className="opacity-50" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Selecciona una clave para ver sus detalles</p>
        <p className="text-xs opacity-60 mt-1 text-slate-500">Haz click en cualquier línea del árbol</p>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getTypeIcon = () => {
    switch (node.type) {
      case 'object': return <Braces size={16} className="text-amber-500 dark:text-yellow-400" />;
      case 'array': return <List size={16} className="text-orange-500 dark:text-orange-400" />;
      case 'string': return <Type size={16} className="text-emerald-600 dark:text-emerald-400" />;
      case 'number': return <Hash size={16} className="text-sky-600 dark:text-blue-400" />;
      case 'boolean': return <ToggleRight size={16} className="text-purple-600 dark:text-purple-400" />;
      default: return <Box size={16} className="text-rose-500 dark:text-red-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (node.type) {
      case 'object': return 'Object';
      case 'array': return 'Array';
      case 'string': return 'String';
      case 'number': return 'Number';
      case 'boolean': return 'Boolean';
      case 'null': return 'Null';
      default: return 'Unknown';
    }
  };

  const formattedValue = useMemo(() => {
    const val = typeof node.value === 'object' 
        ? JSON.stringify(node.value, null, 2) 
        : String(node.value);
    return highlightJson(val, isDark);
  }, [node.value, isDark]);

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-950/30 animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {getTypeIcon()}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate" title={node.key}>
                {node.key === 'root' ? 'Root' : node.key}
            </h3>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                {getTypeLabel()} • {node.size} {node.type === 'string' ? 'chars' : 'items'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        
        {/* Path Section */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={12} /> Ruta (Path)
            </label>
            <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-xs text-indigo-600 dark:text-indigo-300 break-all hover:border-indigo-500/30 transition-colors">
                {node.path}
                <button 
                    onClick={() => copyToClipboard(node.path)}
                    className="absolute top-2 right-2 p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500 dark:hover:bg-indigo-600 text-slate-500 dark:text-slate-400 hover:text-white rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Copiar ruta"
                >
                    <Copy size={12} />
                </button>
            </div>
        </div>

        {/* Value Section */}
        <div className="space-y-2 flex-1 flex flex-col">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Maximize2 size={12} /> Contenido
            </label>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0 overflow-hidden flex-1 min-h-[100px] flex flex-col">
                 <div className="absolute top-2 right-2 z-10">
                    <button 
                        onClick={() => copyToClipboard(typeof node.value === 'object' ? JSON.stringify(node.value, null, 2) : String(node.value))}
                        className="p-1.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-indigo-500 dark:hover:bg-indigo-600 text-slate-500 dark:text-slate-400 hover:text-white rounded backdrop-blur-sm transition-colors"
                        title="Copiar valor"
                    >
                        <Copy size={12} />
                    </button>
                 </div>
                 <div className="p-3 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-auto custom-scrollbar flex-1">
                     <pre dangerouslySetInnerHTML={{ __html: formattedValue }} />
                 </div>
            </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3">
             <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
                 <p className="text-[10px] text-slate-500 uppercase font-bold">Profundidad</p>
                 <p className="text-lg font-mono text-slate-800 dark:text-slate-300">{node.depth}</p>
             </div>
             <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
                 <p className="text-[10px] text-slate-500 uppercase font-bold">Tamaño (Bytes)</p>
                 <p className="text-lg font-mono text-slate-800 dark:text-slate-300">
                     {new Blob([JSON.stringify(node.value)]).size} B
                 </p>
             </div>
        </div>

      </div>
    </div>
  );
};

export default NodeInspector;