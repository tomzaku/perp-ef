import { Highlight, themes } from 'prism-react-renderer';
import { useState } from 'react';
import { useThemeContext } from '../hooks/ThemeContext';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = 'javascript', title }: CodeBlockProps) {
  const { theme } = useThemeContext();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-bg-primary my-3">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary border-b border-border">
          <span className="text-xs font-code text-text-muted uppercase tracking-wider">{title}</span>
          <button
            onClick={handleCopy}
            className="text-xs text-text-muted hover:text-accent-cyan transition-colors cursor-pointer"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      {!title && (
        <div className="flex justify-end px-4 py-1.5 bg-bg-tertiary border-b border-border">
          <button
            onClick={handleCopy}
            className="text-xs text-text-muted hover:text-accent-cyan transition-colors cursor-pointer"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <Highlight theme={theme === 'dark' ? themes.nightOwl : themes.github} code={code.trim()} language={language}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed m-0">
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
    </div>
  );
}
