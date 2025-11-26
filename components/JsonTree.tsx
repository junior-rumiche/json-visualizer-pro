
import React, { useState, useEffect, useMemo } from 'react';
import { JsonValue, NodeDetail } from '../types';
import { 
  ChevronRight, 
  Box, 
  Braces, 
  List,
  Type, 
  Hash, 
  ToggleRight,
  Search,
  ChevronsUpDown,
  ChevronDown
} from 'lucide-react';

interface JsonTreeProps {
  data: JsonValue;
  name?: string;
  isLast?: boolean;
  depth?: number;
  path?: string;
  onSelect?: (node: NodeDetail) => void;
  selectedPath?: string | null;
  searchTerm?: string;
  expandAll?: boolean;
}

// Recursive Tree Node
const JsonTreeNode: React.FC<JsonTreeProps> = ({ 
    data, 
    name, 
    isLast = true, 
    depth = 0, 
    path = 'root',
    onSelect,
    selectedPath,
    searchTerm = '',
    expandAll = false
}) => {
  // Force expand if searchTerm matches deeper nodes or if expandAll is true
  const shouldExpand = useMemo(() => {
    if (expandAll) return true;
    if (!searchTerm) return depth < 1;
    // If searching, we need to look ahead (expensive but necessary for filter feel)
    const jsonStr = JSON.stringify(data);
    return jsonStr.toLowerCase().includes(searchTerm.toLowerCase());
  }, [searchTerm, expandAll, depth, data]);

  const [isExpanded, setIsExpanded] = useState<boolean>(shouldExpand);

  useEffect(() => {
      setIsExpanded(shouldExpand);
  }, [shouldExpand]);
  
  // Determine Node Type and Size
  const getType = (val: any): NodeDetail['type'] => {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val as NodeDetail['type'];
  };

  const getSize = (val: any) => {
    if (val === null) return 0;
    if (Array.isArray(val)) return val.length;
    if (typeof val === 'object') return Object.keys(val).length;
    if (typeof val === 'string') return val.length;
    return 0; 
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
        onSelect({
            path,
            key: name || 'root',
            value: data,
            type: getType(data),
            size: getSize(data),
            depth
        });
    }
  };

  const isSelected = selectedPath === path;

  // Search Matching
  const matchesSearch = useMemo(() => {
      if (!searchTerm) return false;
      const keyMatch = name?.toLowerCase().includes(searchTerm.toLowerCase());
      const valueMatch = typeof data !== 'object' && String(data).toLowerCase().includes(searchTerm.toLowerCase());
      return keyMatch || valueMatch;
  }, [searchTerm, name, data]);

  // --- Styles ---
  const rowBaseClass = `
    group flex items-start pl-1.5 pr-2 py-0.5 rounded-r-md cursor-pointer select-none transition-all duration-150 border-l-[3px]
    ${isSelected 
        ? 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-500 shadow-[inset_10px_0_15px_-3px_rgba(99,102,241,0.15)]' 
        : matchesSearch 
            ? 'bg-yellow-100 dark:bg-yellow-500/10 border-yellow-500/50'
            : 'border-transparent hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
    }
  `;

  // --- Render Primitives ---
  if (data === null || typeof data !== 'object') {
    
    let Icon = Box;
    let colorClass = 'text-slate-500 dark:text-slate-400';
    let valueDisplay: React.ReactNode = String(data);

    if (data === null) {
      Icon = Box;
      colorClass = 'text-rose-500 dark:text-red-400 font-bold text-xs';
      valueDisplay = 'null';
    } else if (typeof data === 'string') {
      Icon = Type;
      colorClass = 'text-emerald-600 dark:text-emerald-400';
      valueDisplay = `"${data}"`;
    } else if (typeof data === 'number') {
      Icon = Hash;
      colorClass = 'text-sky-600 dark:text-sky-400';
    } else if (typeof data === 'boolean') {
      Icon = ToggleRight;
      colorClass = 'text-purple-600 dark:text-purple-400';
    }

    return (
      <div 
        className={rowBaseClass}
        style={{ marginLeft: `${depth * 1.2}rem` }}
        onClick={handleSelect}
      >
        {/* Indent Lines */}
        {depth > 0 && (
             <div className="absolute left-0 w-px bg-slate-300 dark:bg-slate-800/50 -ml-3 h-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        )}

        <div className="flex items-center min-w-0 flex-1">
            {/* Key */}
            {name && (
            <>
                <span className={`mr-1.5 text-xs font-semibold ${isSelected ? 'text-indigo-600 dark:text-indigo-300' : matchesSearch ? 'text-yellow-700 dark:text-yellow-200' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300'}`}>
                    {name}
                </span>
                <span className="text-slate-400 dark:text-slate-600 mr-2 text-xs">:</span>
            </>
            )}
            
            {/* Value */}
            <span className={`${colorClass} truncate font-mono text-[13px]`}>{valueDisplay}</span>
            {!isLast && <span className="text-slate-400 dark:text-slate-600 ml-0.5">,</span>}
        </div>
      </div>
    );
  }

  // --- Render Objects/Arrays ---
  const isArray = Array.isArray(data);
  const keys = Object.keys(data);
  const isEmpty = keys.length === 0;
  const TypeIcon = isArray ? List : Braces;
  const brackets = isArray ? ['[', ']'] : ['{', '}'];
  const size = keys.length;

  return (
    <div className="relative font-mono text-sm">
      
      {/* Parent Row */}
      <div 
        className={rowBaseClass}
        style={{ marginLeft: `${depth * 1.2}rem` }}
        onClick={handleSelect}
      >
        {/* Toggler */}
        <div 
            className="mr-1 p-0.5 rounded hover:bg-slate-300 dark:hover:bg-slate-700/50 text-slate-400 dark:text-slate-500 transition-colors"
            onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
            }}
        >
             {!isEmpty ? (
                 <ChevronRight size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
             ) : <div className="w-3.5 h-3.5" />}
        </div>

        {/* Icon */}
        <TypeIcon size={14} className={`mr-2 ${isArray ? 'text-orange-500 dark:text-orange-400' : 'text-amber-500 dark:text-yellow-400'} opacity-80`} />

        {/* Key */}
        {name && (
          <>
            <span className={`mr-1.5 text-xs font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-300' : matchesSearch ? 'text-yellow-700 dark:text-yellow-200' : 'text-slate-700 dark:text-slate-300'}`}>
                {name}
            </span>
            <span className="text-slate-400 dark:text-slate-600 mr-2">:</span>
          </>
        )}

        {/* Brackets & Meta */}
        <div className="flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500">{brackets[0]}</span>
            
            {/* Size Badge */}
            {!isExpanded && !isEmpty && (
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 rounded-full border border-slate-300 dark:border-slate-700">
                    {size} {isArray ? 'items' : 'keys'}
                </span>
            )}

            {(!isExpanded || isEmpty) && (
                <>
                    <span className="text-slate-400 dark:text-slate-500">{brackets[1]}</span>
                    {!isLast && <span className="text-slate-400 dark:text-slate-600">,</span>}
                </>
            )}
        </div>
      </div>

      {/* Recursive Children */}
      {isExpanded && !isEmpty && (
        <div className="relative">
             {/* Vertical Line Guide */}
             <div 
                className="absolute top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800/30 hover:bg-slate-300 dark:hover:bg-slate-700/50 transition-colors"
                style={{ left: `${(depth + 1) * 1.2}rem`, marginLeft: '0.35rem' }}
            ></div>

          {keys.map((key, index) => {
            const nextPath = path === 'root' ? key : (isArray ? `${path}[${key}]` : `${path}.${key}`);
            return (
                <JsonTreeNode
                    key={key}
                    name={isArray ? undefined : key}
                    data={(data as any)[key]}
                    isLast={index === keys.length - 1}
                    depth={depth + 1}
                    path={nextPath}
                    onSelect={onSelect}
                    selectedPath={selectedPath}
                    searchTerm={searchTerm}
                    expandAll={expandAll}
                />
            )
          })}
          <div 
            className="py-0.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800/20 rounded"
            style={{ marginLeft: `${depth * 1.2}rem` }}
          >
             <span className="ml-6 pl-0.5">{brackets[1]}</span>
             {!isLast && <span className="text-slate-400 dark:text-slate-600">,</span>}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Container Component (Wraps the recursive node with controls)
const JsonTreeContainer: React.FC<JsonTreeProps> = (props) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandAll, setExpandAll] = useState(false);

    return (
        <div className="flex flex-col h-full">
            {/* Tree Toolbar */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-950/95 backdrop-blur p-2 mb-2 border-b border-slate-200 dark:border-slate-800 flex gap-2 transition-colors duration-300">
                <div className="relative flex-1">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Filtrar claves/valores..." 
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md pl-8 pr-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setExpandAll(true)}
                    className="p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Expandir todo"
                >
                    <ChevronsUpDown size={12} />
                </button>
                <button 
                    onClick={() => setExpandAll(false)}
                    className="p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Colapsar todo"
                >
                    <ChevronDown size={12} />
                </button>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar pb-10">
                <JsonTreeNode 
                    {...props} 
                    searchTerm={searchTerm} 
                    expandAll={expandAll} 
                />
            </div>
        </div>
    );
}

export default JsonTreeContainer;