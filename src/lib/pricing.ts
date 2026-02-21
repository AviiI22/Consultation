export const PRICING = {
    INR: {
        NORMAL: 2499,
        URGENT: 4999,
        BTR: 2500,
        SYMBOL: "₹",
    },
    USD: {
        NORMAL: 1,
        URGENT: 2,
        BTR: 3,
        SYMBOL: "$",
    }
};

export function formatPrice(amount: number, currency: "INR" | "USD") {
    const symbol = PRICING[currency].SYMBOL;
    return `${symbol}${amount.toLocaleString("en-IN")}`;
}
