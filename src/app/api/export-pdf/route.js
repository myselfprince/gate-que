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
  const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  const tempDir = path.join(process.cwd(), `temp_pdf_${uniqueId}`);

  try {
    const { subject, chapter, questions } = await req.json();
    
    await fs.mkdir(tempDir, { recursive: true });
    
    const texFileName = 'gate_workbook.tex';
    const pdfFileName = 'gate_workbook.pdf';
    const texFilePath = path.join(tempDir, texFileName);
    const pdfFilePath = path.join(tempDir, pdfFileName);

    // 🔥 FIX: Switched to standard "article" class and added "enumitem"
    let latex = `\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath, amssymb}
\\usepackage{graphicx}
\\usepackage[export]{adjustbox}
\\usepackage[margin=0.5in, landscape]{geometry}
\\usepackage{multicol}
\\usepackage{listings}
\\usepackage{xcolor}
\\usepackage{enumitem} 

\\pagecolor{black}
\\color{white}
\\pagestyle{empty}

\\lstset{
basicstyle=\\ttfamily\\small\\color{white},
backgroundcolor=\\color[rgb]{0.12,0.12,0.12},
frame=single,
rulecolor=\\color{gray},
breaklines=true,
tabsize=4
}

% 🔥 FIX: Creating a lightweight custom counter instead of a massive list environment
\\newcounter{questionnum}

\\begin{document}
\\begin{center}
\\LARGE \\textbf{GATE CSE: ${subject} - ${chapter}}
\\end{center}
\\vspace{0.5cm}
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

        // 🔥 FIX: Manually step the counter and print it to bypass memory limits
        latex += `\n\\stepcounter{questionnum}\n`;
        latex += `\\noindent{\\large \\textbf{\\thequestionnum.}} {\\small \\textbf{[GATE ${q.year || ''} | ${q.marks || '1'} Mark]}} \\\\[0.2cm]\n`;
        latex += "\\begin{multicols*}{2}\n";
        latex += `{\\Large ${qText}}\n`;

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
            // 🔥 FIX: Use a safe, standard enumerate list for choices
            latex += "\\begin{enumerate}[label=\\textbf{(\\Alph*)}, leftmargin=*]\n";
            if (q.optA) latex += `  \\item ${processOpt(q.optA)}\n`;
            if (q.optB) latex += `  \\item ${processOpt(q.optB)}\n`;
            if (q.optC) latex += `  \\item ${processOpt(q.optC)}\n`;
            if (q.optD) latex += `  \\item ${processOpt(q.optD)}\n`;
            latex += "\\end{enumerate}\n";
        } else if (!q.isProof) { 
            latex += `\n\\vspace{0.5cm}\n\\noindent\\textbf{Answer:} ${escapeLatex(q.natAnswer) || '\\rule{3cm}{0.4pt}'}\n`;
        }
      
      latex += "\n\\end{multicols*}\n\\vspace{0.6cm}\n\\newpage\n";
    });

    latex += "\n\\end{document}\n";

    await fs.writeFile(texFilePath, latex, 'utf8');

    try {
      await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFilePath}"`);
    } catch (pdflatexError) {
      console.warn("pdflatex threw a warning, but might have generated the PDF.", pdflatexError);
    }

    const pdfBuffer = await fs.readFile(pdfFilePath);

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
    
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error("Failed to clean up temp directory:", cleanupError);
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}