export const INITIAL_TARGETS = {
  '1. Discrete Maths|1. Mathematical Logic': 59,
  '1. Discrete Maths|2. Set Theory and Algebra': 100,
  '1. Discrete Maths|3. Combinatorics': 42,
  '1. Discrete Maths|4. Graph Theory': 65,
};

export function chapterProgress(subject, chapter, actualCounts = {}, targetCounts = {}) {
  const key = `${subject}|${chapter}`;
  const added = Number(actualCounts[key]) || 0;
  const target = Number(targetCounts[key] ?? INITIAL_TARGETS[key]) || 0;
  return { added, target, complete: target > 0 && added >= target };
}

export function sortCompletedLast(items, isComplete) {
  return items.filter(item => !isComplete(item)).concat(items.filter(isComplete));
}
