import jsPDF from "jspdf";
import { format } from "date-fns";

interface ReceiptData {
    bookingId: string;
    name: string;
    email: string;
    consultationType: string;
    date: string;
    time: string;
    amount: number;
    currency: string;
    transactionId?: string;
    promoCode?: string;
    discountAmount?: number;
}

export const generateReceiptPDF = (data: ReceiptData) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const gold: [number, number, number] = [197, 160, 39];
    const charcoal: [number, number, number] = [45, 42, 38];
    const gray: [number, number, number] = [120, 118, 112];

    // ─── Header ──────────────────────────────────────────────────────
    doc.setFillColor(197, 160, 39);
    doc.rect(0, 0, 210, 38, "F");

    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("✦ Sanskar Dixit", 105, 16, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 220);
    doc.text("Vedic Astrology Consultation", 105, 23, { align: "center" });
    doc.text("work.astro.avii@gmail.com", 105, 29, { align: "center" });

    // ─── Title ───────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
    doc.text("BOOKING RECEIPT", 20, 52);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(`Generated on ${format(new Date(), "dd MMM yyyy, h:mm a")}`, 190, 52, { align: "right" });

    // Divider
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(0.4);
    doc.line(20, 56, 190, 56);

    // ─── Receipt Info Box ─────────────────────────────────────────────
    doc.setFillColor(250, 248, 243);
    doc.roundedRect(20, 61, 170, 8, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text("BOOKING ID", 25, 66.5);
    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
    doc.text(data.bookingId.toUpperCase(), 70, 66.5);

    // ─── Details Table ────────────────────────────────────────────────
    let y = 80;
    const leftLabel = 25;
    const leftValue = 100;

    const addRow = (label: string, value: string, highlight = false) => {
        if (highlight) {
            doc.setFillColor(252, 250, 245);
            doc.rect(20, y - 5, 170, 9, "F");
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(gray[0], gray[1], gray[2]);
        doc.text(label, leftLabel, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
        doc.text(value || "—", leftValue, y);
        y += 10;
    };

    addRow("Client Name", data.name, true);
    addRow("Email", data.email);
    addRow("Consultation Type", data.consultationType, true);
    addRow("Scheduled Date", data.date);
    addRow("Scheduled Time", data.time, true);
    if (data.transactionId) addRow("Transaction ID", data.transactionId);
    if (data.promoCode) addRow("Promo Code Applied", data.promoCode, true);

    // ─── Amount Section ───────────────────────────────────────────────
    y += 5;
    doc.setDrawColor(230, 225, 215);
    doc.setLineWidth(0.2);
    doc.line(20, y, 190, y);
    y += 10;

    if (data.discountAmount && data.discountAmount > 0) {
        const originalAmount = data.amount + data.discountAmount;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(gray[0], gray[1], gray[2]);
        doc.text("Original Amount:", leftLabel, y);
        doc.text(`${data.currency} ${originalAmount.toLocaleString("en-IN")}.00`, leftValue, y);
        y += 9;

        doc.setTextColor(34, 139, 34);
        doc.text("Discount:", leftLabel, y);
        doc.text(`- ${data.currency} ${data.discountAmount.toLocaleString("en-IN")}.00`, leftValue, y);
        y += 9;

        doc.setDrawColor(200, 195, 185);
        doc.line(20, y, 190, y);
        y += 8;
    }

    doc.setFillColor(250, 246, 230);
    doc.roundedRect(20, y - 5, 170, 14, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text("AMOUNT PAID", leftLabel, y + 4);
    doc.text(`${data.currency} ${data.amount.toLocaleString("en-IN")}.00`, 190, y + 4, { align: "right" });

    // ─── Footer ───────────────────────────────────────────────────────
    doc.setFillColor(245, 243, 238);
    doc.rect(0, 267, 210, 30, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text("This is a computer-generated receipt. No signature required.", 105, 276, { align: "center" });
    doc.text("Thank you for choosing Sanskar Dixit Astrology Consultation.", 105, 282, { align: "center" });

    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(0.3);
    doc.line(20, 267, 190, 267);

    doc.save(`Receipt-${data.bookingId.slice(0, 8)}.pdf`);
};
