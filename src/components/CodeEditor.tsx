import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { TestConfig } from '../types/question';
import { runTests } from '../lib/testRunner';
import type { SubmitResult } from '../lib/testRunner';
import { TestResultsPanel } from './TestResultsPanel';
import { useThemeContext } from '../hooks/ThemeContext';

interface CodeEditorProps {
  defaultCode?: string;
  testConfig?: TestConfig;
}

export function CodeEditor({
  defaultCode = '// Write your solution here\n\nfunction solution() {\n  \n}\n\n// Test it\nconsole.log(solution());\n',
  testConfig,
}: CodeEditorProps) {
  const { theme } = useThemeContext();
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'results'>('output');
  const editorRef = useRef<unknown>(null);

  const handleEditorMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  const runCode = () => {
    setIsRunning(true);
    setOutput([]);
    setActiveTab('output');
    const logs: string[] = [];

    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args: unknown[]) => {
      logs.push(args.map((a) => {
        try {
          return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
        } catch { return String(a); }
      }).join(' '));
    };
    console.warn = (...args: unknown[]) => {
      logs.push(`[warn] ${args.map(String).join(' ')}`);
    };
    console.error = (...args: unknown[]) => {
      logs.push(`[error] ${args.map(String).join(' ')}`);
    };

    try {
      const startTime = performance.now();
      const fn = new Function(code);
      fn();
      const elapsed = (performance.now() - startTime).toFixed(2);
      logs.push(`\n--- Executed in ${elapsed}ms ---`);
    } catch (err) {
      logs.push(`[Error] ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      setOutput(logs);
      setIsRunning(false);
    }
  };

  const handleSubmit = () => {
    if (!testConfig) return;
    setIsSubmitting(true);
    setSubmitResult(null);
    setActiveTab('results');

    // Use setTimeout so UI updates before potentially blocking execution
    setTimeout(() => {
      try {
        const result = runTests(code, testConfig);
        setSubmitResult(result);
      } catch (err) {
        setOutput([`[Error] ${err instanceof Error ? err.message : String(err)}`]);
        setActiveTab('output');
      } finally {
        setIsSubmitting(false);
      }
    }, 10);
  };

  return (
    <section className="mb-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-display font-bold text-accent-green uppercase tracking-wider mb-3 cursor-pointer hover:text-accent-green/80 transition-colors"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
        >
          <path d="M4 2L8 6L4 10" />
        </svg>
        Code Playground
      </button>

      {expanded && (
        <div className="animate-fade-in border border-border rounded-lg overflow-hidden">
          {/* Editor toolbar */}
          <div className="border-b border-border">
            <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary">
              <span className="text-xs font-code text-text-muted">JavaScript</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={runCode}
                  disabled={isRunning || isSubmitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-green/20 text-accent-green text-xs font-semibold rounded hover:bg-accent-green/30 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                    <path d="M0 0L10 6L0 12V0Z" />
                  </svg>
                  {isRunning ? 'Running...' : 'Run'}
                </button>
                {testConfig && (
                  <button
                    onClick={handleSubmit}
                    disabled={isRunning || isSubmitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-cyan/20 text-accent-cyan text-xs font-semibold rounded hover:bg-accent-cyan/30 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    {isSubmitting ? 'Testing...' : `Submit (${testConfig.testCases.length} tests)`}
                  </button>
                )}
              </div>
            </div>
            <Editor
              height="300px"
              defaultLanguage="javascript"
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorMount}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                tabSize: 2,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>

          {/* Tab bar (shown when there's output or results) */}
          {(output.length > 0 || submitResult) && (
            <div className="flex border-b border-border bg-bg-tertiary">
              <button
                onClick={() => setActiveTab('output')}
                className={`px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'output'
                    ? 'text-accent-green border-b-2 border-accent-green'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Output
              </button>
              {testConfig && (
                <button
                  onClick={() => setActiveTab('results')}
                  className={`px-4 py-2 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'results'
                      ? 'text-accent-cyan border-b-2 border-accent-cyan'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  Test Results
                  {submitResult && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      submitResult.allPassed
                        ? 'bg-easy/20 text-easy'
                        : 'bg-accent-red/20 text-accent-red'
                    }`}>
                      {submitResult.totalPassed}/{submitResult.totalTests}
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Output panel */}
          {activeTab === 'output' && output.length > 0 && (
            <div className="bg-bg-primary p-4 max-h-[200px] overflow-y-auto">
              <div className="text-xs font-code text-text-muted mb-2 uppercase tracking-wider">
                Output
              </div>
              {output.map((line, i) => (
                <div
                  key={i}
                  className={`text-sm font-code leading-relaxed ${
                    line.startsWith('[Error]') || line.startsWith('[error]')
                      ? 'text-accent-red'
                      : line.startsWith('[warn]')
                      ? 'text-accent-orange'
                      : line.startsWith('\n---')
                      ? 'text-text-muted'
                      : 'text-accent-green'
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          )}

          {/* Test Results panel */}
          {activeTab === 'results' && submitResult && (
            <div className="bg-bg-primary max-h-[400px] overflow-y-auto">
              <TestResultsPanel result={submitResult} />
            </div>
          )}

          {activeTab === 'results' && !submitResult && (
            <div className="bg-bg-primary p-4 text-sm text-text-muted text-center">
              Click Submit to run tests
            </div>
          )}
        </div>
      )}
    </section>
  );
}
