export const PRICING = {
    SYMBOL: {
        INR: "₹",
        USD: "$",
        EUR: "€",
        GBP: "£",
        AUD: "A$",
        CAD: "C$",
        SGD: "S$",
        AED: "DH",
        JPY: "¥",
    } as Record<string, string>
};

export function formatPrice(amount: number, currency: string) {
    const symbol = PRICING.SYMBOL[currency] || currency;
    const formattedAmount = amount.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    return `${symbol}${formattedAmount}`;
}
