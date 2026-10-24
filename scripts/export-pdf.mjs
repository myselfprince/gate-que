import fs from 'node:fs/promises';
import path from 'node:path';
import { exportQuestionPdf } from '../src/lib/pdf-export.mjs';

const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('Usage: npm run export:pdf -- chapter.json output.pdf');
const payload = JSON.parse(await fs.readFile(input, 'utf8'));
const result = await exportQuestionPdf(payload, { onProgress: progress => console.log(progress.phase === 'answers' ? 'Building separate answer key...' : progress.phase === 'checking' ? 'Checking completed PDF...' : `${progress.completed}/${progress.total} questions compiled`) });
await fs.mkdir(path.dirname(path.resolve(output)), { recursive: true });
await fs.writeFile(output, result.pdf);
if (result.answerKey) await fs.writeFile(output.replace(/\.pdf$/i, '') + '.answer-key.pdf', result.answerKey);
await fs.writeFile(`${output}.qa.json`, JSON.stringify(result.report, null, 2));
console.log(`Saved ${result.report.pages} pages to ${output}. Layout warnings: ${result.report.warnings.length}`);
