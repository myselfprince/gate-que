import { escapeLatex } from './latex-source.mjs';
import { normalizeSolutionUrl } from './solution-links.mjs';

export const YOUTUBE_ICON_TEX = String.raw`\newcommand{\gateyoutubeicon}{\raisebox{-2pt}{\hbox to18bp{\vrule width0pt height12bp depth0bp\pdfliteral{q 1 0 0 rg 3 0 m 15 0 l 16.66 0 18 1.34 18 3 c 18 9 l 18 10.66 16.66 12 15 12 c 3 12 l 1.34 12 0 10.66 0 9 c 0 3 l 0 1.34 1.34 0 3 0 c h f 1 1 1 rg 7 3 m 7 9 l 12 6 l h f Q}\hfil}}}`;

export const latexLink = (url, content) => `\\href{${url.replace(/[%#]/g, character => `\\${character}`)}}{${content}}`;
export const hasWatermark = settings => settings.showWatermark && Boolean(settings.watermarkText.trim()) && settings.watermarkOpacity > 0;
export const expectedWebsiteLinks = settings => settings.websiteUrl ? Number(settings.showWebsite) + Number(hasWatermark(settings) && settings.watermarkClickable) : 0;
export const visibleSolutionUrl = (question, settings) => question.isBlank || !settings.showSolutions || (!settings.showSolutionIcon && !settings.solutionLabel.trim()) ? '' : normalizeSolutionUrl(question.solutionUrl);

export function documentTitle(subject, chapter, settings) {
  if (settings.titleText.trim()) return settings.titleText.trim();
  const clean = text => settings.stripTitleNumbers ? text.replace(/^\d+\.\s*/, '') : text;
  return `${clean(subject)} - ${clean(chapter)}`;
}

function decorationRow(slots) {
  if (!slots.some(slot => slot.length)) return '';
  // An empty minipage has no natural width. Keep its column width reserved so
  // centre-aligned links stay centred when the left or right slot is empty.
  return slots.map((items, index) => `\\makebox[0.32\\textwidth][l]{\\begin{minipage}[t]{0.32\\textwidth}\\vspace{0pt}\\${['raggedright', 'centering', 'raggedleft'][index]}\n${items.join('\\par\\vspace{4pt}\n')}\\par\\end{minipage}}`).join('\\hfill\n');
}

export function pageDecorations({ settings, question, page, total, foreground }) {
  const top = [[], [], []], bottom = [[], [], []];
  const put = (position, content) => (position.startsWith('top') ? top : bottom)[['left', 'center', 'right'].indexOf(position.split('-')[1])].push(content);
  const solution = visibleSolutionUrl(question, settings);
  if (solution) put(settings.solutionPosition, `{\\fontsize{${settings.solutionFontSize}}{${settings.solutionFontSize + 4}}\\selectfont${latexLink(solution, `${settings.showSolutionIcon ? '\\gateyoutubeicon\\hspace{5pt}' : ''}${escapeLatex(settings.solutionLabel)}`)}}`);
  if (settings.showWebsite && settings.websiteUrl) put(settings.websitePosition, `{\\fontsize{9}{13}\\selectfont\\color{${foreground}!70}${latexLink(settings.websiteUrl, escapeLatex(settings.websiteLabel || settings.websiteUrl))}}`);
  if (settings.showPageNumbers && settings.pageNumberTemplate) put(settings.pageNumberPosition, `{\\fontsize{${settings.pageNumberFontSize}}{${settings.pageNumberFontSize + 4}}\\selectfont\\color{${foreground}!65}${escapeLatex(settings.pageNumberTemplate.replaceAll('{page}', String(page)).replaceAll('{total}', String(total)))}}`);
  return { top: decorationRow(top), bottom: decorationRow(bottom) };
}

export function watermarkTex(settings, foreground) {
  if (!hasWatermark(settings)) return '';
  const background = settings.theme === 'dark' ? 'black' : 'white';
  const content = escapeLatex(settings.watermarkText);
  const text = settings.watermarkClickable && settings.websiteUrl ? latexLink(settings.websiteUrl, content) : content;
  const [vertical, horizontal = 'center'] = settings.watermarkPosition === 'center' ? ['center', 'center'] : settings.watermarkPosition.split('-');
  const x = horizontal === 'left' ? `${settings.marginMm}mm+\\wd\\gatewatermarkbox/2` : horizontal === 'right' ? `\\paperwidth-${settings.marginMm}mm-\\wd\\gatewatermarkbox/2` : '\\paperwidth/2';
  const height = '(\\ht\\gatewatermarkbox+\\dp\\gatewatermarkbox)/2';
  const y = vertical === 'top' ? `${settings.marginMm}mm+${height}` : vertical === 'bottom' ? `\\paperheight-${settings.marginMm}mm-${height}` : '\\paperheight/2';
  return `
\\sbox{\\gatewatermarkbox}{\\rotatebox{${settings.watermarkAngle}}{\\color{${foreground}!${(settings.watermarkOpacity * 100).toFixed(2)}!${background}}\\fontsize{${settings.watermarkFontSize}}{${settings.watermarkFontSize}}\\selectfont\\bfseries ${text}}}
\\ifdim\\wd\\gatewatermarkbox>0.72\\paperwidth\\sbox{\\gatewatermarkbox}{\\resizebox{0.72\\paperwidth}{!}{\\usebox{\\gatewatermarkbox}}}\\fi
\\ifdim\\dimexpr\\ht\\gatewatermarkbox+\\dp\\gatewatermarkbox\\relax>0.72\\paperheight\\sbox{\\gatewatermarkbox}{\\resizebox*{!}{0.72\\paperheight}{\\usebox{\\gatewatermarkbox}}}\\fi
\\setlength{\\gatewatermarkx}{\\dimexpr ${x}\\relax}
\\setlength{\\gatewatermarky}{\\dimexpr ${y}\\relax}
\\AddToHookNext{shipout/background}{\\put(0,0){\\hspace*{\\gatewatermarkx}\\raisebox{-\\gatewatermarky}[0pt][0pt]{\\makebox[0pt][c]{\\raisebox{\\dimexpr(\\dp\\gatewatermarkbox-\\ht\\gatewatermarkbox)/2\\relax}[0pt][0pt]{\\usebox{\\gatewatermarkbox}}}}}}
`;
}
