import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req) {
  try {
    const { subject, chapter, questions } = await req.json();

    // 1. Setup temporary directory for compilation
    const tempDir = path.join(process.cwd(), 'temp_pdf');
    await fs.mkdir(tempDir, { recursive: true });

    const texFileName = 'gate_workbook.tex';
    const pdfFileName = 'gate_workbook.pdf';
    const texFilePath = path.join(tempDir, texFileName);
    const pdfFilePath = path.join(tempDir, pdfFileName);

    // 2. Generate LaTeX String (This replaces your Python script!)
    let latex = `\\documentclass[12pt]{exam}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath, amssymb}
\\usepackage{graphicx}
\\usepackage[export]{adjustbox}
\\usepackage[margin=1in, landscape]{geometry}
\\usepackage{multicol}
\\usepackage{listings}
\\usepackage{xcolor}

\\pagecolor{black}
\\color{white}

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
        let qText = q.text.replace(/_{3,}/g, '\\rule{2cm}{0.4pt}').replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ');
        
        latex += "\\begin{multicols*}{2}\n";

        // Image handling logic (Assuming images are in the public folder)
        const imageList = q.diagram ? q.diagram.split(',').map(s => s.trim()).filter(Boolean) : [];
        imageList.forEach((imgName, i) => {
            if (!imgName) return;
            // Note: pdflatex needs absolute or relative paths from the compilation folder. 
            // We map it to your Next.js public folder.
            const imgPath = path.join(process.cwd(), 'public', subject, chapter, `${imgName}${q.ext}`).replace(/\\/g, '/');
            const latexImg = `\n\\begin{center}\n\\includegraphics[max width=0.9\\linewidth, keepaspectratio]{"${imgPath}"}\n\\end{center}\n`;

            const tag = `[IMG_${i+1}]`;
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
            if (opt.startsWith("IMG:")) {
                const imgName = opt.replace("IMG:", "").trim();
                const imgPath = path.join(process.cwd(), 'public', subject, chapter, `${imgName}${q.ext}`).replace(/\\/g, '/');
                return `\\includegraphics[width=0.4\\linewidth, valign=c]{"${imgPath}"}`;
            }
            return opt;
        };

        if (hasOptions) {
            latex += "\\begin{choices}\n";
            if (q.optA) latex += `  \\choice ${processOpt(q.optA)}\n`;
            if (q.optB) latex += `  \\choice ${processOpt(q.optB)}\n`;
            if (q.optC) latex += `  \\choice ${processOpt(q.optC)}\n`;
            if (q.optD) latex += `  \\choice ${processOpt(q.optD)}\n`;
            latex += "\\end{choices}\n";
        } else {
            latex += `\n\\vspace{0.5cm}\n\\textbf{Answer:} ${q.natAnswer || '\\rule{3cm}{0.4pt}'}\n`;
        }

        latex += "\n\\end{multicols*}\n\\vspace{0.6cm}\n\\newpage\n";
    });

    latex += "\n\\end{questions}\n\\end{document}\n";

    // 3. Write LaTeX to file
    await fs.writeFile(texFilePath, latex, 'utf8');

    // 4. Run pdflatex command (WILL ONLY WORK ON LOCALHOST!)
    try {
        await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFilePath}"`);
    } catch (pdflatexError) {
        console.warn("pdflatex threw a warning, but might have generated the PDF.", pdflatexError);
    }

    // 5. Read the generated PDF
    const pdfBuffer = await fs.readFile(pdfFilePath);

    // 6. Return PDF as a download
    return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${subject}_${chapter}_PYQs.pdf"`,
        },
    });

  } catch (error) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}