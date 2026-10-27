import { questionType, numericAnswerRange, storedAnswerText } from './question-answers.mjs';

export const PAPER_PATTERN_SOURCE = 'https://gate2026.iitg.ac.in/question-paper-pattern.html';
// Editable practice quotas, not an assertion of fixed official subject weightage.
export const DEFAULT_MOCK_BLUEPRINT = [
  ['13. General Aptitude', 5, 5], ['1. Discrete Maths', 2, 2], ['11. Engg. Maths', 3, 2],
  ['4. COA', 2, 3], ['5. Operating Systems', 2, 3], ['12. DBMS', 2, 4],
  ['3. Computer Networks', 2, 3], ['2. TOC', 2, 3], ['10. Compiler Design', 2, 2],
  ['9. Digital Logic', 2, 2], ['6. Data Structures', 3, 3], ['7. Algorithms', 2, 2], ['8. C Prog', 1, 1],
].map(([subject, one, two]) => ({ subject, one, two }));
export const paperKey = value => `${value.year}|${value.examPaper || 'CS'}|${value.setNum || ''}`;

export function questionBank(chapters) {
  return chapters.flatMap(chapter => (chapter.questions || []).filter(q => !q.isBlank && q.text?.trim()).map(q => ({
    ...q, key: `${chapter._id}:${q.id}`, chapterId: String(chapter._id), subject: chapter.subject,
    chapter: chapter.chapter, examPaper: q.examPaper || 'CS', questionType: questionType(q),
    chapterUpdatedAt: chapter.updatedAt,
  })));
}

export function validatePaper(value) {
  const year = String(value.year || '');
  const examPaper = value.examPaper || 'CS';
  const setNum = String(value.setNum || '').trim();
  if (!/^(19|20)\d{2}$/.test(year) || !['CS', 'IT'].includes(examPaper) || !/^[\w -]{0,16}$/.test(setNum)) throw new Error('Choose a valid year, CS/IT paper and set.');
  for (const [key, max] of [['questionCount', 250], ['totalMarks', 1000], ['durationMinutes', 360]]) {
    if (!Number.isInteger(value[key]) || value[key] < 1 || value[key] > max) throw new Error(`${key} must be an integer from 1 to ${max}.`);
  }
  if (typeof value.negativeFraction !== 'number' || !Number.isFinite(value.negativeFraction) || value.negativeFraction < 0 || value.negativeFraction > 1) throw new Error('MCQ penalty fraction must be between 0 and 1.');
  if (typeof value.verified !== 'boolean') throw new Error('Official paper verification must be a checkbox.');
  const sourceUrl = String(value.sourceUrl || '').trim();
  if (sourceUrl) {
    let url; try { url = new URL(sourceUrl); } catch { throw new Error('Enter a complete official paper URL.'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || sourceUrl.length > 2000) throw new Error('Official paper URL is invalid.');
  }
  return { year, examPaper, setNum, questionCount: value.questionCount, totalMarks: value.totalMarks, durationMinutes: value.durationMinutes, negativeFraction: value.negativeFraction, verified: value.verified, sourceUrl };
}

export function paperCoverage(bank, paper) {
  const candidates = bank.filter(q => paperKey(q) === paperKey(paper));
  const slots = new Map();
  const unassigned = [], outOfRange = [];
  for (const q of candidates) {
    if (!q.paperQuestionNumber) { unassigned.push(q.key); continue; }
    const number = Number(q.paperQuestionNumber);
    if (!Number.isInteger(number) || number < 1 || number > paper.questionCount) { outOfRange.push(q.key); continue; }
    slots.set(number, [...(slots.get(number) || []), q]);
  }
  const missing = Array.from({ length: paper.questionCount }, (_, i) => i + 1).filter(number => !slots.has(number));
  const duplicates = [...slots].filter(([, questions]) => questions.length > 1).map(([number, questions]) => ({ number, keys: questions.map(q => q.key) }));
  const ordered = [...slots].sort(([a], [b]) => a - b).flatMap(([, questions]) => questions.length === 1 ? questions : []);
  const marks = ordered.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  return { available: candidates.length, mapped: slots.size, expected: paper.questionCount, missing, duplicates, unassigned, outOfRange,
    marks, expectedMarks: paper.totalMarks, missingAnswers: ordered.filter(q => !storedAnswerText(q)).length,
    ready: paper.verified && !missing.length && !duplicates.length && !outOfRange.length && marks === paper.totalMarks };
}

const shuffle = (items, random) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
};
function deduplicate(bank) {
  const seen = new Set();
  return bank.filter(q => {
    const fingerprint = JSON.stringify([q.examPaper, q.year, q.setNum || '', q.text, q.code, q.optA, q.optB, q.optC, q.optD].map(value => String(value || '').replace(/\s+/g, ' ').trim()));
    if (seen.has(fingerprint)) return false;
    seen.add(fingerprint); return true;
  });
}

export function buildMock(bank, config, papers = [], random = Math.random) {
  if (!['subject', 'topic', 'full', 'year'].includes(config.mode) || !['CS', 'IT'].includes(config.examPaper || 'CS')) throw new Error('Choose a valid test mode and paper.');
  const pool = deduplicate(bank.filter(q => q.examPaper === (config.examPaper || 'CS')));
  const warnings = [];
  let questions, title, durationMinutes, negativeFraction = 1 / 3, exact = false;
  if (config.mode === 'year') {
    const identity = { year: String(config.year), examPaper: config.examPaper || 'CS', setNum: config.setNum || '' };
    const paper = papers.find(value => paperKey(value) === paperKey(identity));
    const coverage = paper && paperCoverage(bank, paper);
    if (coverage?.ready) {
      questions = bank.filter(q => paperKey(q) === paperKey(identity) && q.paperQuestionNumber).sort((a, b) => Number(a.paperQuestionNumber) - Number(b.paperQuestionNumber));
      durationMinutes = paper.durationMinutes; negativeFraction = paper.negativeFraction; exact = true;
    } else {
      if (!config.allowPartial) throw new Error('This paper is incomplete or its official order has not been verified. Check paper coverage or choose available-question practice.');
      questions = pool.filter(q => paperKey(q) === paperKey(identity)).sort((a, b) => (Number(a.paperQuestionNumber) || 10000) - (Number(b.paperQuestionNumber) || 10000) || a.key.localeCompare(b.key));
      warnings.push('Available-question practice: this is not the complete original paper. Missing questions and unverified ordering are shown in paper coverage.');
      durationMinutes = paper?.durationMinutes || 180;
      negativeFraction = paper?.negativeFraction ?? 1 / 3;
    }
    title = `GATE ${identity.examPaper} ${identity.year}${identity.setNum ? ` · Set ${identity.setNum}` : ''} · ${exact ? 'Original paper' : 'Available-question practice'}`;
  } else {
    const eligible = pool.filter(q => ['MCQ', 'MSQ', 'NAT'].includes(q.questionType) && [1, 2].includes(Number(q.marks)));
    if (config.mode === 'full') {
      if (!Array.isArray(config.blueprint) || !config.blueprint.length || config.blueprint.length > 40) throw new Error('Set subject quotas for your mock.');
      const subjects = new Set(); questions = [];
      let requested = 0;
      for (const row of config.blueprint) {
        if (typeof row.subject !== 'string' || !row.subject || subjects.has(row.subject)) throw new Error('Each blueprint subject must be unique.');
        subjects.add(row.subject);
        for (const [key, marks] of [['one', 1], ['two', 2]]) {
          const count = row[key];
          if (!Number.isInteger(count) || count < 0 || count > 100) throw new Error('Subject quotas must be integers from 0 to 100.');
          requested += count;
          const matches = shuffle(eligible.filter(q => q.subject === row.subject && Number(q.marks) === marks), random);
          if (matches.length < count) warnings.push(`${row.subject}: needs ${count} × ${marks}-mark questions; ${matches.length} available.`);
          questions.push(...matches.slice(0, count));
        }
      }
      if (!requested || requested > 250) throw new Error('Choose between 1 and 250 questions.');
      if (warnings.length && !config.allowPartial) throw new Error(`Not enough questions for these weights. ${warnings.join(' ')}`);
      questions = shuffle(questions, random);
      title = warnings.length ? 'Partial mock practice' : 'Subject-weighted mock';
    } else {
      if (typeof config.subject !== 'string' || !config.subject || (config.mode === 'topic' && (typeof config.chapter !== 'string' || !config.chapter))) throw new Error('Choose the subject and topic.');
      if (!Number.isInteger(config.count) || config.count < 1 || config.count > 250) throw new Error('Choose between 1 and 250 questions.');
      const matches = shuffle(eligible.filter(q => q.subject === config.subject && (config.mode !== 'topic' || q.chapter === config.chapter)), random);
      if (matches.length < config.count && !config.allowPartial) throw new Error(`Only ${matches.length} eligible questions are available for this selection.`);
      if (matches.length < config.count) warnings.push(`Using ${matches.length} available questions of ${config.count} requested.`);
      questions = matches.slice(0, config.count);
      title = config.mode === 'topic' ? config.chapter : config.subject;
    }
    durationMinutes = config.durationMinutes;
    if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 360) throw new Error('Choose a duration from 1 to 360 minutes.');
  }
  if (!questions.length) throw new Error('No questions are available for this selection.');
  if (questions.length > 250) throw new Error('This practice paper has more than 250 questions. Narrow the selection.');
  if (questions.some(q => !Number.isFinite(Number(q.marks)) || Number(q.marks) <= 0)) throw new Error('Some questions have invalid marks. Correct them in the editor first.');
  return { title, questions, warnings, durationMinutes, negativeFraction, exact, totalMarks: questions.reduce((sum, q) => sum + Number(q.marks), 0) };
}

export function publicQuestion(q, index) {
  return Object.fromEntries(Object.entries({
    key: q.key, number: index + 1, paperQuestionNumber: q.paperQuestionNumber || '', subject: q.subject, chapter: q.chapter,
    text: q.text, code: q.code || '', year: q.year, marks: q.marks, examPaper: q.examPaper || 'CS', setNum: q.setNum || '',
    questionType: questionType(q), diagram: q.diagram || '', ext: q.ext || '.png', isCodeOptions: Boolean(q.isCodeOptions),
    optA: q.optA || '', optB: q.optB || '', optC: q.optC || '', optD: q.optD || '',
  }));
}

export function validateAttemptState(value, questions) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.responses) || value.responses.length > questions.length) throw new Error('Invalid saved responses.');
  const byKey = new Map(questions.map(q => [q.key, q]));
  const seen = new Set();
  const responses = value.responses.map(response => {
    const question = byKey.get(response.key);
    if (!question || seen.has(response.key)) throw new Error('Response question is invalid or repeated.');
    seen.add(response.key);
    if (['MCQ', 'MSQ'].includes(questionType(question))) {
      if (!Array.isArray(response.value) || response.value.length > (questionType(question) === 'MCQ' ? 1 : 4)
        || new Set(response.value).size !== response.value.length || response.value.some(letter => !['A', 'B', 'C', 'D'].includes(letter) || !question[`opt${letter}`])) throw new Error('Invalid option response.');
      return { key: response.key, value: [...response.value].sort() };
    }
    if (typeof response.value !== 'string' || response.value.length > 100 || (response.value && !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(response.value))) throw new Error('Enter a valid numerical answer.');
    return { key: response.key, value: response.value };
  });
  const keys = key => {
    if (!Array.isArray(value[key]) || value[key].length > questions.length || value[key].some(item => !byKey.has(item))) throw new Error('Invalid question navigation state.');
    return [...new Set(value[key])];
  };
  if (!Number.isInteger(value.currentIndex) || value.currentIndex < 0 || value.currentIndex >= questions.length) throw new Error('Invalid current question.');
  return { responses, marked: keys('marked'), visited: keys('visited'), currentIndex: value.currentIndex };
}

export function gradeAttempt(questions, state, negativeFraction = 1 / 3) {
  const responses = new Map(state.responses.map(response => [response.key, response.value]));
  let score = 0, gradableMarks = 0;
  const entries = questions.map((q, index) => {
    const type = questionType(q), response = responses.get(q.key);
    const answered = Array.isArray(response) ? response.length > 0 : typeof response === 'string' && response !== '';
    const range = type === 'NAT' && numericAnswerRange(q);
    const optionsValid = ['MCQ', 'MSQ'].includes(type) && q.correctOptions?.length
      && (type !== 'MCQ' || q.correctOptions.length === 1) && q.correctOptions.every(letter => q[`opt${letter}`]);
    const gradable = Boolean(range || optionsValid);
    let status = gradable ? 'unanswered' : 'ungraded', earned = 0;
    if (gradable) {
      gradableMarks += Number(q.marks);
      if (answered) {
        const correct = type === 'NAT' ? Number(response) >= range.min && Number(response) <= range.max
          : JSON.stringify([...response].sort()) === JSON.stringify([...q.correctOptions].sort());
        status = correct ? 'correct' : 'wrong';
        earned = correct ? Number(q.marks) : type === 'MCQ' ? -Number(q.marks) * negativeFraction : 0;
      }
    }
    score += earned;
    return { question: publicQuestion(q, index), response: response ?? null, status, earned, answer: storedAnswerText(q) || null, solutionUrl: q.solutionUrl || '' };
  });
  return { score: Math.round(score * 10000) / 10000, gradableMarks, totalMarks: questions.reduce((sum, q) => sum + Number(q.marks), 0),
    correct: entries.filter(e => e.status === 'correct').length, wrong: entries.filter(e => e.status === 'wrong').length,
    unanswered: entries.filter(e => e.status === 'unanswered').length, ungraded: entries.filter(e => e.status === 'ungraded').length, entries };
}
