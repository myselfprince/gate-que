export const YOUTUBE_LIMITS = { title: 100, description: 5000, tags: 500 };
export const DEFAULT_YOUTUBE_SETTINGS = {
  channelName: 'G4Gate', website: 'https://g4gate.com', playlistUrl: '',
  titleStyle: 'topic', includeQuestion: true, includeAnswer: false, footer: '',
};

const plain = value => String(value ?? '').replace(/[<>]/g, char => char === '<' ? '‹' : '›');
export const cleanLabel = value => cleanLatexForYoutube(value).replace(/^\d+\.\s*/, '').trim();
export function shorten(value, max) {
  const text = String(value).trim();
  if (text.length <= max) return text;
  const slice = text.slice(0, Math.max(0, max - 1));
  const boundary = slice.lastIndexOf(' ');
  return `${slice.slice(0, boundary > max * .6 ? boundary : slice.length).trimEnd()}…`;
}

export function cleanLatexForYoutube(value) {
  let text = String(value ?? '').replace(/\[IMG_\d+\]|\[DIAGRAM_PLACEHOLDER\]|\[CODE\]/g, ' ')
    .replace(/<\/?(?:p|br|div|span|strong|em|b|i|sub|sup)(?:\s[^>]*)?\s*\/?>/gi, ' ')
    .replace(/\\(?:\[|\]|\(|\))/g, '').replace(/\$/g, '');
  const commands = {
    Leftrightarrow: '⇔', leftrightarrow: '⇔', Rightarrow: '⇒', rightarrow: '→', to: '→',
    Leftarrow: '⇐', leftarrow: '←', neg: '¬', lnot: '¬', vee: '∨', lor: '∨', wedge: '∧', land: '∧',
    oplus: '⊕', ge: '≥', geq: '≥', le: '≤', leq: '≤', neq: '≠', ne: '≠', approx: '≈', equiv: '≡',
    times: '×', cdot: '·', div: '÷', pm: '±', infty: '∞', forall: '∀', exists: '∃',
    in: '∈', notin: '∉', cup: '∪', cap: '∩', emptyset: '∅', subset: '⊂', subseteq: '⊆',
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', theta: 'θ', lambda: 'λ', epsilon: 'ε',
    sigma: 'σ', Sigma: 'Σ', pi: 'π', Omega: 'Ω', omega: 'ω', mu: 'μ', log: 'log', ln: 'ln',
    sin: 'sin', cos: 'cos', tan: 'tan', lim: 'lim', sum: 'Σ', prod: 'Π', int: '∫',
    ldots: '…', cdots: '…', quad: ' ', qquad: ' ', left: '', right: '',
  };
  // Unwrap innermost groups first, retaining fraction/root/exponent meaning.
  for (let pass = 0; pass < 8; pass++) {
    const next = text.replace(/\\(?:dfrac|tfrac|frac)\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
      .replace(/([_^])\{([^{}]*)\}/g, '$1($2)')
      .replace(/\\(?:text|mathrm|mathbf|mathit|operatorname|textbf)\{([^{}]*)\}/g, '$1');
    if (next === text) break;
    text = next;
  }
  text = text.replace(/\\([a-zA-Z]+)/g, (_, command) => commands[command] ?? ` ${command} `)
    .replace(/\\[%&#_]/g, match => match.slice(1)).replace(/\\[,;! ]/g, ' ')
    .replace(/[{}]/g, '').replace(/\\\\/g, ' ');
  return plain(text).replace(/\s+/g, ' ').trim();
}

export function tagCost(tags) { return tags.reduce((sum, tag, index) => sum + tag.length + (tag.includes(' ') ? 2 : 0) + (index ? 1 : 0), 0); }
export function normalizeTags(value) {
  const result = [];
  for (const item of Array.isArray(value) ? value : String(value ?? '').split(',')) {
    const tag = plain(item).replace(/[#\r\n]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!tag || result.some(existing => existing.toLowerCase() === tag.toLowerCase())) continue;
    if (tagCost([...result, tag]) <= YOUTUBE_LIMITS.tags) result.push(tag);
  }
  return result;
}
const safeLink = value => {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? plain(url.href) : ''; }
  catch { return ''; }
};
const hashtag = text => cleanLabel(text).replace(/[^\p{L}\p{N}]/gu, '').slice(0, 40);

export function buildYouTubeMetadata(question, { subject, chapter, number = 1, settings = {}, draft = {} }) {
  const config = { ...DEFAULT_YOUTUBE_SETTINGS, ...settings };
  const subjectName = cleanLabel(subject), chapterName = cleanLabel(chapter);
  const topic = cleanLabel(draft.topic || question.rawTopic || chapterName) || chapterName || 'Previous Year Question';
  const year = cleanLatexForYoutube(question.year), marks = cleanLatexForYoutube(question.marks);
  const examName = question.examPaper === 'IT' ? 'GATE IT' : 'GATE CSE';
  const exam = `${examName}${year ? ` ${year}` : ''}`;
  const identity = `Q${number}${question.setNum ? ` · Set ${cleanLatexForYoutube(question.setNum)}` : ''}`;
  const suffix = ` | ${identity}`;
  const titles = [
    `${shorten(topic, 48)} | ${exam} PYQ | ${shorten(subjectName, 28)}`,
    `${exam} ${shorten(topic, 50)} | PYQ Solution`,
    `${shorten(cleanLatexForYoutube(question.text), 52)} | ${exam} PYQ`,
  ].map(title => `${shorten(title, YOUTUBE_LIMITS.title - suffix.length)}${suffix}`);
  const options = ['A', 'B', 'C', 'D'].filter(letter => question[`opt${letter}`]).map(letter => {
    const option = question[`opt${letter}`];
    return `(${letter}) ${/^IMG:/i.test(option) ? '[Diagram option — see video]' : cleanLatexForYoutube(option)}`;
  });
  const questionText = cleanLatexForYoutube(question.text);
  const questionParts = [`Question ${number}:\n${questionText}`];
  if (question.code?.trim()) questionParts.push(`Code:\n${plain(question.code).trim()}`);
  if (question.diagram?.trim() && question.diagram !== 'auto' || /\[IMG_|\[DIAGRAM_PLACEHOLDER\]/.test(question.text || '')) questionParts.push('Refer to the question diagram in the video.');
  if (options.length) questionParts.push(`Options:\n${options.join('\n')}`);
  if (config.includeAnswer && question.natAnswer?.trim()) questionParts.push(`Answer: ${cleanLatexForYoutube(question.natAnswer)}`);
  const hashtags = [...new Set([question.examPaper === 'IT' ? 'GATEIT' : 'GATECSE', 'GATEPYQ', hashtag(topic)].filter(Boolean))].map(tag => `#${tag}`);
  const opening = `${topic} — ${exam} previous year question${marks ? ` (${marks} ${marks === '1' ? 'mark' : 'marks'})` : ''}.\nPractice ${subjectName}: ${chapterName} with this PYQ solution${config.channelName?.trim() ? ` from ${plain(config.channelName).trim()}` : ''}.`;
  const links = [safeLink(config.website) && `More GATE practice: ${safeLink(config.website)}`, safeLink(config.playlistUrl) && `Chapter playlist: ${safeLink(config.playlistUrl)}`].filter(Boolean);
  const tail = [links.join('\n'), plain(config.footer).trim(), hashtags.join(' ')].filter(Boolean).join('\n\n');
  // Reserve room for links and hashtags even for a very long source question.
  const bodyBudget = Math.max(0, YOUTUBE_LIMITS.description - opening.length - tail.length - 4);
  const body = config.includeQuestion ? shorten(questionParts.join('\n\n'), bodyBudget) : '';
  const description = shorten([opening, body, tail].filter(Boolean).join('\n\n'), YOUTUBE_LIMITS.description);
  const tags = normalizeTags([examName, `${exam} PYQ`, topic, chapterName, subjectName, `${topic} GATE questions`, 'GATE previous year questions', config.channelName]);
  const title = draft.title !== undefined ? plain(draft.title) : titles[config.titleStyle === 'exam' ? 1 : config.titleStyle === 'question' ? 2 : 0];
  const finalDescription = draft.description !== undefined ? plain(draft.description) : description;
  const finalTags = draft.tags !== undefined ? normalizeTags(draft.tags) : tags;
  return {
    index: number, question_id: question.id, year, marks, subject: subjectName, chapter: chapterName, topic,
    video_title: title, timestamp_title: shorten(`${topic} · ${exam} · ${identity}`, 100),
    description: finalDescription, tags: finalTags, hashtags, title_suggestions: titles,
    thumbnail_file: `Question_${number}.png`,
    warnings: [!title.trim() && 'Add a video title.', title.length > 100 && 'Title exceeds 100 characters.', !finalDescription.trim() && 'Add a description.', finalDescription.length > 5000 && 'Description exceeds 5,000 characters.'].filter(Boolean),
  };
}

export function buildYouTubeExport(questions, context, drafts = {}) {
  return questions.flatMap((question, index) => question.isBlank ? [] : [buildYouTubeMetadata(question, { ...context, number: index + 1, draft: drafts[question.id] })]);
}
export const youtubeCopyText = entry => `TITLE\n${entry.video_title}\n\nDESCRIPTION\n${entry.description}\n\nTAGS\n${entry.tags.join(', ')}`;
export function youtubeCsv(entries) {
  const columns = ['index', 'question_id', 'year', 'subject', 'chapter', 'video_title', 'description', 'tags', 'thumbnail_file'];
  const cell = value => {
    const text = String(Array.isArray(value) ? value.join(', ') : value ?? '');
    return `"${(/^[\s]*[=+@-]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`;
  };
  return '\uFEFF' + [columns, ...entries.map(entry => columns.map(key => entry[key]))].map(row => row.map(cell).join(',')).join('\r\n');
}
