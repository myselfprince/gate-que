import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import os
import subprocess

def get_gray_code(n):
    """Generates Gray code sequences for K-Map headers."""
    if n == 0: return ['']
    if n == 1: return ['0', '1']
    prev = get_gray_code(n - 1)
    return ['0' + c for c in prev] + ['1' + c for c in reversed(prev)]

def get_config(num_vars):
    """Returns row/col counts and labels based on variable count."""
    config = {
        2: (1, 1, 'A', 'B'),
        3: (1, 2, 'A', 'BC'),
        4: (2, 2, 'AB', 'CD'),
        5: (2, 3, 'AB', 'CDE'),
        6: (3, 3, 'ABC', 'DEF')
    }
    return config.get(num_vars, (2, 2, 'AB', 'CD'))

class KMapApp:
    def __init__(self, root):
        self.root = root
        self.root.title("K-Map to LaTeX Generator")
        self.root.geometry("600x600")
        self.root.configure(padx=20, pady=20)

        self.num_vars = tk.IntVar(value=4)
        self.cell_data = {}  # Maps (row, col) to '1', '0', 'X', or ''
        self.buttons = {}    # Maps (row, col) to tk.Button widget

        self.setup_ui()
        self.create_grid()

    def setup_ui(self):
        # Control Panel
        control_frame = tk.Frame(self.root)
        control_frame.pack(fill=tk.X, pady=(0, 20))

        tk.Label(control_frame, text="Variables:", font=("Arial", 12, "bold")).pack(side=tk.LEFT)
        
        var_combo = ttk.Combobox(control_frame, textvariable=self.num_vars, values=[2, 3, 4, 5, 6], state="readonly", width=5)
        var_combo.pack(side=tk.LEFT, padx=10)
        var_combo.bind("<<ComboboxSelected>>", lambda e: self.create_grid())

        tk.Button(control_frame, text="Clear Grid", command=self.clear_grid, bg="#ffcccc").pack(side=tk.LEFT, padx=10)
        tk.Button(control_frame, text="Export LaTeX (.tex)", command=self.export_latex, bg="#ccffcc", font=("Arial", 10, "bold")).pack(side=tk.RIGHT)

        # Grid Container
        self.grid_frame = tk.Frame(self.root)
        self.grid_frame.pack(expand=True)

    def create_grid(self):
        # Clear existing grid
        for widget in self.grid_frame.winfo_children():
            widget.destroy()
        
        self.cell_data.clear()
        self.buttons.clear()

        n = self.num_vars.get()
        row_bits, col_bits, row_label, col_label = get_config(n)
        
        self.row_gray = get_gray_code(row_bits)
        self.col_gray = get_gray_code(col_bits)

        # Top-Left Header (Diagonal representation in UI)
        tk.Label(self.grid_frame, text=f"{col_label}\n{row_label}", font=("Arial", 10, "bold"), fg="green").grid(row=0, column=0, padx=5, pady=5)

        # Column Headers
        for c, code in enumerate(self.col_gray):
            tk.Label(self.grid_frame, text=code, font=("Arial", 12, "bold")).grid(row=0, column=c+1, padx=5, pady=5)

        # Row Headers and Buttons
        for r, r_code in enumerate(self.row_gray):
            tk.Label(self.grid_frame, text=r_code, font=("Arial", 12, "bold")).grid(row=r+1, column=0, padx=5, pady=5)
            
            for c, c_code in enumerate(self.col_gray):
                btn = tk.Button(self.grid_frame, text="", width=4, height=2, font=("Arial", 16, "bold"),
                                command=lambda row=r, col=c: self.toggle_cell(row, col))
                btn.grid(row=r+1, column=c+1, padx=2, pady=2)
                self.buttons[(r, c)] = btn
                self.cell_data[(r, c)] = ""

    def toggle_cell(self, r, c):
        states = ["", "1", "0", "X"]
        current = self.cell_data.get((r, c), "")
        idx = states.index(current) if current in states else 0
        next_state = states[(idx + 1) % len(states)]
        
        self.cell_data[(r, c)] = next_state
        self.buttons[(r, c)].config(text=next_state)

    def clear_grid(self):
        for (r, c), btn in self.buttons.items():
            self.cell_data[(r, c)] = ""
            btn.config(text="")

    def export_latex(self):
        file_path = filedialog.asksaveasfilename(defaultextension=".tex", 
                                                 initialfile=f"kmap_{self.num_vars.get()}var.tex",
                                                 filetypes=[("LaTeX Files", "*.tex"), ("All Files", "*.*")])
        if not file_path:
            return

        n = self.num_vars.get()
        row_bits, col_bits, row_label, col_label = get_config(n)
        rows = len(self.row_gray)
        cols = len(self.col_gray)

        # Generate TikZ Code
        tex = [
            r"\documentclass[tikz, border=5mm]{standalone}",
            r"\usepackage{lmodern}",
            r"\begin{document}",
            r"\begin{tikzpicture}[x=1.5cm, y=1.5cm]"
        ]

        # Draw Grid (Main boxes only)
        tex.append(f"    \\draw[thick] (0,0) grid ({cols},{rows});")

        # Draw Diagonal Line
        tex.append(f"    \\draw[thick] (0,{rows}) -- (-1,{rows+1});")

        # Draw Variable Labels (Green)
        tex.append(f"    \\node[text=green!60!black, font=\\Large\\bfseries] at (-0.7, {rows+0.3}) {{{row_label}}};")
        tex.append(f"    \\node[text=green!60!black, font=\\Large\\bfseries] at (-0.3, {rows+0.7}) {{{col_label}}};")

        # Draw Column Headers (Floating above grid)
        for c, code in enumerate(self.col_gray):
            tex.append(f"    \\node[font=\\Large\\bfseries] at ({c+0.5}, {rows+0.3}) {{{code}}};")

        # Draw Row Headers (Floating left of grid)
        for r, code in enumerate(self.row_gray):
            y_pos = rows - r - 0.5
            tex.append(f"    \\node[font=\\Large\\bfseries] at (-0.5, {y_pos}) {{{code}}};")

        # Draw Cell Values (Huge text inside grid)
        for r in range(rows):
            for c in range(cols):
                val = self.cell_data.get((r, c), "")
                if val:
                    y_pos = rows - r - 0.5
                    x_pos = c + 0.5
                    tex.append(f"    \\node[font=\\Huge\\bfseries] at ({x_pos}, {y_pos}) {{{val}}};")

        tex.append(r"\end{tikzpicture}")
        tex.append(r"\end{document}")

        latex_code = "\n".join(tex)

        try:
            with open(file_path, 'w') as f:
                f.write(latex_code)
            
            # Optional: Ask user if they want to compile it immediately
            if messagebox.askyesno("Success", f"Saved to {file_path}.\n\nDo you want to compile it to PDF right now using pdflatex?"):
                subprocess.run(["pdflatex", "-interaction=nonstopmode", file_path], cwd=os.path.dirname(file_path))
                messagebox.showinfo("Compiled", "Compilation finished. Check the folder for the PDF.")
        except Exception as e:
            messagebox.showerror("Error", f"An error occurred:\n{e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = KMapApp(root)
    root.mainloop()