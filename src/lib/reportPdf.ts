import { jsPDF } from "jspdf";
import { formatDateFr, formatMoney } from "@/lib/finance";
import type { MonthReport } from "@/lib/reports";

export type ReportPdfOptions = {
  includeTransactions: boolean;
  includeBreakdown: boolean;
  includeInsights: boolean;
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  ink: [17, 24, 39] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  line: [226, 232, 240] as [number, number, number],
  brand: [21, 128, 74] as [number, number, number],
  brandDark: [11, 40, 27] as [number, number, number],
  gold: [217, 152, 15] as [number, number, number],
  soft: [246, 248, 246] as [number, number, number],
};

/** PDF standard fonts only support Latin-1: normalise the narrow spaces used by Intl. */
function clean(value: string): string {
  return value.replace(/[\u202f\u00a0\u2009]/g, " ");
}

function money(value: number, devise: string): string {
  return clean(formatMoney(value, devise));
}

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

type Cursor = { y: number };

function drawFooter(doc: jsPDF, report: MonthReport, author: string) {
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_HEIGHT - 16, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      clean(`FinBuilder AI — Rapport ${report.month.label}${author ? ` — ${author}` : ""}`),
      MARGIN,
      PAGE_HEIGHT - 11,
    );
    doc.text(`Page ${page} / ${total}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 11, { align: "right" });
  }
}

function ensureSpace(doc: jsPDF, cursor: Cursor, needed: number): number {
  if (cursor.y + needed > PAGE_HEIGHT - 24) {
    doc.addPage();
    cursor.y = MARGIN + 6;
  }
  return cursor.y;
}

function sectionTitle(doc: jsPDF, cursor: Cursor, title: string) {
  ensureSpace(doc, cursor, 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.ink);
  doc.text(clean(title), MARGIN, cursor.y);
  cursor.y += 3;
  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, cursor.y, MARGIN + 18, cursor.y);
  cursor.y += 6;
}

function tableHeader(doc: jsPDF, cursor: Cursor, columns: { label: string; x: number; align?: "left" | "right" }[]) {
  doc.setFillColor(...COLORS.soft);
  doc.rect(MARGIN, cursor.y - 4.5, CONTENT_WIDTH, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  columns.forEach((column) => {
    doc.text(clean(column.label).toUpperCase(), column.x, cursor.y, { align: column.align ?? "left" });
  });
  cursor.y += 7;
}

export function exportMonthReportPdf(
  report: MonthReport,
  devise: string,
  options: ReportPdfOptions,
  author: string,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cursor: Cursor = { y: 0 };
  const generatedOn = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // ---- Header band -------------------------------------------------------
  doc.setFillColor(...COLORS.brandDark);
  doc.rect(0, 0, PAGE_WIDTH, 34, "F");
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 34, PAGE_WIDTH, 1.6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text("FinBuilder AI", MARGIN, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(206, 224, 213);
  doc.text("Rapport financier mensuel", MARGIN, 21);
  doc.text(clean(`Genere le ${generatedOn}`), MARGIN, 26);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(clean(report.month.label), PAGE_WIDTH - MARGIN, 15, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(206, 224, 213);
  doc.text(clean(author || "Espace personnel"), PAGE_WIDTH - MARGIN, 21, { align: "right" });
  doc.text(`${report.transactionCount} operations`, PAGE_WIDTH - MARGIN, 26, { align: "right" });

  cursor.y = 46;

  // ---- KPI boxes ---------------------------------------------------------
  const kpis = [
    { label: "REVENUS", value: money(report.totals.revenus, devise), color: COLORS.brand },
    { label: "DEPENSES", value: money(report.totals.depenses, devise), color: COLORS.gold },
    {
      label: "SOLDE NET",
      value: money(report.totals.solde, devise),
      color: report.totals.solde >= 0 ? COLORS.brand : [180, 62, 30] as [number, number, number],
    },
    { label: "TAUX D'EPARGNE", value: `${Math.round(report.totals.tauxEpargne)} %`, color: COLORS.ink },
  ];

  const boxGap = 3.5;
  const boxWidth = (CONTENT_WIDTH - boxGap * 3) / 4;
  kpis.forEach((kpi, index) => {
    const x = MARGIN + index * (boxWidth + boxGap);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cursor.y, boxWidth, 20, 1.6, 1.6, "FD");
    doc.setFillColor(...kpi.color);
    doc.rect(x, cursor.y, 1.4, 20, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(kpi.label, x + 4, cursor.y + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.ink);
    doc.text(clean(kpi.value), x + 4, cursor.y + 14.5);
  });

  cursor.y += 28;

  // ---- Narrative ---------------------------------------------------------
  sectionTitle(doc, cursor, "Synthese du mois");
  const soldeSentence =
    report.totals.solde >= 0
      ? `Vous avez degage un solde positif de ${money(report.totals.solde, devise)} sur ${money(report.totals.revenus, devise)} encaisses.`
      : `Vos depenses depassent vos revenus de ${money(Math.abs(report.totals.solde), devise)} ce mois-ci.`;

  const narrative = clean(
    `En ${report.month.label.toLowerCase()}, vous avez enregistre ${money(report.totals.revenus, devise)} de revenus et ${money(report.totals.depenses, devise)} de depenses. ${soldeSentence} ${
      report.categories.length > 0
        ? `Votre premier poste de depense est ${report.categories[0].label} (${Math.round(report.categories[0].percent)} % du total).`
        : ""
    }`,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  doc.setTextColor(51, 65, 85);
  const narrativeLines = doc.splitTextToSize(narrative, CONTENT_WIDTH) as string[];
  narrativeLines.forEach((line) => {
    ensureSpace(doc, cursor, 6);
    doc.text(line, MARGIN, cursor.y);
    cursor.y += 4.6;
  });
  cursor.y += 3;

  // ---- Key points --------------------------------------------------------
  if (options.includeInsights && report.insights.length > 0) {
    sectionTitle(doc, cursor, "Points cles");
    report.insights.forEach((insight) => {
      const text = doc.splitTextToSize(clean(insight.text), CONTENT_WIDTH - 5) as string[];
      ensureSpace(doc, cursor, 6 + text.length * 4.4);
      doc.setFillColor(...COLORS.brand);
      doc.circle(MARGIN + 1.2, cursor.y - 1.2, 0.9, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.6);
      doc.setTextColor(...COLORS.ink);
      doc.text(clean(insight.title), MARGIN + 4.5, cursor.y);
      cursor.y += 4.2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      doc.setTextColor(71, 85, 105);
      text.forEach((line) => {
        doc.text(line, MARGIN + 4.5, cursor.y);
        cursor.y += 4.1;
      });
      cursor.y += 2;
    });
    cursor.y += 2;
  }

  // ---- Expense breakdown -------------------------------------------------
  if (options.includeBreakdown && report.categories.length > 0) {
    sectionTitle(doc, cursor, "Repartition des depenses");
    tableHeader(doc, cursor, [
      { label: "Categorie", x: MARGIN + 1 },
      { label: "Montant", x: MARGIN + 108, align: "right" },
      { label: "Part", x: MARGIN + 145, align: "right" },
      { label: "Barre", x: MARGIN + 152 },
    ]);

    doc.setFontSize(8.2);
    report.categories.forEach((slice, index) => {
      ensureSpace(doc, cursor, 8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.ink);
      doc.text(clean(slice.label), MARGIN + 1, cursor.y);
      doc.text(clean(money(slice.amount, devise)), MARGIN + 108, cursor.y, { align: "right" });
      doc.setTextColor(...COLORS.muted);
      doc.text(`${Math.round(slice.percent)} %`, MARGIN + 145, cursor.y, { align: "right" });

      const barWidth = 34;
      doc.setFillColor(238, 242, 238);
      doc.rect(MARGIN + 152, cursor.y - 2.6, barWidth, 3.2, "F");
      doc.setFillColor(...(index === 0 ? COLORS.brand : [120, 170, 140] as [number, number, number]));
      doc.rect(MARGIN + 152, cursor.y - 2.6, (barWidth * Math.min(slice.percent, 100)) / 100, 3.2, "F");

      cursor.y += 7;
    });

    ensureSpace(doc, cursor, 10);
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, cursor.y - 4, MARGIN + CONTENT_WIDTH, cursor.y - 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.6);
    doc.setTextColor(...COLORS.ink);
    doc.text("Total des depenses", MARGIN + 1, cursor.y + 1);
    doc.text(clean(money(report.totals.depenses, devise)), MARGIN + 108, cursor.y + 1, { align: "right" });
    cursor.y += 10;
  }

  // ---- Transactions ------------------------------------------------------
  if (options.includeTransactions && (report.income.length > 0 || report.expenses.length > 0)) {
    sectionTitle(doc, cursor, "Detail des operations");
    tableHeader(doc, cursor, [
      { label: "Date", x: MARGIN + 1 },
      { label: "Libelle", x: MARGIN + 26 },
      { label: "Categorie", x: MARGIN + 118 },
      { label: "Montant", x: MARGIN + CONTENT_WIDTH - 1, align: "right" },
    ]);

    doc.setFontSize(8);
    report.income.forEach((row) => {
      ensureSpace(doc, cursor, 7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.muted);
      doc.text(clean(formatDateFr(row.date)), MARGIN + 1, cursor.y);
      doc.setTextColor(...COLORS.ink);
      doc.text(clean(row.source || "Revenu"), MARGIN + 26, cursor.y);
      doc.setTextColor(...COLORS.muted);
      doc.text(clean(row.type || "Autre"), MARGIN + 118, cursor.y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.brand);
      doc.text(clean(`+ ${money(Number(row.montant) || 0, devise)}`), MARGIN + CONTENT_WIDTH - 1, cursor.y, {
        align: "right",
      });
      cursor.y += 6.4;
    });

    report.expenses.forEach((row) => {
      ensureSpace(doc, cursor, 7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.muted);
      doc.text(clean(formatDateFr(row.date)), MARGIN + 1, cursor.y);
      doc.setTextColor(...COLORS.ink);
      doc.text(clean(row.description || "Depense"), MARGIN + 26, cursor.y);
      doc.setTextColor(...COLORS.muted);
      doc.text(clean(row.categorie || "Autre"), MARGIN + 118, cursor.y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(120, 85, 20);
      doc.text(clean(`- ${money(Number(row.montant) || 0, devise)}`), MARGIN + CONTENT_WIDTH - 1, cursor.y, {
        align: "right",
      });
      cursor.y += 6.4;
    });
  }

  drawFooter(doc, report, author);
  doc.save(`finbuilder-rapport-${slug(report.month.label)}.pdf`);
}