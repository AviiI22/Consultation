export const PRICING = {
    INR: {
        NORMAL: 10,
        URGENT: 20, // Example
        BTR: 30, // Example
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
