import "./globals.css";

export const metadata = {
  title: "GATE CSE PYQ Workspace",
  description: "A workspace for collecting, editing, tracking, and exporting GATE CSE previous-year questions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
