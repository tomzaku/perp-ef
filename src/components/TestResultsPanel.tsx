import { useState } from 'react';
import type { SubmitResult, TestResult } from '../lib/testRunner';

function formatValue(val: unknown): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

function TestCaseCard({ result }: { result: TestResult }) {
  const [expanded, setExpanded] = useState(!result.passed);

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-colors ${
        result.passed
          ? 'border-easy/30 bg-easy/5'
          : 'border-accent-red/30 bg-accent-red/5'
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
      >
        {/* Pass/Fail icon */}
        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
          result.passed ? 'bg-easy/20 text-easy' : 'bg-accent-red/20 text-accent-red'
        }`}>
          {result.passed ? '✓' : '✗'}
        </span>

        <span className="text-sm font-medium text-text-primary flex-1 text-left">
          Test Case {result.index + 1}
        </span>

        <span className="text-xs font-code text-text-muted">
          {result.executionTimeMs.toFixed(1)}ms
        </span>

        <svg
          width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
          className={`transition-transform duration-200 text-text-muted ${expanded ? 'rotate-90' : ''}`}
        >
          <path d="M4 2L8 6L4 10" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-1.5 border-t border-border/50">
          <div className="pt-2 text-xs font-code">
            <span className="text-text-muted">Input: </span>
            <span className="text-accent-cyan">{result.input.map(formatValue).join(', ')}</span>
          </div>
          <div className="text-xs font-code">
            <span className="text-text-muted">Expected: </span>
            <span className="text-easy">{formatValue(result.expected)}</span>
          </div>
          {!result.passed && (
            <>
              <div className="text-xs font-code">
                <span className="text-text-muted">Actual: </span>
                <span className="text-accent-red">{result.error || formatValue(result.actual)}</span>
              </div>
              {result.stack && (
                <div className="mt-2 p-2 bg-accent-red/5 border border-accent-red/10 rounded text-[11px] font-code text-accent-red/80 overflow-x-auto whitespace-pre leading-relaxed">
                  {result.stack}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function TestResultsPanel({ result }: { result: SubmitResult }) {
  return (
    <div className="p-4 space-y-4">
      {/* Summary header */}
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${
        result.allPassed
          ? 'bg-easy/10 border-easy/30'
          : 'bg-accent-red/10 border-accent-red/30'
      }`}>
        <span className={`text-2xl ${result.allPassed ? 'text-easy' : 'text-accent-red'}`}>
          {result.allPassed ? '✓' : '✗'}
        </span>
        <div className="flex-1">
          <div className={`text-sm font-bold ${result.allPassed ? 'text-easy' : 'text-accent-red'}`}>
            {result.allPassed ? 'All Tests Passed!' : `${result.totalPassed} / ${result.totalTests} Passed`}
          </div>
          <div className="text-xs text-text-muted">
            Total time: {result.totalTimeMs.toFixed(1)}ms
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-24 h-2 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${result.allPassed ? 'bg-easy' : 'bg-accent-red'}`}
            style={{ width: `${(result.totalPassed / result.totalTests) * 100}%` }}
          />
        </div>
      </div>

      {/* Test case list */}
      <div className="space-y-2">
        {result.results.map((r) => (
          <TestCaseCard key={r.index} result={r} />
        ))}
      </div>
    </div>
  );
}
