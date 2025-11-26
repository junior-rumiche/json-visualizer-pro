
import React, { useState } from 'react';
import { Sparkles, Brain, Terminal, FileJson, Loader2, Gauge, Lightbulb } from 'lucide-react';
import { analyzeJsonData } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface AiInsightsProps {
  jsonString: string;
}

const AiInsights: React.FC<AiInsightsProps> = ({ jsonString }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeJsonData(jsonString);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Error al analizar el JSON");
    } finally {
      setLoading(false);
    }
  };

  // Complexity color helper
  const getScoreColor = (score: number) => {
    if (score < 4) return 'text-green-500 dark:text-green-400';
    if (score < 7) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-6 shadow-lg dark:shadow-xl transition-colors duration-300">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
        <div className="flex items-center gap-2">
            <div className="bg-indigo-100 dark:bg-indigo-500/10 p-1.5 rounded-lg">
                <Sparkles size={18} className="text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">Análisis Gemini AI</h2>
                <p className="text-xs text-slate-500">Insights profundos y detección de estructura</p>
            </div>
        </div>
        {!result && !loading && (
            <button
                onClick={handleAnalyze}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg transition-all text-xs font-bold tracking-wide shadow-lg shadow-indigo-500/20"
            >
                <Brain size={14} />
                GENERAR REPORTE
            </button>
        )}
      </div>

      <div className="p-6">
        {loading && (
            <div className="flex flex-col items-center justify-center py-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                    <Loader2 size={40} className="animate-spin mb-4 text-indigo-500 dark:text-indigo-400 relative" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-white">Analizando estructura de datos...</p>
                <p className="text-xs text-slate-500 mt-1">Esto tomará unos segundos</p>
            </div>
        )}

        {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 p-4 rounded-lg text-sm flex items-start gap-3">
                <div className="bg-red-100 dark:bg-red-900/20 p-1 rounded">
                    <Terminal size={16} />
                </div>
                <div>
                    <p className="font-bold">Error en el análisis</p>
                    <p className="opacity-80">{error}</p>
                </div>
            </div>
        )}

        {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {/* Header Title */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{result.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{result.summary}</p>
                    </div>
                    <div className="flex flex-col items-end">
                         <span className="text-xs text-slate-500 uppercase font-bold mb-1">Complejidad</span>
                         <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full">
                            <Gauge size={16} className={getScoreColor(result.complexityScore)} />
                            <span className={`text-lg font-bold font-mono ${getScoreColor(result.complexityScore)}`}>
                                {result.complexityScore}/10
                            </span>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950/30 p-5 rounded-xl border border-slate-200 dark:border-slate-800/50 hover:border-emerald-500/30 transition-colors group">
                        <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Lightbulb size={14} /> Insights Clave
                        </h3>
                        <ul className="space-y-3">
                            {result.keyInsights.map((insight, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                                    <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                                    {insight}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/30 p-5 rounded-xl border border-slate-200 dark:border-slate-800/50 hover:border-sky-500/30 transition-colors">
                        <h3 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FileJson size={14} /> Estructura Técnica
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm font-mono leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                            {result.schemaDetected}
                        </p>
                    </div>
                </div>
                
                <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 pt-4">
                    <button 
                        onClick={handleAnalyze}
                        className="text-xs text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 font-medium"
                    >
                        <Sparkles size={12} /> Regenerar Análisis
                    </button>
                </div>
            </div>
        )}

        {!result && !loading && (
            <div className="text-center py-8 opacity-40 text-slate-400 dark:text-slate-500">
                <Brain size={48} className="mx-auto mb-3" />
                <p className="text-sm">Presiona "Generar Reporte" para obtener insights de IA</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AiInsights;