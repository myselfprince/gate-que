import json
import os
import re

def generate_latex():
    input_file = 'gate_pyq_bulk_export.json' 
    output_file = 'gate_book.tex'
    
    if not os.path.exists(input_file):
        print(f"Error: Could not find '{input_file}'.")
        return

    with open(input_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # LaTeX Preamble: Injected pagecolor and modified lstset for dark mode
    latex = r"""\documentclass[12pt]{exam}
\usepackage[utf8]{inputenc}
\usepackage{amsmath, amssymb}
\usepackage{graphicx}
\usepackage[margin=1in, landscape]{geometry}
\usepackage{multicol}
\usepackage{listings}
\usepackage{xcolor}

% Set Dark Mode Colors
\pagecolor{black}
\color{white}

% Style for the code snippets tailored for Dark Mode
\lstset{
    basicstyle=\ttfamily\small\color{white},
    backgroundcolor=\color[rgb]{0.12,0.12,0.12}, % Dark gray code background
    frame=single,
    rulecolor=\color{gray}, % Border color around code
    breaklines=true,
    tabsize=4
}

\begin{document}

\begin{center}
\LARGE \textbf{GATE CSE Practice Workbook}
\end{center}
\vspace{0.5cm}

\begin{questions}
"""

    # Print Questions Loop
    for q in questions:
        year = q.get('gate_year', '')
        marks = q.get('marks', '1')
        q_text = q.get('question_text', '')
        
        # --- DATA SANITIZATION SCRUBBERS ---
        # 1. Convert raw AI underscores into proper LaTeX fill-in-the-blank lines
        q_text = re.sub(r'_{3,}', r'\\rule{2cm}{0.4pt}', q_text)
        
        # 2. Convert invisible Unicode spaces (Em Spaces, NBSP, etc.) into standard spaces
        q_text = re.sub(r'[\u00A0\u2000-\u200B\u202F\u205F\u3000]', ' ', q_text)
        # -----------------------------------

        # START 50/50 SPLIT FOR THE PDF
        latex += "\\begin{multicols*}{2}\n"
        
        # INLINE DIAGRAM LOGIC
        img_tex = ""
        if q.get('has_diagram') and q.get('diagram_path'):
            image_path = q.get('diagram_path')
            img_tex = f"\n\\begin{{center}}\n\\includegraphics[width=0.9\\linewidth, keepaspectratio]{{{image_path}}}\n\\end{{center}}\n"
        
        # If placeholder is in the text, replace it directly with the image code
        if '[DIAGRAM_PLACEHOLDER]' in q_text:
            q_text = q_text.replace('[DIAGRAM_PLACEHOLDER]', img_tex)
            img_tex = "" # Clear it so we don't print the image a second time at the bottom

        # Print Metadata and Question Text
        latex += f"\n\\question {{\\small \\textbf{{[GATE {year} | {marks} Mark]}}}} \\\\[0.2cm]\n"
        latex += f"{{\\Large {q_text}}}\n"

        # Handle Code Snippet formatting
        if q.get('code_snippet'):
            latex += f"\n\\begin{{lstlisting}}\n{q.get('code_snippet')}\n\\end{{lstlisting}}\n"

        # If there was an image, but the AI forgot the placeholder, print it at the bottom of the question text
        if img_tex:
            latex += img_tex

        # Handle Options vs Fill-in-the-blank
        options = q.get('options', {})
        has_options = any(opt.strip() for opt in options.values())

        if has_options:
            latex += "\\begin{choices}\n"
            latex += f"  \\choice {options.get('A', '')}\n"
            latex += f"  \\choice {options.get('B', '')}\n"
            latex += f"  \\choice {options.get('C', '')}\n"
            latex += f"  \\choice {options.get('D', '')}\n"
            latex += "\\end{choices}\n"
        else:
            latex += "\n\\vspace{0.5cm}\n\\textbf{Answer:} \\rule{3cm}{0.4pt}\n"

        # END 50/50 SPLIT
        latex += "\n\\end{multicols*}\n"
        latex += "\\vspace{0.6cm}\n"
        latex += "\\newpage\n"

    latex += "\n\\end{questions}\n"

    # Print Answer Key Loop
    latex += r"""
\begin{center}
\Large \textbf{Answer Key}
\end{center}
\vspace{0.5cm}

\begin{multicols}{3}
\begin{enumerate}
"""
    
    for q in questions:
        latex += f"  \\item {q.get('correct_answer', '')}\n"

    latex += r"""\end{enumerate}
\end{multicols}
\end{document}
"""

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(latex)

    print("Success! Clean, dark mode, landscape, split-screen workbook generated.")

    # AUTO-COMPILE PDF
    # print("Compiling PDF with pdflatex...")
    # os.system(f"pdflatex -interaction=nonstopmode {output_file}")
    # print("PDF compilation complete!")

if __name__ == "__main__":
    generate_latex()