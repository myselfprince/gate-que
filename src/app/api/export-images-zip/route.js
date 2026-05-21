import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import AdmZip from 'adm-zip';

export async function POST(req) {
    try {
        const { subject, chapter, questions, baseUrl, contentWidth = 100 } = await req.json();
        if (!questions || questions.length === 0) {
            return NextResponse.json({ success: false, error: "No questions provided" }, { status: 400 });
        }
        
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
<style>
body { background: #1a1a1b; color: #cdd6f4; font-family: sans-serif; padding: 20px; }
.export-card {
background: #000000;
padding: 15px 20px;
border-radius: 10px;
margin-bottom: 20px;
width: 1100px;
font-size: 26px;
display: inline-block;
}
.code-block { background: #181825; padding: 15px; border: 1px solid #45475a; font-family: monospace; white-space: pre-wrap; margin: 15px 0; font-size: 22px; }
.img-placeholder { border:1px dashed #74c7ec; padding:10px; text-align:center; margin: 10px 0; }
img { max-width: 100%; max-height: 350px; }
</style>
</head>
<body>
<div id="container">
`;
        
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

            // INLINE CODE REPLACEMENT LOGIC FOR IMAGES
            if (q.code) {
                // Escape < and > so the browser doesn't swallow C headers
                const safeHtmlCode = q.code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                
                const codeTag = `<div class="code-block">${safeHtmlCode}</div>`;
                if (formattedText.includes('[CODE]')) {
                    formattedText = formattedText.replace('[CODE]', codeTag);
                } else {
                    formattedText += codeTag;
                }
            }

            const renderOpt = (opt, isCode) => {
                if (!opt) return "";
                if (opt.startsWith('IMG:')) return `<img src="${baseUrl}/${subject}/${chapter}/${opt.replace('IMG:', '').trim()}${q.ext}" style="max-height:80px; vertical-align:middle;"/>`;
                
                let text = opt;
                if (isCode) {
                    text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    return `<span style="white-space: pre-wrap; font-family: monospace;">${text.replace(/\n/g, '<br>')}</span>`;
                }
                return text;
            };
            
            const hasOptions = q.optA || q.optB || q.optC || q.optD;
            
            htmlContent += `
<div class="export-card" id="q-${idx + 1}">
<div style="width: ${contentWidth}%;">
<div style="display: inline-block; background: #a6e3a1; color: #11111b; font-weight: 900; margin-bottom: 25px; font-size: 38px; padding: 2px 10px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
GATE ${q.year} | ${q.marks} Mark
</div>
<div style="line-height: 1.5;">${formattedText}</div>
<div style="margin-top: 20px;">
${hasOptions ? `
<div style="margin-bottom: 10px;"><strong>(A)</strong> <span>${renderOpt(q.optA, q.isCodeOptions)}</span></div>
<div style="margin-bottom: 10px;"><strong>(B)</strong> <span>${renderOpt(q.optB, q.isCodeOptions)}</span></div>
<div style="margin-bottom: 10px;"><strong>(C)</strong> <span>${renderOpt(q.optC, q.isCodeOptions)}</span></div>
<div style="margin-bottom: 10px;"><strong>(D)</strong> <span>${renderOpt(q.optD, q.isCodeOptions)}</span></div>
` : `
<div style="color: #f38ba8;"><strong>NAT Answer:</strong> ${q.natAnswer || '_________________'}</div>
`}
</div>
</div>
</div><br/>
`;
        });
        
        htmlContent += `
</div>
<script>
window.MathJax.typesetPromise().then(() => {
const div = document.createElement('div');
div.id = 'mathjax-done';
document.body.appendChild(div);
});
</script>
</body>
</html>
`;
        
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 1000, deviceScaleFactor: 3 });
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.waitForSelector('#mathjax-done', { timeout: 15000 });
        
        const zip = new AdmZip();
        for (let i = 0; i < questions.length; i++) {
            const qNum = i + 1;
            const element = await page.$(`#q-${qNum}`);
            if (element) {
                const screenshotBuffer = await element.screenshot({ type: 'png' });
                zip.addFile(`${subject}_${chapter}_Q${qNum}.png`, screenshotBuffer);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        await browser.close();
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