const CURRENCY_SYMBOLS = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥"
};

export const isMissing = (value) =>
    value == null || typeof value !== "number" || Number.isNaN(value);

export const formatMoney = (value, currency, unit) => {
    if (isMissing(value)) return "N/A";

    const symbol = CURRENCY_SYMBOLS[currency] ?? (currency ? `${currency} ` : "");
    const sign = value < 0 ? "-" : "";
    const abs = Math.abs(value);

    if (unit?.toLowerCase() === "crore") {
        return `${sign}${symbol}${abs.toLocaleString("en-IN",
            {
                maximumFractionDigits: 0
            })} Cr`;
    }

    if (abs >= 1e12) return `${sign}${symbol}${(abs / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `${sign}${symbol}${(abs / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `${sign}${symbol}${(abs / 1e6).toFixed(2)}M`;
    return `${sign}${symbol}${abs.toLocaleString("en-US",
        {
            maximumFractionDigits: 0
        }
    )}`;
};

export const formatRatio = (value, digits = 2) => isMissing(value) ? "N/A" : `${value.toFixed(digits)}x`;
export const formatPercent = (value, digits = 2) => isMissing(value) ? "N/A" : `${value.toFixed(digits)}%`;
export const formatGrowth = (value, digits = 2) => isMissing(value) ? "N/A" : `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;

export const formatDate = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })
        : "";
