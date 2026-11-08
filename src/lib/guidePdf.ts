import { jsPDF } from "jspdf";
import { guideFaq, guideFlow, guideModules, guideStartSteps } from "@/mocks/guide";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

type RGB = [number, number, number];

const COLORS: Record<string, RGB> = {
  ink: [17, 24, 39],
  body: [51, 65, 85],
  muted: [107, 114, 128],
  line: [226, 232, 240],
  brand: [21, 128, 74],
  brandDark: [11, 40, 27],
  brandSoft: [232, 244, 236],
  gold: [217, 152, 15],
  goldSoft: [253, 246, 227],
  soft: [246, 248, 246],
};

/** Standard PDF fonts only cover Latin-1: normalise typographic characters. */
function clean(value: string): string {
  return value
    .replace(/[\u202f\u00a0\u2009]/g, " ")
    .replace(/[\u2018\u2019\u201b]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...");
}

type Cursor = { y: number };

function ensureSpace(doc: jsPDF, cursor: Cursor, needed: number): void {
  if (cursor.y + needed > PAGE_HEIGHT - 24) {
    doc.addPage();
    cursor.y = MARGIN + 8;
  }
}

function drawFooter(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_HEIGHT - 16, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);
    doc.text("FinBuilder AI - Mode d'emploi complet", MARGIN, PAGE_HEIGHT - 11);
    doc.text(`Page ${page} / ${total}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 11, { align: "right" });
  }
}

function sectionTitle(doc: jsPDF, cursor: Cursor, title: string, note?: string) {
  ensureSpace(doc, cursor, 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(...COLORS.ink);
  doc.text(clean(title), MARGIN, cursor.y);
  cursor.y += 3.2;
  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(0.7);
  doc.line(MARGIN, cursor.y, MARGIN + 18, cursor.y);
  cursor.y += 6;
  if (note) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(...COLORS.muted);
    const lines = doc.splitTextToSize(clean(note), CONTENT_WIDTH) as string[];
    lines.forEach((line) => {
      doc.text(line, MARGIN, cursor.y);
      cursor.y += 4.3;
    });
    cursor.y += 2;
  }
}

function paragraph(doc: jsPDF, cursor: Cursor, text: string, size = 9, color: RGB = COLORS.body) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(clean(text), CONTENT_WIDTH) as string[];
  lines.forEach((line) => {
    ensureSpace(doc, cursor, 6);
    doc.text(line, MARGIN, cursor.y);
    cursor.y += size * 0.52;
  });
}

function callout(doc: jsPDF, cursor: Cursor, label: string, text: string, tone: "neutral" | "tip") {
  const paddingX = 4;
  const innerWidth = CONTENT_WIDTH - paddingX * 2 - 1.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.4);
  const lines = doc.splitTextToSize(clean(text), innerWidth) as string[];

  const boxHeight = 9.6 + lines.length * 4.1;
  ensureSpace(doc, cursor, boxHeight + 6);

  const top = cursor.y - 3.4;
  if (tone === "tip") doc.setFillColor(...COLORS.goldSoft);
  else doc.setFillColor(...COLORS.soft);
  doc.roundedRect(MARGIN, top, CONTENT_WIDTH, boxHeight, 1.6, 1.6, "F");
  doc.setFillColor(...(tone === "tip" ? COLORS.gold : COLORS.brand));
  doc.rect(MARGIN, top, 1.2, boxHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.4);
  doc.setTextColor(...(tone === "tip" ? [130, 92, 12] : COLORS.muted));
  doc.text(clean(label).toUpperCase(), MARGIN + paddingX + 1, top + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.4);
  doc.setTextColor(...COLORS.body);
  let textY = top + 9.6;
  lines.forEach((line) => {
    doc.text(line, MARGIN + paddingX + 1, textY);
    textY += 4.1;
  });

  cursor.y = top + boxHeight + 5.5;
}

function numberedSteps(doc: jsPDF, cursor: Cursor, label: string, steps: string[]) {
  ensureSpace(doc, cursor, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  doc.setTextColor(...COLORS.muted);
  doc.text(clean(label).toUpperCase(), MARGIN, cursor.y);
  cursor.y += 5.4;

  steps.forEach((step, index) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    const lines = doc.splitTextToSize(clean(step), CONTENT_WIDTH - 9) as string[];
    ensureSpace(doc, cursor, lines.length * 4.1 + 3);

    doc.setFillColor(...COLORS.brandSoft);
    doc.circle(MARGIN + 2.4, cursor.y - 1.1, 2.4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.brand);
    doc.text(String(index + 1), MARGIN + 2.4, cursor.y + 0.15, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    doc.setTextColor(...COLORS.body);
    lines.forEach((line) => {
      doc.text(line, MARGIN + 7.4, cursor.y);
      cursor.y += 4.1;
    });
    cursor.y += 1.4;
  });
  cursor.y += 1.5;
}

function moduleBlock(doc: jsPDF, cursor: Cursor, module: (typeof guideModules)[number], index: number) {
  const badge = 8.4;
  ensureSpace(doc, cursor, 40);

  if (index > 0) {
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, cursor.y - 9, PAGE_WIDTH - MARGIN, cursor.y - 9);
  }

  doc.setFillColor(...COLORS.brand);
  doc.roundedRect(MARGIN, cursor.y - 5.8, badge, badge, 1.4, 1.4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  doc.setTextColor(255, 255, 255);
  doc.text(module.step, MARGIN + badge / 2, cursor.y - 2.5, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...COLORS.ink);
  doc.text(clean(module.title), MARGIN + badge + 4, cursor.y - 2.6);

  cursor.y += 4.6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.6);
  doc.setTextColor(...COLORS.brand);
  doc.text(clean(module.tagline), MARGIN + badge + 4, cursor.y);
  cursor.y += 6.4;

  paragraph(doc, cursor, module.purpose, 8.9);
  cursor.y += 3.6;

  callout(doc, cursor, "A preparer", module.needs, "neutral");
  numberedSteps(doc, cursor, "Comment faire", module.steps);
  callout(doc, cursor, "Astuce", module.tip, "tip");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...COLORS.muted);
  ensureSpace(doc, cursor, 8);
  doc.text(clean(`Dans l'application : ${module.linkLabel} (${module.link})`), MARGIN, cursor.y);
  cursor.y += 9;
}

function startStepGrid(doc: jsPDF, cursor: Cursor) {
  const gap = 4;
  const colWidth = (CONTENT_WIDTH - gap) / 2;
  const rowHeight = 28;

  guideStartSteps.forEach((item, index) => {
    const column = index % 2;
    if (column === 0) ensureSpace(doc, cursor, rowHeight + 5);

    const x = MARGIN + column * (colWidth + gap);
    const top = cursor.y - 4.5;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, top, colWidth, rowHeight, 1.6, 1.6, "FD");

    doc.setFillColor(...COLORS.brand);
    doc.circle(x + 7, top + 7, 3.1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.4);
    doc.setTextColor(255, 255, 255);
    doc.text(item.step, x + 7, top + 8.1, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.ink);
    doc.text(clean(item.title), x + 13, top + 8.4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.body);
    const lines = doc.splitTextToSize(clean(item.text), colWidth - 9) as string[];
    let textY = top + 14;
    lines.slice(0, 4).forEach((line) => {
      doc.text(line, x + 4.5, textY);
      textY += 3.8;
    });

    if (column === 1) cursor.y = top + rowHeight + 5;
  });

  if (guideStartSteps.length % 2 === 1) cursor.y += rowHeight + 5;
}

function flowList(doc: jsPDF, cursor: Cursor) {
  guideFlow.forEach((item, index) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(clean(item.text), CONTENT_WIDTH - 16) as string[];
    ensureSpace(doc, cursor, lines.length * 4.1 + 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.4);
    doc.setTextColor(...COLORS.gold);
    doc.text(`ETAPE ${index + 1}`, MARGIN + 8, cursor.y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.ink);
    doc.text(clean(item.title), MARGIN + 8 + 17, cursor.y);
    cursor.y += 4.6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.body);
    lines.forEach((line) => {
      doc.text(line, MARGIN + 8, cursor.y);
      cursor.y += 4.1;
    });
    cursor.y += 3.4;
  });
}

function faqList(doc: jsPDF, cursor: Cursor) {
  guideFaq.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const questionLines = doc.splitTextToSize(clean(item.question), CONTENT_WIDTH) as string[];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    const answerLines = doc.splitTextToSize(clean(item.answer), CONTENT_WIDTH) as string[];

    ensureSpace(doc, cursor, questionLines.length * 4.5 + answerLines.length * 4.1 + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.ink);
    questionLines.forEach((line) => {
      doc.text(line, MARGIN, cursor.y);
      cursor.y += 4.5;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    doc.setTextColor(...COLORS.body);
    answerLines.forEach((line) => {
      doc.text(line, MARGIN, cursor.y);
      cursor.y += 4.1;
    });
    cursor.y += 4.6;
  });
}

export function exportGuidePdf() {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cursor: Cursor = { y: 0 };
  const generatedOn = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // ---- Cover band --------------------------------------------------------
  doc.setFillColor(...COLORS.brandDark);
  doc.rect(0, 0, PAGE_WIDTH, 40, "F");
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 40, PAGE_WIDTH, 1.6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text("FinBuilder AI", MARGIN, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(206, 224, 213);
  doc.text(clean(`Version du ${generatedOn}`), MARGIN, 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Mode d'emploi", MARGIN, 33);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(206, 224, 213);
  doc.text("Comment fonctionne chaque onglet", PAGE_WIDTH - MARGIN, 33, { align: "right" });

  cursor.y = 52;

  paragraph(
    doc,
    cursor,
    "Quatorze onglets, un meme objectif : savoir ou va votre argent et ce que vous pouvez financer. Ce document reprend, pour chacun, a quoi il sert, ce qu'il faut preparer et les gestes a faire dans l'ordre, du profil financier jusqu'aux rapports exportables.",
    9.4,
    COLORS.body,
  );
  cursor.y += 4;

  // ---- Quick start -------------------------------------------------------
  sectionTitle(doc, cursor, "Quatre gestes pour demarrer");
  paragraph(
    doc,
    cursor,
    "Tant que ces quatre etapes ne sont pas faites, la plupart des ecrans restent vides. C'est normal : tout est calcule a partir de vos chiffres, jamais invente.",
    8.9,
    COLORS.muted,
  );
  cursor.y += 4;
  startStepGrid(doc, cursor);
  cursor.y += 4;

  // ---- Modules -----------------------------------------------------------
  sectionTitle(
    doc,
    cursor,
    "Les quatorze espaces, dans l'ordre d'usage",
    "Cet ordre n'est pas decoratif : chaque onglet s'appuie sur celui qui le precede. Vous pouvez toujours revenir en arriere, rien n'est definitif.",
  );
  cursor.y += 2;

  guideModules.forEach((module, index) => {
    moduleBlock(doc, cursor, module, index);
  });

  // ---- Flow --------------------------------------------------------------
  cursor.y += 2;
  sectionTitle(
    doc,
    cursor,
    "Un onglet ne travaille jamais seul",
    "Voici la chaine qui se declenche a chaque saisie. Comprendre cet ordre evite de chercher longtemps pourquoi un chiffre ne bouge pas.",
  );
  cursor.y += 2;
  flowList(doc, cursor);

  // ---- FAQ ---------------------------------------------------------------
  cursor.y += 2;
  sectionTitle(doc, cursor, "Questions frequentes");
  faqList(doc, cursor);

  // ---- Closing -----------------------------------------------------------
  ensureSpace(doc, cursor, 24);
  doc.setFillColor(...COLORS.soft);
  doc.roundedRect(MARGIN, cursor.y - 4, CONTENT_WIDTH, 18, 1.6, 1.6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.ink);
  doc.text("Une autre question ?", MARGIN + 5, cursor.y + 2.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.4);
  doc.setTextColor(...COLORS.body);
  doc.text("Ecrivez-nous a mrwim74@gmail.com, nous repondons sous 24 heures.", MARGIN + 5, cursor.y + 8);

  drawFooter(doc);
  doc.save("finbuilder-mode-demploi.pdf");
}