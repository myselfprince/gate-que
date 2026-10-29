import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSolutionUrl, normalizeGateOverflowUrl, safeGateOverflowUrl, solutionEmbedUrl } from '../src/lib/solution-links.mjs';
import { normalizeQuestionMetadata } from '../src/lib/question-metadata.mjs';
import { buildQuestionPages } from '../src/lib/question-pages.mjs';
import { normalizePdfSettings } from '../src/lib/pdf-settings.mjs';
import { pageDecorations } from '../src/lib/pdf-decorations.mjs';

test('review videos use validated IDs and preserve timestamps in privacy-enhanced embeds', () => {
  assert.equal(solutionEmbedUrl('https://youtu.be/dQw4w9WgXcQ?t=1m30s'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=90');
  assert.equal(solutionEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  for (const value of ['', undefined, 'javascript:alert(1)', 'https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ']) assert.equal(solutionEmbedUrl(value), '');
});

test('solution links round-trip through question metadata with video timestamps', () => {
  const expected = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3723s';
  const metadata = normalizeQuestionMetadata({ solutionUrl: 'https://youtu.be/dQw4w9WgXcQ?t=1h2m3s&si=tracking' });
  assert.equal(metadata.solutionUrl, expected);
  assert.deepEqual(normalizeQuestionMetadata(metadata), metadata);
  assert.equal(normalizeSolutionUrl('https://youtube.com/shorts/dQw4w9WgXcQ'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  for (const url of ['javascript:alert(1)', 'https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ', 'https://youtube.com/playlist?list=123', 'https://youtu.be/dQw4w9WgXcQ?t=bad']) assert.throws(() => normalizeSolutionUrl(url));
});

test('GateOverflow links preserve question and answer destinations through metadata validation', () => {
  const expected = 'https://gateoverflow.in/12345/question-title?show=67890#c67890';
  const metadata = normalizeQuestionMetadata({ solutionUrl: 'https://youtu.be/dQw4w9WgXcQ?t=90', gateOverflowUrl: ' http://www.gateoverflow.in/12345/question-title?show=67890#c67890 ' });
  assert.equal(metadata.gateOverflowUrl, expected);
  assert.deepEqual(normalizeQuestionMetadata(metadata), metadata);
  assert.equal(normalizeGateOverflowUrl(''), '');
  assert.equal(normalizeGateOverflowUrl(undefined), '');
  assert.equal(normalizeGateOverflowUrl('   '), '');
  assert.deepEqual(normalizeQuestionMetadata({}), {});
  assert.deepEqual(normalizeQuestionMetadata({ gateOverflowUrl: '' }), { gateOverflowUrl: '' });
  assert.equal(normalizeGateOverflowUrl('https://gateoverflow.in/12345?value={x}\\input'), 'https://gateoverflow.in/12345?value=%7Bx%7D%5Cinput');
  for (const url of ['javascript:alert(1)', 'https://gateoverflow.in.evil.test/123', 'https://evil.test/?url=https://gateoverflow.in/123', 'https://gateoverflow.in@evil.test/123', 'https://user:password@gateoverflow.in/123', 'https://gateoverflow.in:8080/123', 'https://gateoverflow.in/123\n456', 'not a URL', 'https://gateoverflow.in/' + 'x'.repeat(2000), null, 123]) {
    assert.throws(() => normalizeGateOverflowUrl(url));
    assert.throws(() => normalizeQuestionMetadata({ gateOverflowUrl: url }));
    assert.equal(safeGateOverflowUrl(url), '');
  }
});

test('question PDFs print website, YouTube and GateOverflow links without leaking answers', () => {
  const tex = buildQuestionPages({ subject: 'CN', chapter: 'LAN', pdfSettings: { showWebsite: true }, questions: [{ text: 'Question', solutionUrl: 'https://youtu.be/dQw4w9WgXcQ?t=90', gateOverflowUrl: 'https://gateoverflow.in/12345?show=67890#c67890', natAnswer: 'secret' }] });
  assert.match(tex, /\\href\{https:\/\/g4gate\.com\/\}\{g4gate\.com\}/);
  assert.match(tex, /watch\?v=dQw4w9WgXcQ&t=90s\}\{\\gateyoutubeicon\\hspace\{5pt\}Video sol\.\}/);
  assert.ok(tex.includes('\\href{https://gateoverflow.in/12345?show=67890\\#c67890}{GateOverflow sol.}'));
  assert.doesNotMatch(tex, /secret/);
});

test('each solution link is optional, independently positioned and hidden for blank pages', () => {
  const youtube = 'https://youtu.be/dQw4w9WgXcQ', gateOverflow = 'https://gateoverflow.in/12345';
  const render = (question, overrides = {}) => pageDecorations({ settings: normalizePdfSettings(overrides), question, page: 1, total: 1, foreground: 'white' });
  for (const [question, count] of [[{}, 0], [{ solutionUrl: youtube }, 1], [{ gateOverflowUrl: gateOverflow }, 1], [{ solutionUrl: youtube, gateOverflowUrl: gateOverflow }, 2], [{ isBlank: true, solutionUrl: youtube, gateOverflowUrl: gateOverflow }, 0]]) {
    const row = render(question);
    assert.equal((`${row.top}${row.bottom}`.match(/\\href\{/g) || []).length, count);
  }
  const both = { solutionUrl: youtube, gateOverflowUrl: gateOverflow };
  assert.doesNotMatch(render(both, { showSolutions: false }).top, /youtube/);
  assert.match(render(both, { showSolutions: false }).top, /gateoverflow/);
  assert.doesNotMatch(render(both, { showGateOverflow: false }).top, /gateoverflow/);
  assert.match(render(both, { showGateOverflow: false }).top, /youtube/);
  assert.doesNotMatch(render(both, { gateOverflowLabel: '' }).top, /gateoverflow/);
  const moved = render(both, { gateOverflowPosition: 'bottom-left', gateOverflowLabel: 'Read solution', gateOverflowFontSize: 12 });
  assert.match(moved.top, /youtube/);
  assert.doesNotMatch(moved.top, /gateoverflow/);
  assert.match(moved.bottom, /gateoverflow/);
  assert.match(moved.bottom, /\\fontsize\{12\}\{16\}/);
  assert.match(moved.bottom, /Read solution/);
});
