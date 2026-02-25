export type ConsultationType = "normal" | "urgent";
export type BtrOption = "without-btr" | "with-btr";
export type Duration = 40 | 90;
export type TimeSlot = string;
export type Gender = "Male" | "Female" | "Other";

export interface BookingFormData {
    consultationType: ConsultationType | null;
    btrOption: BtrOption | null;
    duration: Duration | null;
    consultationDate: string | null;
    consultationTime: TimeSlot | null;
    name: string;
    dob: string;
    tob: string;
    gender: Gender | null;
    email: string;
    phone: string;
    birthPlace: string;
    concern: string;
    promoCode: string | null;
    discountPercent: number;
    userTimezone?: string;
}

export interface BookingResponse {
    id: string;
    amount: number;
    cashfreeOrderId: string;
    paymentSessionId: string;
}

export const STEPS = [
    { number: 1, label: "Terms", path: "/book" },
    { number: 2, label: "Type", path: "/consultation-type" },
    { number: 3, label: "BTR", path: "/btr-option" },
    { number: 4, label: "Schedule", path: "/schedule" },
    { number: 5, label: "Details", path: "/details" },
    { number: 6, label: "Summary", path: "/summary" },
    { number: 7, label: "Payment", path: "/payment" },
];
