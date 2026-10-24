import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSolutionUrl } from '../src/lib/solution-links.mjs';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';

test('solution links round-trip through question metadata with video timestamps', () => {
  const expected = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3723s';
  const metadata = normalizeQuestionMetadata({ solutionUrl: 'https://youtu.be/dQw4w9WgXcQ?t=1h2m3s&si=tracking' });
  assert.equal(metadata.solutionUrl, expected);
  assert.deepEqual(normalizeQuestionMetadata(metadata), metadata);
  assert.equal(normalizeSolutionUrl('https://youtube.com/shorts/dQw4w9WgXcQ'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  for (const url of ['javascript:alert(1)', 'https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ', 'https://youtube.com/playlist?list=123', 'https://youtu.be/dQw4w9WgXcQ?t=bad']) assert.throws(() => normalizeSolutionUrl(url));
});

test('question PDFs print clickable website and solution footers without leaking answers', () => {
  const tex = buildQuestionPages({ subject: 'CN', chapter: 'LAN', questions: [{ text: 'Question', solutionUrl: 'https://youtu.be/dQw4w9WgXcQ?t=90', natAnswer: 'secret' }] });
  assert.match(tex, /\\href\{https:\/\/g4gate\.com\}\{g4gate\.com\}/);
  assert.match(tex, /watch\?v=dQw4w9WgXcQ&t=90s\}\{Watch video solution\}/);
  assert.doesNotMatch(tex, /secret/);
});
