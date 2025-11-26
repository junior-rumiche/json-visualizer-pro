
import React, { useMemo } from 'react';
import { highlightJson } from '../utils/highlight';

interface CodeViewerProps {
  data: any;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ data }) => {
  const lines = useMemo(() => {
    const json = JSON.stringify(data, null, 2);
    return json.split('\n');
  }, [data]);

  return (
    <div className="font-mono text-xs leading-6 bg-slate-950 rounded-xl border border-slate-800/50 p-0 overflow-hidden flex flex-col h-full">
      <div className="flex-1 overflow-auto custom-scrollbar p-4">
        <table className="w-full border-collapse text-left">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-slate-900/40 transition-colors group">
                {/* Line Number */}
                <td className="w-10 pr-4 text-right align-top select-none text-slate-700 border-r border-slate-800/50 group-hover:text-slate-500 transition-colors">
                  {i + 1}
                </td>
                {/* Code Content */}
                <td className="pl-4 whitespace-pre align-top font-medium">
                  <span 
                    className="text-slate-300"
                    dangerouslySetInnerHTML={{ __html: highlightJson(line) }} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CodeViewer;
