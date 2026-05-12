import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import AdmZip from 'adm-zip';

export async function POST(req) {
  try {
    const { subject, chapter, questions, baseUrl } = await req.json();

    if (!questions || questions.length === 0) {
      return NextResponse.json({ success: false, error: "No questions provided" }, { status: 400 });
    }

    // 1. Build the HTML string to render in the headless browser
    // We put all questions on ONE page so MathJax only has to load and render once!
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <script>
          window.MathJax = {
            tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']], displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']] },
            startup: { typeset: false }
          };
        </script>
        <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
       // Change this section inside your HTML template string:
<style>
  /* Change the body background to your #1a1a1b */
  body { background: #1a1a1b; color: #cdd6f4; font-family: sans-serif; padding: 20px; }
  
  /* Change the export-card background to black (#000000) */
  .export-card { 
    background: #000000; 
    padding: 30px; 
    border-radius: 10px; 
    margin-bottom: 20px; 
    width: 800px; 
    font-size: 18px;
    display: inline-block; 
  }
  .code-block { background: #181825; padding: 10px; border: 1px solid #45475a; font-family: monospace; white-space: pre-wrap; margin: 10px 0; }
  .img-placeholder { border:1px dashed #74c7ec; padding:10px; text-align:center; margin: 10px 0; }
  img { max-width: 100%; max-height: 250px; }
</style>
      </head>
      <body>
        <div id="container">
    `;

    // Process each question into HTML
    questions.forEach((q, idx) => {
      let formattedText = q.text.replace(/\n/g, '<br>');
      const imageList = q.diagram ? q.diagram.split(',').map(s => s.trim()).filter(Boolean) : [];
      
      imageList.forEach((imgName, i) => {
        const imgPath = `${baseUrl}/${subject}/${chapter}/${imgName}${q.ext}`;
        const imgTag = `<div class="img-placeholder"><img src="${imgPath}" /></div>`;
        if (formattedText.includes(`[IMG_${i + 1}]`)) formattedText = formattedText.replace(`[IMG_${i + 1}]`, imgTag);
        else if (i === 0 && formattedText.includes('[DIAGRAM_PLACEHOLDER]')) formattedText = formattedText.replace('[DIAGRAM_PLACEHOLDER]', imgTag);
        else formattedText += imgTag;
      });

      const renderOpt = (opt) => {
        if (!opt) return "";
        if (opt.startsWith('IMG:')) return `<img src="${baseUrl}/${subject}/${chapter}/${opt.replace('IMG:', '').trim()}${q.ext}" style="max-height:60px; vertical-align:middle;"/>`;
        return opt;
      };

      const hasOptions = q.optA || q.optB || q.optC || q.optD;

      htmlContent += `
        <div class="export-card" id="q-${idx + 1}">
          <div style="color: #a6e3a1; font-weight: bold; margin-bottom: 10px;">[GATE ${q.year} | ${q.marks} Mark]</div>
          <div>${formattedText}</div>
          ${q.code ? `<div class="code-block">${q.code}</div>` : ''}
          <div style="margin-top: 15px;">
            ${hasOptions ? `
              <div style="margin-bottom: 8px;"><strong>(A)</strong> <span>${renderOpt(q.optA)}</span></div>
              <div style="margin-bottom: 8px;"><strong>(B)</strong> <span>${renderOpt(q.optB)}</span></div>
              <div style="margin-bottom: 8px;"><strong>(C)</strong> <span>${renderOpt(q.optC)}</span></div>
              <div style="margin-bottom: 8px;"><strong>(D)</strong> <span>${renderOpt(q.optD)}</span></div>
            ` : `
              <div style="color: #f38ba8;"><strong>NAT Answer:</strong> ${q.natAnswer || '_________________'}</div>
            `}
          </div>
        </div><br/>
      `;
    });

    htmlContent += `
        </div>
        <script>
          window.MathJax.typesetPromise().then(() => {
            // Signal to puppeteer that mathjax is done
            const div = document.createElement('div');
            div.id = 'mathjax-done';
            document.body.appendChild(div);
          });
        </script>
      </body>
      </html>
    `;

    // 2. Launch Puppeteer
    const browser = await puppeteer.launch({ 
  headless: "new",
  args: [
    '--disable-dev-shm-usage', // Forces Chrome to use the /tmp directory instead of limited /dev/shm memory
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu'            // Prevents GPU-related crashes in headless mode
  ]
});
    const page = await browser.newPage();
    
    // Set a high device scale factor for retina/high-res images (equivalent to scale: 2 in html2canvas)
    await page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 2 });
    
    // Load the HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Wait for MathJax to finish rendering
    await page.waitForSelector('#mathjax-done', { timeout: 15000 });

    // 3. Take screenshots and add to ZIP
    const zip = new AdmZip();

    for (let i = 0; i < questions.length; i++) {
      const qNum = i + 1;
      const element = await page.$(`#q-${qNum}`);
      
      if (element) {
        // Take a native screenshot of just the bounding box of the card
        const screenshotBuffer = await element.screenshot({ type: 'png' });
        zip.addFile(`${subject}_${chapter}_Q${qNum}.png`, screenshotBuffer);
        
        // Let Chromium breathe to prevent memory spikes
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    await browser.close();

    // 4. Return the ZIP file to the user
    const zipBuffer = zip.toBuffer();
    
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${subject}_${chapter}_Images.zip"`,
      },
    });

  } catch (error) {
    console.error("Puppeteer Export Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}