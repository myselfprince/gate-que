// Apply a reviewed topic answer file to its chapter.
//
//   node scripts/topic-answers/apply.mjs data/topic-answers/<slug>.json          # dry run (default)
//   node scripts/topic-answers/apply.mjs data/topic-answers/<slug>.json --write  # backup, write, verify
//
// Only answer fields change: questionType, correctOptions, natAnswer, natRange and
// documented answerDisposition/specialNote. The write is refused if any question's
// content, position or id differs from the reviewed file, if a different answer is
// already stored (unless the entry sets replaceExisting), or if the chapter changes
// between reading and writing. Saving the chapter bumps updatedAt, so an editor tab
// loaded earlier gets "Reload it before saving" instead of overwriting the answers.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { storedAnswerText } from '../../src/lib/question-answers.mjs';
import { planTopicAnswerUpdate, topicAnswerUpdateDocument } from '../../src/lib/topic-answers.mjs';
import { coverageLine, databaseLabel, readCoverage, withChapters, writeBackup } from './lib.mjs';

const file = process.argv[2];
const write = process.argv.includes('--write');
if (!file || !file.endsWith('.json')) throw new Error('Pass the reviewed answer file, e.g. data/topic-answers/<slug>.json');
const answers = JSON.parse(await fs.readFile(file, 'utf8'));

const ANSWER_FIELDS = new Set(['questionType', 'correctOptions', 'natAnswer', 'natRange', 'answerDisposition', 'specialNote']);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const withoutAnswers = question => Object.fromEntries(Object.entries(question).filter(([key]) => !ANSWER_FIELDS.has(key)).sort(([a], [b]) => a.localeCompare(b)));

await withChapters(async collection => {
  const chapter = await collection.findOne({ subject: answers.subject, chapter: answers.chapter });
  if (!chapter) throw new Error(`Chapter not found: ${answers.subject} / ${answers.chapter}`);
  const plan = planTopicAnswerUpdate(chapter, answers);
  console.log(`${databaseLabel()} · ${chapter.subject} / ${chapter.chapter} · ${chapter.questions.length} questions · updatedAt ${chapter.updatedAt.toISOString()}`);
  if (plan.errors.length) {
    console.error(`Refusing: ${plan.errors.length} problem(s).\n- ${plan.errors.join('\n- ')}`);
    process.exitCode = 1;
    return;
  }
  for (const change of plan.changes) {
    const before = storedAnswerText(chapter.questions[change.position - 1]) || '(none)';
    const after = change.after.questionType === 'NAT' ? change.after.natRange ? `${change.after.natRange.min} to ${change.after.natRange.max}` : change.after.natAnswer : change.after.correctOptions.map(letter => `(${letter})`).join(', ');
    console.log(`Q${change.position} ${change.after.questionType}: ${before} → ${after} [${Object.keys(change.set).join(', ')}]`);
  }
  console.log(`${plan.changes.length} to update · ${plan.unchanged} already correct`);
  if (!write) { console.log('Dry run only. Re-run with --write to back up and apply.'); return; }
  if (!plan.changes.length) { console.log('Nothing to write.'); return; }

  const backup = await writeBackup(answers.slug, 'before-apply', chapter);
  const { update, options } = topicAnswerUpdateDocument(plan.changes);
  const result = await collection.updateOne({ _id: chapter._id, updatedAt: chapter.updatedAt }, update, options);
  if (result.matchedCount !== 1) throw new Error('The chapter changed while applying. Nothing was written; reload and re-run.');

  // Verify the saved document: same questions in the same order, only answer fields changed.
  const saved = await collection.findOne({ _id: chapter._id });
  const problems = [];
  if (saved.questions.length !== chapter.questions.length) problems.push('Question count changed.');
  if ((saved.lockCount ?? 0) !== (chapter.lockCount ?? 0)) problems.push('Lock count changed.');
  saved.questions.forEach((question, index) => {
    if (hash(withoutAnswers(question)) !== hash(withoutAnswers(chapter.questions[index] || {}))) problems.push(`Q${index + 1} non-answer fields changed.`);
  });
  const recheck = planTopicAnswerUpdate(saved, answers);
  if (recheck.errors.length || recheck.changes.length) problems.push(`Post-write check: ${recheck.errors.length} errors, ${recheck.changes.length} pending changes.`);
  if (problems.length) throw new Error(`Verification failed after writing (restore from ${backup} if needed):\n- ${problems.join('\n- ')}`);
  const coverage = (await readCoverage(collection)).find(row => row.subject === chapter.subject && row.chapter === chapter.chapter);
  console.log(`Wrote ${plan.changes.length} answers. Verified: only answer fields changed, order and content intact.\nBackup: ${backup}\n${coverageLine(coverage)}`);
});
