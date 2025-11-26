
export const highlightJson = (json: string, isDark: boolean = true): string => {
  if (!json) return '';

  // Escape HTML entities to prevent injection and display issues
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Regex to tokenize JSON
  // Captures: "keys":, "strings", booleans, null, numbers
  const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

  // Colors
  const colors = isDark ? {
    key: '#818cf8', // Indigo 400
    colon: '#64748b', // Slate 500
    string: '#34d399', // Emerald 400
    boolean: '#a78bfa', // Purple 400
    null: '#fb7185', // Rose 400
    number: '#38bdf8' // Sky 400
  } : {
    key: '#4f46e5', // Indigo 600
    colon: '#94a3b8', // Slate 400
    string: '#059669', // Emerald 600
    boolean: '#7c3aed', // Purple 600
    null: '#e11d48', // Rose 600
    number: '#0284c7' // Sky 600
  };

  return escaped.replace(regex, (match) => {
    // KEY detected (ends with :)
    if (/^"/.test(match) && /:$/.test(match)) {
      // We split the key and the colon to style them separately
      const key = match.slice(0, -1);
      return `<span style="color: ${colors.key}; font-weight: 600;">${key}</span><span style="color: ${colors.colon}">:</span>`;
    }

    // STRING
    if (/^"/.test(match)) {
      return `<span style="color: ${colors.string};">${match}</span>`;
    }

    // BOOLEAN
    if (/true|false/.test(match)) {
      return `<span style="color: ${colors.boolean}; font-weight: 600;">${match}</span>`;
    }

    // NULL
    if (/null/.test(match)) {
      return `<span style="color: ${colors.null}; font-weight: bold;">${match}</span>`;
    }

    // NUMBER
    if (/^-?\d/.test(match)) {
      return `<span style="color: ${colors.number};">${match}</span>`;
    }

    return match;
  });
};