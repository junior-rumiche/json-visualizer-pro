
import React, { useMemo, useState } from 'react';
import { JsonValue, JsonObject, JsonArray } from '../types';
import { 
  Layers, 
  Hash, 
  Type, 
  Box, 
  Braces, 
  List, 
  Database, 
  Scale, 
  CheckCircle2,
  FileCode,
  FileSpreadsheet,
  AlertTriangle,
  Download,
  Check,
  FileJson,
  Eraser
} from 'lucide-react';

interface JsonStatsProps {
  data: JsonValue;
}

interface Stats {
  totalNodes: number;
  maxDepth: number;
  sizeBytes: number;
  emptyValues: number; // nulls, empty strings, empty arrays/objects
  typeCounts: {
    string: number;
    number: number;
    boolean: number;
    null: number;
    object: number;
    array: number;
  };
}

const JsonStats: React.FC<JsonStatsProps> = ({ data }) => {
  const [copiedTs, setCopiedTs] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [cleanedData, setCleanedData] = useState<string | null>(null);

  const stats = useMemo(() => {
    const initialStats: Stats = {
      totalNodes: 0,
      maxDepth: 0,
      sizeBytes: new Blob([JSON.stringify(data)]).size,
      emptyValues: 0,
      typeCounts: { string: 0, number: 0, boolean: 0, null: 0, object: 0, array: 0 }
    };

    const traverse = (value: JsonValue, depth: number) => {
      initialStats.totalNodes++;
      initialStats.maxDepth = Math.max(initialStats.maxDepth, depth);

      if (value === null) {
        initialStats.typeCounts.null++;
        initialStats.emptyValues++;
        return;
      }

      if (Array.isArray(value)) {
        initialStats.typeCounts.array++;
        if (value.length === 0) initialStats.emptyValues++;
        value.forEach(item => traverse(item, depth + 1));
      } else if (typeof value === 'object') {
        initialStats.typeCounts.object++;
        if (Object.keys(value).length === 0) initialStats.emptyValues++;
        Object.values(value).forEach(item => traverse(item, depth + 1));
      } else if (typeof value === 'string') {
        initialStats.typeCounts.string++;
        if (value.trim() === '') initialStats.emptyValues++;
      } else if (typeof value === 'number') {
        initialStats.typeCounts.number++;
      } else if (typeof value === 'boolean') {
        initialStats.typeCounts.boolean++;
      }
    };

    traverse(data, 1);
    return initialStats;
  }, [data]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- Tools Logic ---

  const generateTypeScript = () => {
    // Very basic TS inference
    const getType = (val: any): string => {
      if (val === null) return 'any';
      if (Array.isArray(val)) {
        const types = new Set(val.map(getType));
        return types.size === 1 ? `${Array.from(types)[0]}[]` : 'any[]';
      }
      if (typeof val === 'object') return 'RootObject'; // Simplified recursive object
      return typeof val;
    };
    
    let ts = "interface RootObject {\n";
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        Object.entries(data).forEach(([k, v]) => {
            ts += `  ${k}: ${getType(v)};\n`;
        });
    }
    ts += "}";
    
    navigator.clipboard.writeText(ts);
    setCopiedTs(true);
    setTimeout(() => setCopiedTs(false), 2000);
  };

  const generateJsonSchema = () => {
    // Basic JSON Schema Generator
    const inferSchema = (val: any): any => {
        if (val === null) return { type: "null" };
        if (Array.isArray(val)) {
            const items = val.length > 0 ? inferSchema(val[0]) : {};
            return { type: "array", items };
        }
        if (typeof val === 'object') {
            const properties: any = {};
            Object.keys(val).forEach(k => {
                properties[k] = inferSchema(val[k]);
            });
            return { type: "object", properties };
        }
        return { type: typeof val };
    };

    const schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        ...inferSchema(data)
    };

    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const cleanData = () => {
      // Recursively remove nulls and empty objects
      const clean = (val: any): any => {
          if (Array.isArray(val)) {
              return val.map(clean).filter(v => v !== null && v !== undefined);
          }
          if (typeof val === 'object' && val !== null) {
              const newObj: any = {};
              Object.keys(val).forEach(k => {
                  const cleanedVal = clean(val[k]);
                  if (cleanedVal !== null && cleanedVal !== undefined) {
                      newObj[k] = cleanedVal;
                  }
              });
              // If object became empty, keep it? or remove? Let's keep empty objects but remove null props
              return newObj;
          }
          return val;
      };
      
      const cleaned = clean(data);
      const json = JSON.stringify(cleaned, null, 2);
      navigator.clipboard.writeText(json);
      setCleanedData("Copiado al portapapeles");
      setTimeout(() => setCleanedData(null), 2000);
  }

  const downloadCSV = () => {
    // Flattens array of objects or single object
    let items = Array.isArray(data) ? data : [data];
    if (items.length === 0 || typeof items[0] !== 'object') return;

    const replacer = (key: string, value: any) => value === null ? '' : value; 
    const header = Object.keys(items[0] as object);
    const csv = [
      header.join(','), 
      ...items.map(row => header.map(fieldName => JSON.stringify((row as any)[fieldName], replacer)).join(','))
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'data_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const StatCard = ({ icon: Icon, label, value, color, subtext }: any) => (
    <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors duration-300 shadow-sm dark:shadow-none">
      <div className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-950 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-800 dark:text-white font-mono">{value}</p>
        {subtext && <p className="text-[10px] text-slate-400 dark:text-slate-500">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Database} 
          label="Tamaño" 
          value={formatBytes(stats.sizeBytes)} 
          color="text-indigo-500 dark:text-indigo-400"
        />
        <StatCard 
          icon={Layers} 
          label="Profundidad" 
          value={stats.maxDepth} 
          color="text-emerald-500 dark:text-emerald-400"
          subtext={stats.maxDepth > 5 ? "Estructura profunda" : "Estructura plana"}
        />
        <StatCard 
          icon={Box} 
          label="Total Nodos" 
          value={stats.totalNodes} 
          color="text-sky-500 dark:text-sky-400"
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Vacíos/Null" 
          value={stats.emptyValues} 
          color={stats.emptyValues > 0 ? "text-orange-500 dark:text-orange-400" : "text-slate-400"}
          subtext={`${((stats.emptyValues/stats.totalNodes)*100).toFixed(1)}% de datos`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Type Distribution */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm dark:shadow-none transition-colors duration-300">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} /> Distribución de Tipos
            </h3>
            <div className="space-y-4">
            {[
                { label: 'Objetos', count: stats.typeCounts.object, icon: Braces, color: 'bg-yellow-500', text: 'text-yellow-500' },
                { label: 'Arrays', count: stats.typeCounts.array, icon: List, color: 'bg-orange-500', text: 'text-orange-500' },
                { label: 'Strings', count: stats.typeCounts.string, icon: Type, color: 'bg-green-500', text: 'text-green-500' },
                { label: 'Numbers', count: stats.typeCounts.number, icon: Hash, color: 'bg-blue-500', text: 'text-blue-500' },
                { label: 'Booleans', count: stats.typeCounts.boolean, icon: CheckCircle2, color: 'bg-purple-500', text: 'text-purple-500' },
                { label: 'Nulls', count: stats.typeCounts.null, icon: Box, color: 'bg-slate-400 dark:bg-slate-500', text: 'text-slate-400 dark:text-slate-500' },
            ].map((item) => {
                const percentage = stats.totalNodes > 0 ? (item.count / stats.totalNodes) * 100 : 0;
                if (item.count === 0) return null;
                
                return (
                <div key={item.label} className="group">
                    <div className="flex items-center justify-between mb-1 text-sm">
                    <div className="flex items-center gap-2">
                        <item.icon size={14} className={item.text} />
                        <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-900 dark:text-white font-medium">{item.count}</span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs w-12 text-right">({percentage.toFixed(1)}%)</span>
                    </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${item.color} opacity-80 group-hover:opacity-100 transition-all duration-500`} 
                        style={{ width: `${percentage}%` }}
                    />
                    </div>
                </div>
                );
            })}
            </div>
          </div>

          {/* Quick Tools */}
          <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm dark:shadow-none transition-colors duration-300">
             <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Download size={16} /> Herramientas
            </h3>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[300px]">
                
                {/* TS Export */}
                <button 
                    onClick={generateTypeScript}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-lg transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-md text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300">
                            <FileCode size={18} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Generar Tipos TS</p>
                            <p className="text-[10px] text-slate-500">Copiar interfaces</p>
                        </div>
                    </div>
                    {copiedTs ? <Check size={16} className="text-green-500" /> : <Download size={16} className="text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />}
                </button>

                {/* Schema Export */}
                <button 
                    onClick={generateJsonSchema}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 hover:bg-violet-50 dark:hover:bg-violet-500/10 border border-slate-200 dark:border-slate-800 hover:border-violet-500/50 rounded-lg transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 dark:bg-violet-500/10 rounded-md text-violet-500 dark:text-violet-400 group-hover:text-violet-600 dark:group-hover:text-violet-300">
                            <FileJson size={18} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">JSON Schema</p>
                            <p className="text-[10px] text-slate-500">Generar validador</p>
                        </div>
                    </div>
                    {copiedSchema ? <Check size={16} className="text-green-500" /> : <Download size={16} className="text-slate-400 group-hover:text-violet-500 dark:group-hover:text-violet-400" />}
                </button>

                {/* CSV Export */}
                <button 
                    onClick={downloadCSV}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-lg transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-md text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                            <FileSpreadsheet size={18} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Exportar CSV</p>
                            <p className="text-[10px] text-slate-500">Descargar tabla plana</p>
                        </div>
                    </div>
                    <Download size={16} className="text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />
                </button>

                {/* Clean Data */}
                <button 
                    onClick={cleanData}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 rounded-lg transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 dark:bg-rose-500/10 rounded-md text-rose-500 dark:text-rose-400 group-hover:text-rose-600 dark:group-hover:text-rose-300">
                            <Eraser size={18} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Limpiar Datos</p>
                            <p className="text-[10px] text-slate-500">Eliminar nulls</p>
                        </div>
                    </div>
                    {cleanedData ? <Check size={16} className="text-green-500" /> : <div className="w-4" />}
                </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                     <span className="text-slate-500">Calidad del Dato</span>
                     <span className={`font-bold ${stats.emptyValues === 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-yellow-400'}`}>
                        {stats.emptyValues === 0 ? 'Excelente' : 'Mejorable'}
                     </span>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default JsonStats;
