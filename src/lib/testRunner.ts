import type { TestConfig, DataStructureType, ArgType } from '../types/question';

/** Strip internal Function() wrapper frames, keep only user code lines */
function cleanStack(stack: string | undefined): string | undefined {
  if (!stack) return undefined;
  const lines = stack.split('\n');
  const cleaned = lines.filter(line => {
    const trimmed = line.trim();
    // Keep the error message line
    if (!trimmed.startsWith('at ')) return true;
    // Filter out browser/engine internals and Function wrapper
    if (trimmed.includes('Function (')) return false;
    if (trimmed.includes('runTests')) return false;
    if (trimmed.includes('testRunner')) return false;
    if (trimmed.includes('node_modules')) return false;
    return true;
  });
  return cleaned.join('\n').trim() || undefined;
}

export interface TestResult {
  index: number;
  passed: boolean;
  input: unknown[];
  expected: unknown;
  actual: unknown;
  error?: string;
  stack?: string;
  executionTimeMs: number;
  isHidden: boolean;
}

export interface SubmitResult {
  results: TestResult[];
  totalPassed: number;
  totalTests: number;
  allPassed: boolean;
  totalTimeMs: number;
}

// Data structure source code injected into user's execution scope
const DATA_STRUCTURES_CODE = `
function ListNode(val, next) {
  this.val = (val === undefined ? 0 : val);
  this.next = (next === undefined ? null : next);
}

function TreeNode(val, left, right) {
  this.val = (val === undefined ? 0 : val);
  this.left = (left === undefined ? null : left);
  this.right = (right === undefined ? null : right);
}

function __arrayToLinkedList(arr) {
  if (!arr || arr.length === 0) return null;
  var head = new ListNode(arr[0]);
  var curr = head;
  for (var i = 1; i < arr.length; i++) {
    curr.next = new ListNode(arr[i]);
    curr = curr.next;
  }
  return head;
}

function __linkedListToArray(head) {
  var result = [];
  var seen = new Set();
  var curr = head;
  while (curr !== null) {
    if (seen.has(curr)) break;
    seen.add(curr);
    result.push(curr.val);
    curr = curr.next;
  }
  return result;
}

function __arrayToLinkedListCycle(arr, pos) {
  if (!arr || arr.length === 0) return null;
  var head = new ListNode(arr[0]);
  var curr = head;
  var cycleTarget = null;
  if (pos === 0) cycleTarget = head;
  for (var i = 1; i < arr.length; i++) {
    curr.next = new ListNode(arr[i]);
    curr = curr.next;
    if (i === pos) cycleTarget = curr;
  }
  if (cycleTarget !== null) curr.next = cycleTarget;
  return head;
}

function __arrayToTree(arr) {
  if (!arr || arr.length === 0 || arr[0] === null) return null;
  var root = new TreeNode(arr[0]);
  var queue = [root];
  var i = 1;
  while (i < arr.length) {
    var node = queue.shift();
    if (i < arr.length && arr[i] !== null) {
      node.left = new TreeNode(arr[i]);
      queue.push(node.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null) {
      node.right = new TreeNode(arr[i]);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

function __treeToArray(root) {
  if (!root) return [];
  var result = [];
  var queue = [root];
  while (queue.length > 0) {
    var node = queue.shift();
    if (node === null) {
      result.push(null);
    } else {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    }
  }
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }
  return result;
}
`;

function buildConversionCode(
  argTypes: ArgType[] | undefined,
  argCount: number
): string {
  if (!argTypes) return '';
  const lines: string[] = [];
  for (let i = 0; i < argCount; i++) {
    const t = argTypes[i];
    if (t === 'linkedList') {
      lines.push(`  __args[${i}] = __arrayToLinkedList(__args[${i}]);`);
    } else if (t === 'linkedListCycle') {
      // args[i] is [values, pos]
      lines.push(`  var __lcData = __args[${i}]; __args[${i}] = __arrayToLinkedListCycle(__lcData[0], __lcData[1]);`);
    } else if (t === 'tree') {
      lines.push(`  __args[${i}] = __arrayToTree(__args[${i}]);`);
    }
  }
  return lines.join('\n');
}

function buildReturnConversion(returnType?: DataStructureType): string {
  if (!returnType || returnType === 'primitive' || returnType === 'array' || returnType === 'matrix') {
    return '';
  }
  if (returnType === 'linkedList') {
    return '  __result = __linkedListToArray(__result);';
  }
  if (returnType === 'tree') {
    return '  __result = __treeToArray(__result);';
  }
  return '';
}

function deepEqual(a: unknown, b: unknown, compareType?: 'exact' | 'sorted' | 'setEqual'): boolean {
  if (compareType === 'sorted') {
    const sa = JSON.stringify(Array.isArray(a) ? [...a].sort() : a);
    const sb = JSON.stringify(Array.isArray(b) ? [...b].sort() : b);
    return sa === sb;
  }
  if (compareType === 'setEqual') {
    if (!Array.isArray(a) || !Array.isArray(b)) return JSON.stringify(a) === JSON.stringify(b);
    if (a.length !== b.length) return false;
    const sa = a.map(x => JSON.stringify(x)).sort();
    const sb = b.map(x => JSON.stringify(x)).sort();
    return JSON.stringify(sa) === JSON.stringify(sb);
  }
  return JSON.stringify(a) === JSON.stringify(b);
}

export function runTests(userCode: string, testConfig: TestConfig): SubmitResult {
  const startTotal = performance.now();
  const results: TestResult[] = [];
  const { functionName, argTypes, returnType, compareType, validator, testCases } = testConfig;

  // Build the full code that will be evaluated once to extract the function
  const extractCode = `
${DATA_STRUCTURES_CODE}
${userCode}
return typeof ${functionName} !== 'undefined' ? ${functionName} : undefined;
`;

  let userFn: ((...args: unknown[]) => unknown) | undefined;
  try {
    userFn = new Function(extractCode)() as ((...args: unknown[]) => unknown) | undefined;
  } catch (err) {
    // Compilation error — all tests fail
    const error = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? cleanStack(err.stack) : undefined;
    for (let i = 0; i < testCases.length; i++) {
      results.push({
        index: i,
        passed: false,
        input: testCases[i].args,
        expected: testCases[i].expected,
        actual: undefined,
        error: `Compilation Error: ${error}`,
        stack,
        executionTimeMs: 0,
        isHidden: testCases[i].isHidden ?? false,
      });
    }
    return {
      results,
      totalPassed: 0,
      totalTests: testCases.length,
      allPassed: false,
      totalTimeMs: performance.now() - startTotal,
    };
  }

  if (!userFn) {
    for (let i = 0; i < testCases.length; i++) {
      results.push({
        index: i,
        passed: false,
        input: testCases[i].args,
        expected: testCases[i].expected,
        actual: undefined,
        error: `Function "${functionName}" not found. Make sure your function is named "${functionName}".`,
        executionTimeMs: 0,
        isHidden: testCases[i].isHidden ?? false,
      });
    }
    return {
      results,
      totalPassed: 0,
      totalTests: testCases.length,
      allPassed: false,
      totalTimeMs: performance.now() - startTotal,
    };
  }

  // Now we need to run tests with data structure conversions
  // We build a runner function that has access to the DS helpers
  const runnerCode = `
${DATA_STRUCTURES_CODE}
${userCode}

return function(__args) {
${buildConversionCode(argTypes, 10)}
  var __result = ${functionName}.apply(null, __args);
${buildReturnConversion(returnType)}
  return __result;
};
`;

  let runner: ((args: unknown[]) => unknown) | undefined;
  try {
    runner = new Function(runnerCode)() as (args: unknown[]) => unknown;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? cleanStack(err.stack) : undefined;
    for (let i = 0; i < testCases.length; i++) {
      results.push({
        index: i,
        passed: false,
        input: testCases[i].args,
        expected: testCases[i].expected,
        actual: undefined,
        error: `Compilation Error: ${error}`,
        stack,
        executionTimeMs: 0,
        isHidden: testCases[i].isHidden ?? false,
      });
    }
    return {
      results,
      totalPassed: 0,
      totalTests: testCases.length,
      allPassed: false,
      totalTimeMs: performance.now() - startTotal,
    };
  }

  let totalPassed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const args = JSON.parse(JSON.stringify(tc.args)); // deep clone
    const start = performance.now();

    try {
      const actual = runner!(args);
      const elapsed = performance.now() - start;
      const passed = validator
        ? validator(actual, tc.args)
        : deepEqual(actual, tc.expected, compareType);
      if (passed) totalPassed++;

      results.push({
        index: i,
        passed,
        input: tc.args,
        expected: tc.expected,
        actual,
        executionTimeMs: elapsed,
        isHidden: tc.isHidden ?? false,
      });
    } catch (err) {
      const elapsed = performance.now() - start;
      results.push({
        index: i,
        passed: false,
        input: tc.args,
        expected: tc.expected,
        actual: undefined,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? cleanStack(err.stack) : undefined,
        executionTimeMs: elapsed,
        isHidden: tc.isHidden ?? false,
      });
    }
  }

  return {
    results,
    totalPassed,
    totalTests: testCases.length,
    allPassed: totalPassed === testCases.length,
    totalTimeMs: performance.now() - startTotal,
  };
}
