import assert from 'node:assert/strict';
import {mergeReviewedImport, printedQuestion} from './cn-tcp-ip-merge.mjs';

// The book deliberately repeats Q5.4 as Q5.6. Only this reviewed pair may
// bypass the shared content fingerprint. Source identity still prevents repeats.
export function mergeTreesImport(existing, incoming) {
  let questions = structuredClone(existing);
  let added = 0;
  for (const q of incoming) {
    const sameSource = questions.filter(item => item.source?.sha256 === q.source.sha256
      && item.source.questionNumber === q.source.questionNumber);
    assert.ok(sameSource.length <= 1, `Duplicate source identity ${q.source.questionNumber}`);
    if (sameSource.length) continue;
    if (q.source.questionNumber === '5.6') {
      const printed4 = incoming.find(item => item.source.questionNumber === '5.4');
      const earlier = questions.find(item => item.source?.sha256 === q.source.sha256 && item.source.questionNumber === '5.4');
      assert.ok(earlier && printed4, 'Reviewed duplicate requires Q5.4');
      assert.deepEqual(printedQuestion({...q, source: undefined}), printedQuestion(printed4));
      assert.ok(!questions.some(item => item.id === q.id), 'Unreviewed duplicate ID');
      questions.push(structuredClone(q));
      added++;
    } else {
      const plan = mergeReviewedImport(questions, [q], []);
      questions = plan.questions;
      added += plan.added;
    }
  }
  assert.equal(new Set(questions.map(q => q.id)).size, questions.length, 'Duplicate IDs');
  return {questions, added, alreadyPresent: incoming.length-added};
}
