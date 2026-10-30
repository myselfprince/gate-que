import fs from 'node:fs/promises';
import path from 'node:path';
import { preparePaperAssets } from '../src/lib/year-paper-assets-server.mjs';

const flag = process.argv.indexOf('--output');
const output = path.resolve(flag < 0 ? 'output/g4gate-paper-packages' : process.argv[flag + 1]);
await fs.mkdir(output, { recursive: true });
const papers = [];
for (const filename of (await fs.readdir('data/papers')).sort()) {
  if (!/^gate-(cs|it)-\d{4}(?:-[a-z0-9-]+)?\.json$/.test(filename)) continue;
  const source = JSON.parse(await fs.readFile(path.join('data/papers', filename), 'utf8'));
  const { paper, documents } = await preparePaperAssets(source, path.resolve('public'));
  const assets = [...new Map(documents.map(document => [document._id, document])).values()]
    .map(document => ({ id: document._id, data: document.data.toString('base64') }));
  await fs.writeFile(path.join(output, filename), JSON.stringify({ format: 'g4gate-paper-package-v1', paper, assets }));
  papers.push({ slug: paper.slug, title: paper.title, year: paper.year, examPaper: paper.examPaper, setNum: paper.setNum,
    questionCount: paper.questionCount, totalMarks: paper.totalMarks, imageCount: assets.length });
}
await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify({ version: 1, papers }, null, 2) + '\n');
console.log(JSON.stringify({ papers: papers.length, questions: papers.reduce((sum, paper) => sum + paper.questionCount, 0), output }));
