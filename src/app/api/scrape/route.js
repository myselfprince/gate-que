// src/app/api/scrape/route.js
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const baseUrl = searchParams.get('url');
    const pageNo = searchParams.get('page') || '1';

    if (!baseUrl) return NextResponse.json({ success: false, error: "Missing URL parameter" }, { status: 400 });

    const targetUrl = `${baseUrl.split('?')[0]}?page_no=${pageNo}`;
    const response = await fetch(targetUrl);
    const html = await response.text();
    const $ = cheerio.load(html);

    let totalPages = 1;
    if (pageNo === '1') {
      $('.pagination li a').each((i, el) => {
        const text = $(el).text().trim();
        if (!isNaN(parseInt(text))) totalPages = Math.max(totalPages, parseInt(text));
      });
    }

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
        id: Math.random().toString(36).substr(2, 9),
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

    return NextResponse.json({ success: true, totalPages, currentPage: parseInt(pageNo), questions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}