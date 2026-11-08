// latest year ke snapshot pe calculations karta hai (current health)

const safeDivide = (a, b) => {
    if (a == null || b == null || b === 0) return null;
    return a / b;
}
const enRichSchema = (schema) => {
    const { debt_structure, liquidity, profit_loss } = schema;

    //interest rate = kitne % interest par loan liya hai 
    const interestRate = safeDivide(debt_structure.interest_expense, debt_structure.total_debt);
    debt_structure.interest_rate_percent = interestRate === null ? null : interestRate * 100;


    //debt-to-equidity-ratio = company kitni leveraged hai (debt ya fr owner capital);
    // warna dataset ka diya hua value (jaise Reliance ka 0.44) waise hi rehne do

    const debtToEquity = safeDivide(debt_structure.total_debt, debt_structure.total_equity);
    if (debtToEquity !== null) {
        debt_structure.debt_to_equity_ratio = debtToEquity;
    }


    //interest coverage ratio = operating profit se interest chukane ki capacity
    debt_structure.interest_coverage_ratio = safeDivide(
        profit_loss.operating_profit,
        debt_structure.interest_expense
    );


    // current ratio = same pattern: calculate ho sake toh karo, warna existing value rehne do
    const currentRatio = safeDivide(liquidity.current_assets, liquidity.current_liabilities);
    if (currentRatio !== null) {
        liquidity.current_ratio = currentRatio;
    }

    // net profit margin (%)
    const margin = safeDivide(profit_loss.net_profit, profit_loss.revenue);
    profit_loss.net_profit_margin = margin === null ? null : margin * 100;
    return schema;

}

export default enRichSchema;