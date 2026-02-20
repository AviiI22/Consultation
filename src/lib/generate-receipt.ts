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
    transactionId?: string;
}

export const generateReceiptPDF = (data: ReceiptData) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    // Colors
    const gold = [197, 165, 114]; // #C5A572 (approx)
    const charcoal = [51, 51, 51];

    // Header - Title
    doc.setFont("serif", "bold");
    doc.setFontSize(24);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text("✦ Astrology Consultation ✦", 105, 30, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Discover Your Cosmic Path", 105, 38, { align: "center" });

    // Divider
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    // Content Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(charcoal[0], charcoal[1], charcoal[2]);
    doc.text("Booking Receipt", 20, 60);

    // Details Grid
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);

    const leftCol = 20;
    const valueCol = 70;
    let y = 75;

    const rowHeight = 10;

    const addRow = (label: string, value: string) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, leftCol, y);
        doc.setFont("helvetica", "normal");
        doc.text(value || "—", valueCol, y);
        y += rowHeight;
    };

    addRow("Booking ID:", data.bookingId);
    addRow("Client Name:", data.name);
    addRow("Email:", data.email);
    addRow("Consultation:", data.consultationType);
    addRow("Scheduled Date:", data.date);
    addRow("Scheduled Time:", data.time);
    if (data.transactionId) {
        addRow("Transaction ID:", data.transactionId);
    }

    // Amount Section
    y += 5;
    doc.setDrawColor(240, 240, 240);
    doc.line(20, y, 190, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text("Amount Paid:", leftCol, y);
    doc.text(`INR ${data.amount.toLocaleString("en-IN")}.00`, valueCol, y);

    // Footer
    y = 260;
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(0.2);
    doc.line(20, y, 190, y);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated receipt and does not require a signature.", 105, y + 8, { align: "center" });
    doc.text(`Generated on ${format(new Date(), "PPP p")}`, 105, y + 13, { align: "center" });
    doc.text("© 2026 Astrology Consultation. All rights reserved.", 105, y + 18, { align: "center" });

    // Save PDF
    doc.save(`Receipt-${data.bookingId.slice(0, 8)}.pdf`);
};
