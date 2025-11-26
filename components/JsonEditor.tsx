
import React, { useState, useEffect, useRef } from 'react';
import { highlightJson } from '../utils/highlight';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  isDark?: boolean;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, error, isDark = true }) => {
  const [highlightedHtml, setHighlightedHtml] = useState('');
  
  // Update highlight when value changes
  useEffect(() => {
    setHighlightedHtml(highlightJson(value, isDark));
  }, [value, isDark]);

  // Sync scroll between textarea and pre
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const containerClasses = `
    relative flex-1 w-full h-full min-h-[300px] overflow-hidden rounded-xl font-mono text-xs leading-relaxed border transition-colors duration-300
    ${error 
      ? 'bg-red-50 border-red-200 dark:bg-red-950/10 dark:border-red-500/30' 
      : 'bg-white border-slate-200 dark:bg-slate-950/50 dark:border-slate-800'
    }
  `;

  const textColor = isDark ? 'text-slate-300' : 'text-slate-700';
  const caretColor = isDark ? 'caret-white' : 'caret-slate-900';

  return (
    <div className={containerClasses}>
      {/* 
        Highlight Layer 
        Positioned absolutely behind the textarea.
      */}
      <pre
        ref={preRef}
        className={`absolute inset-0 p-5 m-0 overflow-hidden whitespace-pre-wrap break-words pointer-events-none custom-scrollbar ${textColor}`}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: highlightedHtml + '<br/>' }} 
      />

      {/* 
        Input Layer 
        Transparent text/background.
      */}
      <textarea
        ref={textareaRef}
        className={`absolute inset-0 w-full h-full p-5 m-0 bg-transparent text-transparent ${caretColor} resize-none border-0 focus:ring-0 focus:outline-none custom-scrollbar whitespace-pre-wrap break-words z-10`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        spellCheck={false}
        placeholder="Paste JSON here..."
      />
    </div>
  );
};

export default JsonEditor;