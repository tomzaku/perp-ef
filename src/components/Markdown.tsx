import { useEffect, useRef, useId, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Highlight, themes } from 'prism-react-renderer';
import type { Components } from 'react-markdown';
import { useThemeContext } from '../hooks/ThemeContext';

let mermaidInstance: typeof import('mermaid')['default'] | null = null;
let mermaidLoading: Promise<typeof import('mermaid')['default']> | null = null;

function loadMermaid() {
  if (!mermaidLoading) {
    mermaidLoading = import('mermaid').then((m) => {
      mermaidInstance = m.default;
      return m.default;
    });
  }
  return mermaidLoading;
}

const darkThemeVars = {
  primaryColor: '#1a1a26',
  primaryTextColor: '#e4e4ef',
  primaryBorderColor: '#00d4ff',
  lineColor: '#5a5a70',
  secondaryColor: '#15151f',
  tertiaryColor: '#12121a',
  fontFamily: '"IBM Plex Sans", sans-serif',
  fontSize: '13px',
  nodeBorder: '#00d4ff',
  mainBkg: '#1a1a26',
  nodeBkg: '#1a1a26',
  clusterBkg: '#12121a',
  clusterBorder: '#2a2a3a',
  edgeLabelBackground: '#12121a',
  nodeTextColor: '#e4e4ef',
};

const lightThemeVars = {
  primaryColor: '#fff9f0',
  primaryTextColor: '#2c2416',
  primaryBorderColor: '#0a7e96',
  lineColor: '#9a8b78',
  secondaryColor: '#f3ede4',
  tertiaryColor: '#ebe4d8',
  fontFamily: '"IBM Plex Sans", sans-serif',
  fontSize: '13px',
  nodeBorder: '#0a7e96',
  mainBkg: '#fff9f0',
  nodeBkg: '#fff9f0',
  clusterBkg: '#f3ede4',
  clusterBorder: '#d9cfbf',
  edgeLabelBackground: '#f3ede4',
  nodeTextColor: '#2c2416',
};

function MermaidBlock({ chart, theme }: { chart: string; theme: 'dark' | 'light' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useId().replace(/:/g, '_');
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = mermaidInstance ?? await loadMermaid();
        if (cancelled) return;
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          themeVariables: theme === 'dark' ? darkThemeVars : lightThemeVars,
          flowchart: { curve: 'basis', padding: 16 },
          securityLevel: 'loose',
        });
        const tempDiv = document.createElement('div');
        tempDiv.id = `mermaid_temp_${uniqueId}`;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);
        try {
          const { svg } = await mermaid.render(`mermaid_${uniqueId}_${theme}`, chart, tempDiv);
          if (!cancelled) {
            setSvgHtml(svg);
            setError(false);
          }
        } finally {
          tempDiv.remove();
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }
    setSvgHtml(null);
    render();
    return () => { cancelled = true; };
  }, [chart, uniqueId, theme]);

  if (error) {
    return (
      <div className="my-3 p-4 bg-bg-primary border border-border rounded-lg">
        <pre className="text-xs text-accent-red">Mermaid render error</pre>
      </div>
    );
  }

  if (!svgHtml) {
    return (
      <div className="my-3 p-4 bg-bg-primary border border-border rounded-lg min-h-[100px] flex items-center justify-center">
        <span className="text-xs text-text-muted animate-pulse">Loading diagram...</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-3 p-4 bg-bg-primary border border-border rounded-lg overflow-x-auto flex justify-center [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className = '' }: MarkdownProps) {
  const { theme } = useThemeContext();
  const codeTheme = theme === 'dark' ? themes.nightOwl : themes.github;

  const components: Components = {
    h1: ({ children }) => (
      <h1 className="text-lg font-display font-bold text-text-primary mt-6 mb-3 first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-base font-display font-bold text-text-primary mt-5 mb-2 first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-sm font-display font-bold text-text-primary mt-4 mb-2 first:mt-0">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-sm leading-relaxed text-text-primary mb-3 last:mb-0">{children}</p>
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-text-primary">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="text-text-secondary italic">{children}</em>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-1.5 mb-3 text-sm text-text-primary ml-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-1.5 mb-3 text-sm text-text-primary ml-1">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-accent-cyan/40 pl-4 py-1 my-3 text-text-secondary italic">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="border-border my-4" />,
    table: ({ children }) => (
      <div className="overflow-x-auto my-3 rounded-lg border border-border">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-bg-tertiary">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-border">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="border-border">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 text-text-primary">{children}</td>
    ),
    code: ({ className: codeClassName, children }) => {
      const match = /language-(\w+)/.exec(codeClassName || '');
      const codeString = String(children).replace(/\n$/, '');

      // Mermaid code blocks
      if (match && match[1] === 'mermaid') {
        return <MermaidBlock chart={codeString} theme={theme} />;
      }

      if (match) {
        return (
          <Highlight theme={codeTheme} code={codeString} language={match[1]}>
            {({ tokens, getLineProps, getTokenProps }) => (
              <pre className="overflow-x-auto rounded-lg bg-bg-primary border border-border p-4 my-3 text-[13px] leading-relaxed">
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    <span className="inline-block w-8 text-right mr-4 text-text-muted/40 select-none text-xs">
                      {i + 1}
                    </span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        );
      }

      // Plain fenced code block (no language) — detect by newlines
      if (codeString.includes('\n')) {
        return (
          <pre className="overflow-x-auto rounded-lg bg-bg-primary border border-border p-4 my-3 text-[13px] leading-relaxed font-code text-text-primary whitespace-pre">
            {codeString}
          </pre>
        );
      }

      // Inline code
      return (
        <code className="px-1.5 py-0.5 rounded bg-bg-tertiary border border-border text-accent-cyan text-[13px] font-code">
          {children}
        </code>
      );
    },
    pre: ({ children }) => {
      // If children is already a Highlight/Mermaid block (from code above), render as-is
      return <>{children}</>;
    },
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
