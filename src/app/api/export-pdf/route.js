import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const escapeLatex = (text) => {
  if (!text) return "";
  return text.replace(/(?<!\\)%/g, '\\%');
};

export async function POST(req) {
  // 1. Create a UNIQUE temp directory to prevent issues if multiple exports happen at once
  const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  const tempDir = path.join(process.cwd(), `temp_pdf_${uniqueId}`);

  try {
    const { subject, chapter, questions } = await req.json();
    
    // Create the unique temporary directory
    await fs.mkdir(tempDir, { recursive: true });
    
    const texFileName = 'gate_workbook.tex';
    const pdfFileName = 'gate_workbook.pdf';
    const texFilePath = path.join(tempDir, texFileName);
    const pdfFilePath = path.join(tempDir, pdfFileName);

    let latex = `\\documentclass[12pt]{exam}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath, amssymb}
\\usepackage{graphicx}
\\usepackage[export]{adjustbox}
\\usepackage[margin=0.5in, landscape]{geometry}
\\usepackage{multicol}
\\usepackage{listings}
\\usepackage{xcolor}
\\pagecolor{black}
\\color{white}
\\pagestyle{empty}
\\cfoot{}
\\lstset{
basicstyle=\\ttfamily\\small\\color{white},
backgroundcolor=\\color[rgb]{0.12,0.12,0.12},
frame=single,
rulecolor=\\color{gray},
breaklines=true,
tabsize=4
}
\\begin{document}
\\begin{center}
\\LARGE \\textbf{GATE CSE: ${subject} - ${chapter}}
\\end{center}
\\vspace{0.5cm}
\\begin{questions}
`;

    questions.forEach(q => {
      let qText = escapeLatex(q.text.trim())
        .replace(/_{3,}/g, '\\rule{2cm}{0.4pt}')
        .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ');

      let textParts = qText.split('$$');
      for (let i = 0; i < textParts.length; i++) {
        if (i % 2 === 0) {
          textParts[i] = textParts[i].replace(/\r?\n/g, '\\newline\n');
        }
      }
      qText = textParts.join('$$');

      latex += "\\begin{multicols*}{2}\n";

      const imageList = q.diagram ? q.diagram.split(',').map(s => s.trim()).filter(Boolean) : [];
      
      imageList.forEach((imgName, i) => {
        if (!imgName) return;
        const imgPath = path.join(process.cwd(), 'public', subject, chapter, `${imgName}${q.ext}`).replace(/\\/g, '/');
        const latexImg = `\n\\begin{center}\n\\includegraphics[max width=0.9\\linewidth, keepaspectratio]{"${imgPath}"}\n\\end{center}\n`;
        
        const tag = `[IMG_${i + 1}]`;
        if (qText.includes(tag)) {
          qText = qText.replace(tag, latexImg);
        } else if (i === 0 && qText.includes('[DIAGRAM_PLACEHOLDER]')) {
          qText = qText.replace('[DIAGRAM_PLACEHOLDER]', latexImg);
        } else {
          qText += latexImg;
        }
      });

      qText = qText.replace('[DIAGRAM_PLACEHOLDER]', '');

      latex += `\n\\question {\\small \\textbf{[GATE ${q.year || ''} | ${q.marks || '1'} Mark]}} \\\\[0.2cm]\n{\\Large ${qText}}\n`;

      if (q.code) {
        latex += `\n\\begin{lstlisting}\n${q.code}\n\\end{lstlisting}\n`;
      }

      const hasOptions = q.optA || q.optB || q.optC || q.optD;
      
      const processOpt = (opt) => {
        if (!opt) return "";
        if (opt.startsWith("IMG:")) {
          const imgName = opt.replace("IMG:", "").trim();
          const imgPath = path.join(process.cwd(), 'public', subject, chapter, `${imgName}${q.ext}`).replace(/\\/g, '/');
          return `\\includegraphics[width=0.4\\linewidth, valign=c]{"${imgPath}"}`;
        }
        return escapeLatex(opt).replace(/\r?\n/g, '\\newline\n');
      };

      if (hasOptions) {
        latex += "\\begin{choices}\n";
        if (q.optA) latex += `  \\choice ${processOpt(q.optA)}\n`;
        if (q.optB) latex += `  \\choice ${processOpt(q.optB)}\n`;
        if (q.optC) latex += `  \\choice ${processOpt(q.optC)}\n`;
        if (q.optD) latex += `  \\choice ${processOpt(q.optD)}\n`;
        latex += "\\end{choices}\n";
      } else {
        latex += `\n\\vspace{0.5cm}\n\\textbf{Answer:} ${escapeLatex(q.natAnswer) || '\\rule{3cm}{0.4pt}'}\n`;
      }
      
      latex += "\n\\end{multicols*}\n\\vspace{0.6cm}\n\\newpage\n";
    });

    latex += "\n\\end{questions}\n\\end{document}\n";

    await fs.writeFile(texFilePath, latex, 'utf8');

    try {
      await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFilePath}"`);
    } catch (pdflatexError) {
      console.warn("pdflatex threw a warning, but might have generated the PDF.", pdflatexError);
    }

    // Read the final PDF into memory
    const pdfBuffer = await fs.readFile(pdfFilePath);

    // 2. SUCCESS CLEANUP: Delete the temporary folder and all its contents
    await fs.rm(tempDir, { recursive: true, force: true });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${subject}_${chapter}_PYQs.pdf"`,
      },
    });

  } catch (error) {
    console.error("PDF Generation Error:", error);
    
    // 3. ERROR CLEANUP: Ensure the folder is deleted even if the code crashes halfway through!
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error("Failed to clean up temp directory:", cleanupError);
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}