// dono (ratios + trends) ka output leke final verdict deta hai

const RED_FLAGS_RULES = {
    currentRatioLow: 1.0,
    debtToEquityHigh: 2.0,
    revenueDeclinedThreshold: -10,
    interestCoverageLow: 1.5
};

const detectRedFlags = (schema) => {
    const { liquidity, profit_loss, debt_structure } = schema
    const flags = [];

    const isFinancial = schema.is_financial_sector === true;

    // liquidity risk 
    if (!isFinancial && liquidity.current_ratio != null && liquidity.current_ratio < RED_FLAGS_RULES.currentRatioLow) {
        flags.push("Liquidity Concern: Current liabilities exceed current assets, indicating potential difficulty meeting short-term obligations.");
    }

    // high leverage
    if (!isFinancial && debt_structure.debt_to_equity_ratio != null && debt_structure.debt_to_equity_ratio > RED_FLAGS_RULES.debtToEquityHigh) {
        flags.push("High Leverage Risk: The company's debt-to-equity ratio exceeds 2.0, indicating significant reliance on debt financing.");
    }

    // company is running at loss
    if (profit_loss.net_profit != null && profit_loss.net_profit < 0) {
        flags.push("Profitability Concern: The company reported a net loss during the reporting period, indicating negative profitability.");
    }

    //Revenue decline
    if (schema.yoy_revenue_growth != null && schema.yoy_revenue_growth < RED_FLAGS_RULES.revenueDeclinedThreshold) {
        flags.push("Revenue Decline: Revenue has decreased by more than 10% compared to the previous financial year.")
    }

    // high interest burden 
    if (!isFinancial && debt_structure.interest_coverage_ratio != null && debt_structure.interest_coverage_ratio < RED_FLAGS_RULES.interestCoverageLow && debt_structure.interest_coverage_ratio > 0) {
        flags.push("Interest Coverage Risk: The company's operating profit provides limited coverage of its interest obligations, increasing financial pressure.");
    }
    schema.red_flags = flags;
    return schema;
};

export default detectRedFlags;



