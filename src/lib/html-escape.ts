/**
 * HTML-escape a string to prevent XSS in email templates.
 * Converts &, <, >, ", ' to their HTML entity equivalents.
 */
export function escapeHtml(str: string | null | undefined): string {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
