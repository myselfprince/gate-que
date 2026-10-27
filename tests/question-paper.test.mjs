import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';
import { reconcileQuestionExamMetadata } from '../src/lib/question-exam-metadata.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';
import { buildYouTubeMetadata } from '../src/lib/youtube-metadata.mjs';
import { mergeChapterImport } from '../src/lib/chapter-import.mjs';

test('CS/IT paper and official numbering survive validation without conflating book numbering', () => {
  assert.deepEqual(normalizeQuestionMetadata({ examPaper: 'IT', paperQuestionNumber: '85' }), { examPaper: 'IT', paperQuestionNumber: '85' });
  assert.deepEqual(normalizeQuestionMetadata({}), {});
  for (const value of [{ examPaper: 'EC' }, { paperQuestionNumber: '0' }, { paperQuestionNumber: '1.5' }]) assert.throws(() => normalizeQuestionMetadata(value));
  const q = reconcileQuestionExamMetadata({ text: 'Stem [GATE IT 2006 | 2 Marks]', examPaper: 'CS' }).question;
  assert.equal(q.examPaper, 'IT'); assert.equal(q.year, '2006');
  assert.match(buildQuestionPages({ subject: 'TOC', chapter: 'PDA', questions: [q] }), /GATE IT 2006/);
  assert.match(buildQuestionPages({ subject: 'TOC', chapter: 'PDA', questions: [{ year: '2006', text: 'Stem' }] }), /GATE CS 2006/);
  assert.match(buildYouTubeMetadata(q, { subject: 'TOC', chapter: 'PDA' }).video_title, /GATE IT 2006/);
});

test('identical CS and IT stems are distinct imports', () => {
  const q = { id: 'cs', text: 'Stem', year: '2006', optA: 'A', examPaper: 'CS' };
  assert.equal(mergeChapterImport([q], [{ ...q, id: 'it', examPaper: 'IT' }]).added, 1);
});
