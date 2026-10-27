import { createHash } from 'node:crypto';
import Chapter from '@/models/Chapter';
import MockPaper from '@/models/MockPaper';
import { questionBank, publicQuestion, paperKey, paperCoverage, gradeAttempt } from './gatemock.mjs';

export const tokenHash = token => createHash('sha256').update(token).digest('hex');
export async function readMockBank() {
  const [chapters, papers] = await Promise.all([Chapter.find({}).lean(), MockPaper.find({}).lean()]);
  return { bank: questionBank(chapters), papers };
}
export function mockCatalog(bank, papers) {
  const subjects = [...new Set(bank.map(q => q.subject))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const groups = new Map();
  for (const q of bank) {
    const key = paperKey(q);
    if (!groups.has(key)) groups.set(key, { id: key, year: q.year, examPaper: q.examPaper, setNum: q.setNum || '', available: 0 });
    groups.get(key).available++;
  }
  for (const paper of papers) if (!groups.has(paperKey(paper))) groups.set(paperKey(paper), { id: paperKey(paper), year: paper.year, examPaper: paper.examPaper, setNum: paper.setNum, available: 0 });
  return { subjects: subjects.map(subject => ({ subject, count: bank.filter(q => q.subject === subject).length,
    topics: [...new Set(bank.filter(q => q.subject === subject).map(q => q.chapter))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) })),
    years: [...groups.values()].map(group => { const paper = papers.find(p => paperKey(p) === group.id); return { ...group, paper: paper || null, coverage: paper ? paperCoverage(bank, paper) : null }; }).sort((a, b) => Number(b.year) - Number(a.year) || a.id.localeCompare(b.id)),
    count: bank.length };
}
export function publicAttempt(attempt) {
  return { id: attempt._id, title: attempt.title, questions: attempt.questions.map(publicQuestion), warnings: attempt.warnings,
    exact: attempt.exact, startedAt: attempt.startedAt, expiresAt: attempt.expiresAt, finishedAt: attempt.finishedAt || null,
    durationMinutes: attempt.durationMinutes, negativeFraction: attempt.negativeFraction, state: attempt.state,
    revision: attempt.revision, result: attempt.finishedAt ? attempt.result : null, serverNow: new Date() };
}
export async function finishExpired(Model, attempt) {
  if (!attempt.finishedAt && Date.now() >= new Date(attempt.expiresAt).getTime()) {
    return await Model.findOneAndUpdate({ _id: attempt._id, revision: attempt.revision, finishedAt: null },
      { $set: { finishedAt: new Date(), result: gradeAttempt(attempt.questions, attempt.state, attempt.negativeFraction) }, $inc: { revision: 1 } }, { new: true }).lean()
      || await Model.findById(attempt._id).lean();
  }
  return attempt;
}
