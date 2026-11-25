// Server-only: per-chapter answer coverage plus the reviewed answer file status.
// Used by /api/gatetopicanswers and scripts/topic-answers/coverage.mjs; reads only.
import fs from 'node:fs/promises';
import path from 'node:path';
import { TOPIC_ANSWER_DIR, chapterAnswerCoverage, validateTopicAnswerFile } from './topic-answers.mjs';

// Only the fields that decide whether a question has a stored answer.
export const COVERAGE_PROJECTION = Object.fromEntries(['subject', 'chapter', 'updatedAt',
  ...['id', 'isBlank', 'isProof', 'questionType', 'correctOptions', 'natAnswer', 'natRange', 'answerDisposition', 'awardMarksToAll', 'datasetId', 'optA', 'optB', 'optC', 'optD']
    .map(field => `questions.${field}`)].map(field => [field, 1]));

async function answerFileStatus(slug, root) {
  const file = path.join(root, TOPIC_ANSWER_DIR, `${slug}.json`);
  try {
    const reviewed = validateTopicAnswerFile(JSON.parse(await fs.readFile(file, 'utf8')));
    return { exists: true, valid: true, reviewedAt: reviewed.reviewedAt || '', entries: reviewed.questions.length,
      notes: reviewed.questions.filter(entry => entry.status === 'verified-with-note').length };
  } catch (error) {
    if (error.code === 'ENOENT') return { exists: false };
    return { exists: true, valid: false, error: String(error.message).slice(0, 300) };
  }
}

export async function topicCoverageRows(chapters, root = process.cwd()) {
  return Promise.all(chapters.map(async chapter => {
    const coverage = chapterAnswerCoverage(chapter);
    return { ...coverage, missing: coverage.missing.slice(0, 200), answerFile: await answerFileStatus(coverage.slug, root) };
  }));
}
