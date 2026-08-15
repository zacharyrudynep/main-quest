// Converts the AI's Markdown resume into a clean, real-looking .docx and downloads it.
// The `docx` library is loaded lazily so it doesn't bloat the main bundle.
export async function downloadResumeDocx(markdown, filename = "resume.docx") {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");

  const runsFrom = (text) =>
    text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((p) => {
      let m = p.match(/^\*\*([^*]+)\*\*$/);
      if (m) return new TextRun({ text: m[1], bold: true });
      m = p.match(/^\*([^*]+)\*$/);
      if (m) return new TextRun({ text: m[1], italics: true });
      return new TextRun(p);
    });

  const children = [];
  for (const raw of String(markdown || "").split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) { children.push(new Paragraph({ text: "" })); continue; }
    if (/^#\s+/.test(line)) children.push(new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 60 }, children: runsFrom(line.replace(/^#\s+/, "")) }));
    else if (/^##\s+/.test(line)) children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 220, after: 80 }, children: runsFrom(line.replace(/^##\s+/, "")) }));
    else if (/^###\s+/.test(line)) children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 140, after: 60 }, children: runsFrom(line.replace(/^###\s+/, "")) }));
    else if (/^[-*+]\s+/.test(line)) children.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: runsFrom(line.replace(/^[-*+]\s+/, "")) }));
    else children.push(new Paragraph({ spacing: { after: 60 }, children: runsFrom(line) }));
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children }],
  });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}