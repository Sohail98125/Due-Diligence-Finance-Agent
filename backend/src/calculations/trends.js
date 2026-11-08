// multiple years ko compare karke growth/decline nikalta hai

const calculateYoyGrowth = (current, previous) => {
    // koi value missing ho ya previous 0 ho → growth define nahi hota → null
    if (current == null || previous == null || previous === 0) return null;
    // Math.abs: negative previous value ke liye bhi sahi direction aaye
    return ((current - previous) / Math.abs(previous)) * 100;
};

const enRichWithTrends = (schema) => {
    // latest year pehle (ROIC kabhi bhi order mein de sakta hai, isliye sort)
    const trend = [...(schema.historical_trend || [])]
        .sort((a, b) => String(b.year).localeCompare(String(a.year)));

    if (trend.length >= 2) {
        // trend[0] = sabse recent year, trend[1] = usse pehle wala year
        const [latest, previous] = trend;
        schema.yoy_revenue_growth = calculateYoyGrowth(latest.revenue, previous.revenue);
        schema.yoy_profit_growth = calculateYoyGrowth(latest.net_profit, previous.net_profit);
        schema.yoy_debt_growth = calculateYoyGrowth(latest.total_debt, previous.total_debt);
    } else {
        schema.yoy_revenue_growth = null;
        schema.yoy_profit_growth = null;
        schema.yoy_debt_growth = null;
    }

    return schema;
};

export default enRichWithTrends;