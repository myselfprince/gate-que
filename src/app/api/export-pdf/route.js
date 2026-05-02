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

    // 2. Generate LaTeX String
    let latex = `\\documentclass[12pt]{exam}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath, amssymb}
\\usepackage{graphicx}
\\usepackage[export]{adjustbox}
\\usepackage[margin=0.5in, landscape]{geometry} % FIX 2: Margins halved to 0.5 inches
\\usepackage{multicol}
\\usepackage{listings}
\\usepackage{xcolor}

\\pagecolor{black}
\\color{white}

% FIX 3: Force remove all page numbers from the bottom
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
        // Scrub invisible characters and underscores
        let qText = q.text.trim()
            .replace(/_{3,}/g, '\\rule{2cm}{0.4pt}')
            .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ');
            
        // FIX 1: Safely convert Textbox Newlines to LaTeX Newlines
        // We split by $$ to ensure we DON'T put \newline inside block equations, which would crash LaTeX.
        let textParts = qText.split('$$');
        for (let i = 0; i < textParts.length; i++) {
            if (i % 2 === 0) { // If it's normal text (outside $$ math blocks)
                textParts[i] = textParts[i].replace(/\r?\n/g, '\\newline\n');
            }
        }
        qText = textParts.join('$$');
        
        latex += "\\begin{multicols*}{2}\n";

        // Image handling logic 
        const imageList = q.diagram ? q.diagram.split(',').map(s => s.trim()).filter(Boolean) : [];
        imageList.forEach((imgName, i) => {
            if (!imgName) return;
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
            // Apply the newline fix to options as well just in case
            return opt.replace(/\r?\n/g, '\\newline\n');
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

    // 4. Run pdflatex command (Localhost)
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