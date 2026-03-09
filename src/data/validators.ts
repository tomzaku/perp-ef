/**
 * Custom validators for algorithm problems with multiple valid answers.
 * Referenced by name in each question's ## TestConfig section.
 */

/** Two Sum: any pair of distinct indices whose values sum to target */
function validateTwoSum(actual: unknown, args: unknown[]): boolean {
  if (!Array.isArray(actual) || actual.length !== 2) return false;
  const [i, j] = actual as number[];
  const nums = args[0] as number[];
  const target = args[1] as number;
  if (i === j || i < 0 || j < 0 || i >= nums.length || j >= nums.length) return false;
  return nums[i] + nums[j] === target;
}

/** 3Sum: all unique triplets that sum to zero, no duplicates */
function validateThreeSum(actual: unknown, args: unknown[]): boolean {
  if (!Array.isArray(actual)) return false;
  const nums = args[0] as number[];
  const triplets = actual as number[][];
  const numCounts = new Map<number, number>();
  for (const n of nums) numCounts.set(n, (numCounts.get(n) || 0) + 1);

  const seen = new Set<string>();
  for (const t of triplets) {
    if (!Array.isArray(t) || t.length !== 3) return false;
    if (t[0] + t[1] + t[2] !== 0) return false;
    const sorted = [...t].sort((a, b) => a - b);
    const key = sorted.join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    const used = new Map<number, number>();
    for (const v of t) used.set(v, (used.get(v) || 0) + 1);
    for (const [v, count] of used) {
      if ((numCounts.get(v) || 0) < count) return false;
    }
  }
  const allTriplets = new Set<string>();
  const sorted = [...nums].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 2; i++) {
    if (i > 0 && sorted[i] === sorted[i - 1]) continue;
    let lo = i + 1, hi = sorted.length - 1;
    while (lo < hi) {
      const sum = sorted[i] + sorted[lo] + sorted[hi];
      if (sum === 0) {
        allTriplets.add(`${sorted[i]},${sorted[lo]},${sorted[hi]}`);
        while (lo < hi && sorted[lo] === sorted[lo + 1]) lo++;
        while (lo < hi && sorted[hi] === sorted[hi - 1]) hi--;
        lo++; hi--;
      } else if (sum < 0) lo++;
      else hi--;
    }
  }
  return seen.size === allTriplets.size;
}

/** Group Anagrams: groups correct regardless of group/element order */
function validateGroupAnagrams(actual: unknown, args: unknown[]): boolean {
  if (!Array.isArray(actual)) return false;
  const strs = args[0] as string[];
  const groups = actual as string[][];

  const flat = groups.flat();
  if (flat.length !== strs.length) return false;

  const expected = new Map<string, string[]>();
  for (const s of strs) {
    const key = [...s].sort().join('');
    if (!expected.has(key)) expected.set(key, []);
    expected.get(key)!.push(s);
  }

  const actualMap = new Map<string, string[]>();
  for (const group of groups) {
    for (const s of group) {
      const key = [...s].sort().join('');
      if (!actualMap.has(key)) actualMap.set(key, []);
      actualMap.get(key)!.push(s);
    }
  }

  for (const group of groups) {
    if (group.length === 0) return false;
    const key = [...group[0]].sort().join('');
    for (const s of group) {
      if ([...s].sort().join('') !== key) return false;
    }
  }

  if (groups.length !== expected.size) return false;

  for (const [, expGroup] of expected) {
    const key = [...expGroup[0]].sort().join('');
    const actGroup = actualMap.get(key);
    if (!actGroup || actGroup.length !== expGroup.length) return false;
    if ([...actGroup].sort().join(',') !== [...expGroup].sort().join(',')) return false;
  }

  return true;
}

/** Registry of all validators by name */
export const validators: Record<string, (actual: unknown, args: unknown[]) => boolean> = {
  validateTwoSum,
  validateThreeSum,
  validateGroupAnagrams,
};
