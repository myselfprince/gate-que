const escaped = (text, index) => {
  let slashes = 0;
  while (index > 0 && text[--index] === '\\') slashes++;
  return slashes % 2 === 1;
};

// Unlike a dollar-delimited regex, this keeps a literal \$ inside math intact.
export function latexSegments(value = '') {
  const text = String(value);
  const segments = [];
  let plainStart = 0;
  for (let index = 0; index < text.length; index++) {
    if (escaped(text, index)) continue;
    const open = text.startsWith('$$', index) ? '$$' : text[index] === '$' ? '$'
      : text.startsWith('\\(', index) ? '\\(' : text.startsWith('\\[', index) ? '\\[' : null;
    if (!open) continue;
    const close = ({ '$': '$', '$$': '$$', '\\(': '\\)', '\\[': '\\]' })[open];
    let end = index + open.length;
    while (end < text.length && (!text.startsWith(close, end) || escaped(text, end))) end++;
    if (end === text.length) continue;
    if (index > plainStart) segments.push({ math: false, text: text.slice(plainStart, index) });
    segments.push({ math: true, text: text.slice(index, end + close.length) });
    index = end + close.length - 1;
    plainStart = index + 1;
  }
  if (plainStart < text.length) segments.push({ math: false, text: text.slice(plainStart) });
  return segments;
}
