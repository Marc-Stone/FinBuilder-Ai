import { jsPDF } from "jspdf";
import {
  ADMIN_ROLE_LABELS,
  formatAdminDate,
  formatAdminNumber,
  type AdminUserRow,
} from "@/lib/admin";

export type UsersPdfFilters = {
  search: string;
  role: string;
  country: string;
  sort: string;
};

export type UsersPdfStats = {
  total: number;
  admins: number;
  countries: number;
  newThisMonth: number;
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
  rowAlt: [250, 251, 249] as [number, number, number],
};

/** Les polices PDF standard ne gèrent que le Latin-1 : on normalise les espaces fines. */
function clean(value: string): string {
  return value.replace(/[\u202f\u00a0\u2009]/g, " ");
}

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function userFullName(user: AdminUserRow): string {
  const parts = [user.prenom, user.nom].filter((part) => Boolean(part && part.trim()));
  return parts.join(" ") || user.email || "Compte sans nom";
}

function accessLabel(user: AdminUserRow): string {
  if (user.admin_role_id) return "Console";
  if (user.role === "admin") return "Admin";
  return "Utilisateur";
}

function truncate(doc: jsPDF, value: string, maxWidth: number): string {
  if (doc.getTextWidth(value) <= maxWidth) return value;
  let output = value;
  while (output.length > 1 && doc.getTextWidth(`${output}…`) > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}…`;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed <= PAGE_HEIGHT - 24) return y;
  doc.addPage();
  return MARGIN + 4;
}

function sectionTitle(doc: jsPDF, y: number, title: string, note?: string): number {
  const nextY = ensureSpace(doc, y, 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...COLORS.ink);
  doc.text(clean(title), MARGIN, nextY);
  if (note) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(clean(note), MARGIN + CONTENT_WIDTH, nextY, { align: "right" });
  }
  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, nextY + 2.5, MARGIN + 18, nextY + 2.5);
  return nextY + 8;
}

function drawTableHeader(doc: jsPDF, y: number): number {
  doc.setFillColor(...COLORS.soft);
  doc.rect(MARGIN, y - 4, CONTENT_WIDTH, 7.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(...COLORS.muted);
  doc.text("COMPTE", MARGIN + 1, y);
  doc.text("EMAIL", 61, y);
  doc.text("PAYS", 119, y);
  doc.text("ACCES", 147, y);
  doc.text("INSCRIPTION", MARGIN + CONTENT_WIDTH - 1, y, { align: "right" });
  return y + 6.5;
}

function drawFooter(doc: jsPDF, author: string) {
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
      clean(`FinBuilder AI — Annuaire des comptes${author ? ` — ${author}` : ""}`),
      MARGIN,
      PAGE_HEIGHT - 11,
    );
    doc.text(`Page ${page} / ${total}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 11, { align: "right" });
  }
}

function countByCountry(rows: AdminUserRow[]): { label: string; value: number }[] {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const key = (row.pays ?? "").trim() || "Non renseigné";
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "fr"));
}

export function exportUsersPdf(
  rows: AdminUserRow[],
  filters: UsersPdfFilters,
  stats: UsersPdfStats,
  author: string,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const generatedOn = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const generatedAt = new Date().toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  /* ---- Bandeau ------------------------------------------------------- */
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
  doc.text("Annuaire des comptes utilisateurs", MARGIN, 21);
  doc.text(clean(`Genere le ${generatedOn} a ${generatedAt}`), MARGIN, 26);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`${formatAdminNumber(rows.length)} compte(s)`, PAGE_WIDTH - MARGIN, 15, {
    align: "right",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(206, 224, 213);
  doc.text(clean(author || "Administration"), PAGE_WIDTH - MARGIN, 21, { align: "right" });
  doc.text("Export administrative — confidentiel", PAGE_WIDTH - MARGIN, 26, { align: "right" });

  let y = 46;

  /* ---- Indicateurs --------------------------------------------------- */
  const kpis = [
    { label: "COMPTES", value: formatAdminNumber(stats.total), color: COLORS.brand },
    { label: "ACCES CONSOLE", value: formatAdminNumber(stats.admins), color: COLORS.gold },
    { label: "PAYS", value: formatAdminNumber(stats.countries), color: COLORS.ink },
    { label: "NOUVEAUX CE MOIS", value: formatAdminNumber(stats.newThisMonth), color: COLORS.brand },
  ];

  const gap = 3.5;
  const boxWidth = (CONTENT_WIDTH - gap * 3) / 4;
  kpis.forEach((kpi, index) => {
    const x = MARGIN + index * (boxWidth + gap);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, boxWidth, 19, 1.6, 1.6, "FD");
    doc.setFillColor(...kpi.color);
    doc.rect(x, y, 1.4, 19, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.setTextColor(...COLORS.muted);
    doc.text(kpi.label, x + 4, y + 6.8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.ink);
    doc.text(clean(kpi.value), x + 4, y + 14.5);
  });

  y += 27;

  /* ---- Synthèse ------------------------------------------------------ */
  y = sectionTitle(doc, y, "Synthese");

  const accessCount = rows.filter((row) => row.admin_role_id || row.role === "admin").length;
  const withEmail = rows.filter((row) => Boolean(row.email && row.email.trim())).length;
  const countryList = countByCountry(rows);
  const topCountry = countryList[0];

  const sentence = clean(
    `Cette selection reunit ${formatAdminNumber(rows.length)} compte(s), dont ${formatAdminNumber(
      accessCount,
    )} disposant d'un acces a la console d'administration. ${formatAdminNumber(
      withEmail,
    )} compte(s) possedent une adresse email renseignee${
      topCountry ? ` et le pays le plus represente est ${topCountry.label} (${topCountry.value})` : ""
    }.`,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  doc.setTextColor(51, 65, 85);
  const sentenceLines = doc.splitTextToSize(sentence, CONTENT_WIDTH) as string[];
  sentenceLines.forEach((line) => {
    y = ensureSpace(doc, y, 6);
    doc.text(line, MARGIN, y);
    y += 4.6;
  });
  y += 1;

  const filterParts: string[] = [];
  if (filters.search.trim()) filterParts.push(`recherche « ${filters.search.trim()} »`);
  if (filters.role !== "tous") {
    filterParts.push(`role : ${ADMIN_ROLE_LABELS[filters.role] ?? filters.role}`);
  }
  if (filters.country !== "tous") filterParts.push(`pays : ${filters.country}`);
  filterParts.push(
    `tri : ${
      filters.sort === "nom" ? "nom alphabetique" : filters.sort === "ancien" ? "plus anciens" : "plus recents"
    }`,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  const filterText = clean(`Filtres appliques — ${filterParts.join(" · ")}`);
  const filterLines = doc.splitTextToSize(filterText, CONTENT_WIDTH) as string[];
  filterLines.forEach((line) => {
    y = ensureSpace(doc, y, 6);
    doc.text(line, MARGIN, y);
    y += 4.2;
  });
  y += 4;

  /* ---- Répartition par pays ------------------------------------------ */
  const countries = countryList.slice(0, 6);
  if (countries.length > 1) {
    y = sectionTitle(doc, y, "Repartition par pays", "6 premiers pays");
    const maxValue = countries[0].value || 1;
    countries.forEach((entry, index) => {
      y = ensureSpace(doc, y, 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);
      doc.setTextColor(...COLORS.ink);
      doc.text(clean(truncate(doc, entry.label, 46)), MARGIN + 1, y);

      const barWidth = 84;
      doc.setFillColor(238, 242, 238);
      doc.rect(MARGIN + 52, y - 2.8, barWidth, 3.4, "F");
      doc.setFillColor(...(index === 0 ? COLORS.brand : [120, 170, 140] as [number, number, number]));
      doc.rect(MARGIN + 52, y - 2.8, (barWidth * entry.value) / maxValue, 3.4, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.muted);
      doc.text(`${entry.value}`, MARGIN + CONTENT_WIDTH - 1, y, { align: "right" });
      y += 6.2;
    });
    y += 3;
  }

  /* ---- Tableau détaillé ---------------------------------------------- */
  y = sectionTitle(doc, y, "Liste des comptes", `${formatAdminNumber(rows.length)} ligne(s)`);
  y = drawTableHeader(doc, y);

  rows.forEach((row, index) => {
    const previousY = y;
    y = ensureSpace(doc, y, 8);
    if (y !== previousY) {
      y = drawTableHeader(doc, y);
    }

    if (index % 2 === 1) {
      doc.setFillColor(...COLORS.rowAlt);
      doc.rect(MARGIN, y - 4.2, CONTENT_WIDTH, 7, "F");
    }

    const isConsole = Boolean(row.admin_role_id) || row.role === "admin";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.8);
    doc.setTextColor(...COLORS.ink);
    doc.text(clean(truncate(doc, userFullName(row), 43)), MARGIN + 1, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.4);
    doc.setTextColor(...COLORS.muted);
    doc.text(clean(truncate(doc, row.email || "—", 55)), 61, y);
    doc.text(clean(truncate(doc, row.pays || "—", 25)), 119, y);
    if (isConsole) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.gold);
    }
    doc.text(clean(accessLabel(row)), 147, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text(clean(formatAdminDate(row.date_creation)), MARGIN + CONTENT_WIDTH - 1, y, {
      align: "right",
    });

    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y + 2.8, MARGIN + CONTENT_WIDTH, y + 2.8);

    y += 7;
  });

  if (rows.length === 0) {
    y = ensureSpace(doc, y, 12);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.4);
    doc.setTextColor(...COLORS.muted);
    doc.text("Aucun compte ne correspond aux filtres selectionnes.", MARGIN + 1, y);
    y += 8;
  }

  /* ---- Note de bas de document --------------------------------------- */
  y = ensureSpace(doc, y + 4, 16);
  doc.setFillColor(...COLORS.soft);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 12, 1.4, 1.4, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.4);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    clean(
      "Document interne : il contient des donnees personnelles. Les donnees financieres des comptes ne sont pas exportees.",
    ),
    MARGIN + 4,
    y + 7,
  );

  drawFooter(doc, author);
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`finbuilder-utilisateurs-${slug(stamp)}.pdf`);
}