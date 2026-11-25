// Incremental chapter saving, shared by the editor (planning) and the API (applying).
//
// The editor remembers a fingerprint of every question as the database last saw
// it (the "baseline"). A save then sends only the questions whose fingerprint
// changed, plus the new id order when questions were added, removed or moved.

export const MAX_CHAPTER_QUESTIONS = 1000;
// Saving a change that removes this many questions (or all of them) waits for an explicit confirmation.
export const LARGE_REMOVAL = 5;

export class ChapterSyncConflict extends Error {}

export const isLargeRemoval = (plan, baselineLength) => plan.removed > 0 && (plan.removed >= LARGE_REMOVAL || plan.removed === baselineLength);

// Fields that exist only in the browser and are never stored.
const clientOnly = question => {
  const { _justFilled, ...stored } = question;
  return stored;
};

// cyrb53: a fast 53-bit string hash. Collisions are vanishingly rare for this use
// (a collision only means one edit is not detected until the question changes again).
function cyrb53(text) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export const questionFingerprint = question => cyrb53(JSON.stringify(clientOnly(question)));

export const syncBaseline = questions => questions.map(question => [question.id, questionFingerprint(question)]);

const hasDuplicateOrMissingIds = ids => ids.some(id => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length;

// What has to be sent to make the database match the screen.
export function planChapterSync({ baseline, lockCount: savedLockCount = 0 }, questions, lockCount = 0) {
  const fingerprints = questions.map(questionFingerprint);
  const ids = questions.map(question => question.id);
  const baseIds = baseline.map(([id]) => id);
  const nextBaseline = ids.map((id, index) => [id, fingerprints[index]]);
  // Ids are how single questions are found in the database; without unique ids only a full save is safe.
  if (hasDuplicateOrMissingIds(ids) || hasDuplicateOrMissingIds(baseIds)) {
    return { empty: false, needsFullSave: true, upserts: [], removed: 0, nextBaseline };
  }
  const saved = new Map(baseline);
  const current = new Set(ids);
  const upserts = questions.filter((question, index) => saved.get(question.id) !== fingerprints[index]).map(clientOnly);
  const orderChanged = ids.length !== baseIds.length || ids.some((id, index) => id !== baseIds[index]);
  const removed = baseIds.filter(id => !current.has(id)).length;
  const lockChanged = lockCount !== savedLockCount;
  return {
    empty: !upserts.length && !orderChanged && !lockChanged,
    needsFullSave: false,
    upserts,
    ...(orderChanged && { order: ids }),
    ...(lockChanged && { lockCount }),
    removed,
    nextBaseline,
  };
}

// Server side of a structural save (questions added, removed or moved, or the bulk lock changed).
// Only the first `loadedCount` questions were on the editor's screen; the rest are kept as they are.
export function applyChapterPatch(existing, { loadedCount, order, upserts = [], lockCount }) {
  const stored = existing.questions || [];
  if (!Number.isSafeInteger(loadedCount) || loadedCount < 0 || loadedCount > stored.length) {
    throw new ChapterSyncConflict('The loaded question range no longer matches the database.');
  }
  const prefix = stored.slice(0, loadedCount);
  const savedById = new Map(prefix.map(question => [question.id, question]));
  const changedById = new Map(upserts.map(question => [question.id, question]));
  const ids = order ?? prefix.map(question => question.id);
  const questions = ids.map(id => {
    const question = changedById.get(id) ?? savedById.get(id);
    if (!question) throw new ChapterSyncConflict('A question this editor expected is no longer in the database.');
    return question;
  });
  const merged = [...questions, ...stored.slice(loadedCount)];
  if (merged.length > MAX_CHAPTER_QUESTIONS) throw new Error(`A maximum of ${MAX_CHAPTER_QUESTIONS} questions is allowed.`);
  const existingLock = existing.lockCount || 0;
  // A chapter-wide lock reaching past what was loaded cannot be changed from a partial view; it shifts with the edit.
  const nextLock = existingLock > loadedCount
    ? existingLock + questions.length - loadedCount
    : Math.min(lockCount ?? existingLock, questions.length);
  return { questions: merged, lockCount: nextLock };
}
