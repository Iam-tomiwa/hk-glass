import { jsPDF } from "jspdf";
import QRCode from "qrcode";

interface QRSheetItem {
  serialCode: string;
  materialName: string;
  url: string;
}

/**
 * Generates and downloads a PDF of QR code stickers.
 *
 * Layout: A4 portrait, 2 columns × 5 rows = 10 stickers per page.
 * Each sticker: ~92mm wide × 53mm tall.
 */
export async function downloadQRCodesPDF(
  items: QRSheetItem[],
  filename = "qr-codes.pdf",
) {
  // ── Page & grid constants (all in mm) ──────────────────────────────────
  const MARGIN = 10;
  const COLS = 2;
  const ROWS_PER_PAGE = 5;
  const GAP_X = 5;
  const GAP_Y = 4;

  const PAGE_W = 210;
  const PAGE_H = 297;
  const CELL_W = (PAGE_W - MARGIN * 2 - GAP_X * (COLS - 1)) / COLS; // ~92.5mm
  const CELL_H = (PAGE_H - MARGIN * 2 - GAP_Y * (ROWS_PER_PAGE - 1)) / ROWS_PER_PAGE; // ~53.4mm

  const QR_SIZE = 36; // mm
  const QR_TOP_PAD = 3; // mm from top of cell to QR

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PER_PAGE = COLS * ROWS_PER_PAGE;

  for (let i = 0; i < items.length; i++) {
    const { serialCode, materialName, url } = items[i];
    const posOnPage = i % PER_PAGE;
    const row = Math.floor(posOnPage / COLS);
    const col = posOnPage % COLS;

    if (posOnPage === 0 && i > 0) doc.addPage();

    const x = MARGIN + col * (CELL_W + GAP_X);
    const y = MARGIN + row * (CELL_H + GAP_Y);

    // ── Cell border ────────────────────────────────────────────────────────
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, CELL_W, CELL_H, 2, 2, "S");

    // ── QR code image ──────────────────────────────────────────────────────
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: "M",
    });
    const qrX = x + (CELL_W - QR_SIZE) / 2;
    const qrY = y + QR_TOP_PAD;
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, QR_SIZE, QR_SIZE);

    // ── Helper: render "Bold label: " + "normal value" centred on a line ──
    const centredLabelValue = (
      label: string,
      value: string,
      lineY: number,
      fontSize: number,
    ) => {
      doc.setFontSize(fontSize);
      doc.setTextColor(30, 32, 46);

      doc.setFont("helvetica", "bold");
      const lw = doc.getTextWidth(label);
      doc.setFont("helvetica", "normal");
      const vw = doc.getTextWidth(value);
      const totalW = lw + vw;
      const startX = x + (CELL_W - totalW) / 2;

      doc.setFont("helvetica", "bold");
      doc.text(label, startX, lineY);
      doc.setFont("helvetica", "normal");
      doc.text(value, startX + lw, lineY);
    };

    const line1Y = qrY + QR_SIZE + 4;
    const line2Y = line1Y + 4.5;

    centredLabelValue("Material Name: ", materialName, line1Y, 7.5);
    centredLabelValue("Serial Number: ", serialCode, line2Y, 7);
  }

  doc.save(filename);
}
