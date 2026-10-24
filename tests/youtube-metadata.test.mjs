import test from 'node:test';
import assert from 'node:assert/strict';
import { buildYouTubeMetadata, buildYouTubeExport, cleanLatexForYoutube, normalizeTags, tagCost, youtubeCopyText, youtubeCsv } from '../src/lib/youtube-metadata.mjs';

const context = { subject: '1. Discrete Maths', chapter: '1. Mathematical Logic' };
const question = { id: 'q1', text: 'Which proposition is equivalent to $p \\Rightarrow q$? [IMG_1] [CODE]', year: '2024', marks: '2', rawTopic: 'Logical equivalence', optA: '$\\neg p \\vee q$', optB: 'IMG:1b', code: 'if (a < b && b > 0)\n  return a;', natAnswer: '7' };

test('metadata has focused bounded titles, no duplicate question, and no answer spoilers by default', () => {
  const data = buildYouTubeMetadata(question, { ...context, number: 3 });
  assert.match(data.video_title, /Logical equivalence/);
  assert.match(data.video_title, /GATE CSE 2024/);
  assert.match(data.video_title, /Q3$/);
  assert.ok(data.title_suggestions.every(title => title.length <= 100));
  assert.equal(data.description.match(/Which proposition/g).length, 1);
  assert.match(data.description, /\(A\) ¬\s*p ∨ q/);
  assert.match(data.description, /Diagram option/);
  assert.match(data.description, /a ‹ b && b › 0/);
  assert.doesNotMatch(data.description, /Answer:|\[CODE\]|\[IMG_1\]|IMG:1b|[<>]/);
  assert.equal(data.thumbnail_file, 'Question_3.png');
});
test('blank placeholders are skipped while original numbering and stable ids are preserved', () => {
  const data = buildYouTubeExport([{ ...question }, { id: 'blank', isBlank: true }, { ...question, id: 'q3' }], context, { q3: { title: 'My exact title', description: 'My custom copy' } });
  assert.deepEqual(data.map(item => item.index), [1, 3]);
  assert.equal(data[1].video_title, 'My exact title');
  assert.equal(data[1].description, 'My custom copy');
  assert.equal(data[1].thumbnail_file, 'Question_3.png');
  assert.match(youtubeCopyText(data[0]), /^TITLE\n.*\n\nDESCRIPTION\n/s);
});
test('math conversion retains operator, fraction and exponent meaning', () => {
  assert.equal(cleanLatexForYoutube('$\\frac{x_{i}}{2} \\geq 0 \\wedge x \\notin A$'), '(x_(i))/(2) ≥ 0 ∧ x ∉ A');
  assert.equal(cleanLatexForYoutube('$\\sqrt{n} \\leq 2^{k}$'), '√(n) ≤ 2^(k)');
  assert.equal(cleanLatexForYoutube('x < y > z'), 'x ‹ y › z');
});
test('long content stays within platform limits and keeps the unique question suffix', () => {
  const data = buildYouTubeMetadata({ ...question, rawTopic: 'Long topic '.repeat(40), text: 'Question body '.repeat(1000) }, { ...context, number: 61 });
  assert.ok(data.video_title.length <= 100);
  assert.match(data.video_title, /Q61$/);
  assert.ok(data.description.length <= 5000);
  assert.match(data.description, /#GATECSE/);
  assert.ok(tagCost(data.tags) <= 500);
});
test('overlong or empty custom metadata is reported instead of silently changing the draft', () => {
  const data = buildYouTubeMetadata(question, { ...context, draft: { title: 'x'.repeat(101), description: '' } });
  assert.equal(data.video_title.length, 101);
  assert.deepEqual(data.warnings, ['Title exceeds 100 characters.', 'Add a description.']);
});
test('tags are unique and fit the actual comma and quote budget', () => {
  const tags = normalizeTags(['GATE CSE', 'gate cse', ...Array.from({ length: 100 }, (_, n) => `topic ${n}`)]);
  assert.equal(tags.filter(tag => /gate cse/i.test(tag)).length, 1);
  assert.ok(tagCost(tags) <= 500);
});
test('CSV quotes multiline descriptions and guards spreadsheet formulas', () => {
  const csv = youtubeCsv([{ index: 1, video_title: '=HYPERLINK("x")', description: 'Line one\nLine "two"', tags: ['GATE', 'CSE'] }]);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.match(csv, /"'=HYPERLINK\(""x""\)"/);
  assert.match(csv, /"Line one\nLine ""two"""/);
});
test('only safe configured links and explicitly requested answers are included', () => {
  const data = buildYouTubeMetadata(question, { ...context, settings: { website: 'javascript:alert(1)', playlistUrl: 'https://youtube.com/playlist?list=abc', includeAnswer: true } });
  assert.doesNotMatch(data.description, /javascript:/);
  assert.match(data.description, /Chapter playlist: https:\/\/youtube.com/);
  assert.match(data.description, /Answer: 7/);
});
