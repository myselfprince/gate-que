// src/app/api/scrape/route.js
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { randomUUID } from 'crypto';
import { jsonError, rateLimit, requireReadAccess, unexpectedError, ValidationError } from '@/lib/api-utils';

export const runtime = 'nodejs';
const MAX_SCRAPE_PAGES = Number(process.env.MAX_SCRAPE_PAGES) || 100;
const MAX_SOURCE_BYTES = 3 * 1024 * 1024;

const validateSourceUrl = (value) => {
  let sourceUrl;
  try {
    sourceUrl = new URL(value);
  } catch {
    throw new ValidationError('The source URL is invalid.');
  }

  const trustedHost = sourceUrl.hostname === 'practicepaper.in' || sourceUrl.hostname.endsWith('.practicepaper.in');
  if (!trustedHost || !['https:', 'http:'].includes(sourceUrl.protocol)) {
    throw new ValidationError('Only practicepaper.in URLs are supported.');
  }
  sourceUrl.search = '';
  return sourceUrl;
};

export async function GET(request) {
  const denied = requireReadAccess(request);
  if (denied) return denied;
  const limited = rateLimit(request, 'scrape', { limit: 30, windowMs: 60_000 });
  if (limited) return limited;
  try {
    const { searchParams } = new URL(request.url);
    const baseUrl = searchParams.get('url');
    const pageNo = Number(searchParams.get('page') || '1');

    if (!baseUrl) return NextResponse.json({ success: false, error: "Missing URL parameter" }, { status: 400 });
    if (!Number.isInteger(pageNo) || pageNo < 1 || pageNo > MAX_SCRAPE_PAGES) return jsonError(`Page must be between 1 and ${MAX_SCRAPE_PAGES}.`);

    const sourceUrl = validateSourceUrl(baseUrl);
    sourceUrl.searchParams.set('page_no', String(pageNo));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    let response;
    try {
      response = await fetch(sourceUrl, { signal: controller.signal, redirect: 'error' });
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) return jsonError(`The source website returned ${response.status}.`, 502);
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > MAX_SOURCE_BYTES) return jsonError('The source page is too large.', 413);
    const html = await response.text();
    if (html.length > MAX_SOURCE_BYTES) return jsonError('The source page is too large.', 413);
    const $ = cheerio.load(html);

    let totalPages = 1;
    if (pageNo === 1) {
      $('.pagination li a').each((i, el) => {
        const text = $(el).text().trim();
      if (!isNaN(parseInt(text))) totalPages = Math.max(totalPages, parseInt(text));
      });
    }
    totalPages = Math.min(totalPages, MAX_SCRAPE_PAGES);

    const questions = [];

    const cleanText = (str) => {
        if (!str) return "";
        return str
            .replace(/\[\/?latex\]/gi, '$') 
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ') 
            .trim();
    };

    $('.question').each((i, el) => {
      const typeLabel = $(el).find('.question_type_labal').text();
      let marks = typeLabel.includes("2 Mark") ? "2" : "1";
      
      const metaLinks = $(el).find('.year_sub_chap_link a');
      let year = "2026";
      let setNum = "";
      let rawTopic = "Unknown Topic"; // <--- NEW: Grab the raw topic

      if (metaLinks.length > 0) {
        const metaText = $(metaLinks[0]).text();
        const yearMatch = metaText.match(/\d{4}/);
        if (yearMatch) year = yearMatch[0];
        const setMatch = metaText.match(/SET\s*[-_]?\s*(\d+)/i);
        if (setMatch) setNum = setMatch[1];
      }

      // <--- NEW: The second link is always the sub-topic
      if (metaLinks.length > 1) {
        rawTopic = $(metaLinks[1]).text().trim();
      }

      $(el).find('.katex').each((j, katexEl) => {
        const latex = $(katexEl).find('annotation[encoding="application/x-tex"]').text();
        if (latex) $(katexEl).replaceWith(`$${latex}$`);
      });

      let diagram = "";
      $(el).find('.question_text img').each((j, imgEl) => {
         const src = $(imgEl).attr('src') || $(imgEl).attr('data-src');
         if (src) diagram += `(Ext: ${src}) `; 
         $(imgEl).replaceWith('[DIAGRAM_PLACEHOLDER]');
      });

      $(el).find('.question_text br').replaceWith('\n');
      let text = $(el).find('.question_text').text().trim();
      text = text.replace(/^Question \d+\s*/i, '').trim();
      text = cleanText(text);

      let optA = "", optB = "", optC = "", optD = "";
      const rows = $(el).find('.answer_table tbody tr');
      if (rows.length >= 4) {
        optA = cleanText($(rows[0]).find('.option_data').text());
        optB = cleanText($(rows[1]).find('.option_data').text());
        optC = cleanText($(rows[2]).find('.option_data').text());
        optD = cleanText($(rows[3]).find('.option_data').text());
      }

      questions.push({
        id: randomUUID(),
        text,
        code: "",
        year,
        setNum,
        rawTopic, // <--- NEW: Send the raw topic to the frontend
        marks,
        diagram: diagram.trim(),
        ext: ".png",
        optA,
        optB,
        optC,
        optD,
        natAnswer: rows.length === 0 ? "NAT" : ""
      });
    });

    return NextResponse.json({ success: true, totalPages, currentPage: pageNo, questions });
  } catch (error) {
    if (error instanceof ValidationError) return jsonError(error.message);
    if (error.name === 'AbortError') return jsonError('The source website took too long to respond.', 504);
    console.error('Scrape error:', error);
    return unexpectedError();
  }
}
