import * as cheerio from 'cheerio';
import { normalizeGateOverflowUrl } from './solution-links.mjs';

const allowedTags = new Set('p br div span b strong em i u s sub sup pre code blockquote ul ol li table thead tbody tfoot tr td th hr a img h2 h3 h4 h5 h6'.split(' '));
function safeUrl(value, base, image = false) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value, base);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return '';
    if (image && url.hostname !== 'gateoverflow.in' && !url.hostname.endsWith('.gateoverflow.in')) return '';
    return url.href;
  } catch { return ''; }
}

export function sanitizeReferenceHtml(html, baseUrl) {
  const $ = cheerio.load(html, {}, false);
  $('script[type^="math/tex"]').each((_, element) => {
    const display = $(element).attr('type').includes('mode=display');
    $(element).replaceWith($('<span>').text(`${display ? '$$' : '$'}${$(element).text()}${display ? '$$' : '$'}`));
  });
  $('script,style,iframe,object,embed,form,input,button,select,textarea,svg,math,link,meta,base').remove();
  $('*').toArray().reverse().forEach(element => {
    const node = $(element), tag = element.tagName;
    if (!allowedTags.has(tag)) { node.replaceWith(node.contents()); return; }
    const href = tag === 'a' ? safeUrl(node.attr('href'), baseUrl) : '';
    const src = tag === 'img' ? safeUrl(node.attr('src') || node.attr('data-src'), baseUrl, true) : '';
    const alt = node.attr('alt') || '';
    const span = /^(td|th)$/.test(tag) ? node.attr('colspan') : '';
    for (const name of Object.keys(element.attribs || {})) node.removeAttr(name);
    if (tag === 'a' && href) node.attr({ href, target: '_blank', rel: 'noopener noreferrer' });
    if (tag === 'img') { if (!src) node.remove(); else node.attr({ src, alt, loading: 'lazy', referrerpolicy: 'no-referrer' }); }
    if (span && /^[1-9]\d?$/.test(span)) node.attr('colspan', span);
  });
  return $.html();
}

export function parseGateOverflowPage(html, url) {
  const sourceUrl = normalizeGateOverflowUrl(url);
  const $ = cheerio.load(html);
  const question = $('.qa-q-view-content').first();
  if (!question.length) throw new Error('The source did not return a readable question. Open the original page to view it.');
  const posts = [{ label: 'Question', html: sanitizeReferenceHtml(question.html() || '', sourceUrl) }];
  $('.qa-a-list-item').slice(0, 20).each((index, element) => {
    const item = $(element), content = item.find('.qa-a-item-content').first();
    if (!content.length) return;
    const author = item.find('.qa-a-item-meta .qa-user-link').first().text().trim();
    posts.push({ label: `${item.hasClass('qa-a-list-item-selected') ? 'Accepted answer' : `Answer ${index + 1}`}${author ? ` · ${author}` : ''}`, html: sanitizeReferenceHtml(content.html() || '', sourceUrl) });
  });
  return { title: $('h1').first().text().trim() || 'GATE Overflow discussion', sourceUrl, posts };
}
