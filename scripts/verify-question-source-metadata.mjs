import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { LAN_IMPORT } from '../data/imports/cn-lan.mjs';
import { TCP_UDP_IP_IMPORT } from '../data/imports/cn-tcp-udp-ip.mjs';
import { ROUTING_APPLICATION_IMPORT } from '../data/imports/cn-routing-application.mjs';
import { CPU_ADDRESSING_IMPORT } from '../data/imports/coa-cpu-addressing.mjs';
import { CONTROL_UNIT_IMPORT } from '../data/imports/coa-control-unit.mjs';
import { INSTRUCTIONS_PIPELINE_IMPORT } from '../data/imports/coa-instructions-pipeline.mjs';

const root = path.resolve('tmp/question-syntax-audit');
const chapters = JSON.parse(await fs.readFile(process.argv[2] || path.join(root, 'staged-chapters.json'), 'utf8'));
const results = [];
for (const source of [LAN_IMPORT, TCP_UDP_IP_IMPORT, ROUTING_APPLICATION_IMPORT, CPU_ADDRESSING_IMPORT, CONTROL_UNIT_IMPORT, INSTRUCTIONS_PIPELINE_IMPORT]) {
  const chapter = chapters.find(item => item.subject === source.subject && item.chapter === source.chapter);
  const imported = chapter.questions.filter(question => question.source?.sha256 === source.sourceHash);
  assert.equal(imported.length, source.questions.length);
  const numbers = imported.map(question => question.source.questionNumber);
  assert.equal(new Set(numbers).size, numbers.length);
  const sourceFile = path.join('C:/Users/Prince/Desktop/MadeEasy PYQ PDF', source.questions[0].source.file);
  assert.equal(createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex'), source.sourceHash);
  const retainedDifferences = [];
  for (const expected of source.questions) {
    const saved = imported.find(question => question.source.questionNumber === expected.source.questionNumber);
    assert.ok(saved);
    const view = saved.source.verifiedQuestion || saved;
    for (const field of ['questionNumber', 'file', 'sha256', 'pdfPages', 'bookPages', 'answerKeyPdfPage']) assert.deepEqual(saved.source[field], expected.source[field]);
    for (const field of ['questionType', 'correctOptions', 'natAnswer']) assert.deepEqual(view[field], expected[field], `${expected.source.questionNumber}: ${field}`);
    const fields = ['text', 'code', 'year', 'marks', 'setNum', 'diagram', 'optA', 'optB', 'optC', 'optD'];
    const differences = fields.filter(field => (saved[field] || '') !== (expected[field] || ''));
    if (differences.length) retainedDifferences.push({ number: expected.source.questionNumber, id: saved.id, fields: differences, hasVerifiedSourceVersion: Boolean(saved.source.verifiedQuestion), previousReviewNotes: saved.source.reviewConflicts });
  }
  results.push({ subject: source.subject, chapter: source.chapter, sourceQuestions: imported.length,
    checksumMatches: true, uniqueCoverage: true, pageReferencesValid: true, savedSourceAnswersMatch: true, retainedDifferences });
}
const result = { sourceBoundQuestions: results.reduce((sum, chapter) => sum + chapter.sourceQuestions, 0), results };
await fs.writeFile(path.join(root, 'source-metadata-report.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ sourceBoundQuestions: result.sourceBoundQuestions, chapters: results.length, retainedDifferences: results.reduce((sum, chapter) => sum + chapter.retainedDifferences.length, 0) }));
