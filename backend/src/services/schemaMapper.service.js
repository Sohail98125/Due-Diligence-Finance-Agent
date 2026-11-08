
const toNumber = (value) => {
    if (value == null || value === "" || value == "None") {
        return null;
    }
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
}

const mapToSchema = ({ profile = {}, income = [], balance = [], credit = [] }) => {

    // Latest Year
    const latestIncome = income[0] || {};
    const latestBalance = balance[0] || {};
    const latestCredit = credit[0] || {};

    const creditByYear = new Map(
        credit.map((item) => [
            item.fiscal_year,
            item
        ])
    )

    // Last five years data 
    const historicalTrend = income.slice(0, 5).map((incomeYear) => {

        // Same fiscal year ka balance data lo
        const creditYear = creditByYear.get(incomeYear.fiscal_year) || {};
        return {
            year: incomeYear.fiscal_year || null,
            revenue: toNumber(incomeYear.is_sales_revenue_turnover),
            net_profit: toNumber(incomeYear.is_net_income),
            total_debt: toNumber(creditYear.short_and_long_term_debt)
        }
    });

    return {
        company_name: profile.company_name || null,
        symbol: profile.ticker || null,
        aliases: [],
        country: profile.country || null,
        sector: profile.sector || null,
        is_financial_sector: profile.sector?.toLowerCase().includes("financial") || false,
        currency: latestIncome.currency || null,
        unit: null,
        financial_year: latestIncome.fiscal_year || null,
        profit_loss: {
            revenue: toNumber(latestIncome.is_sales_revenue_turnover),
            total_expenses: null,
            net_profit: toNumber(latestIncome.is_net_income),
            operating_profit: toNumber(latestIncome.is_oper_income),
            net_profit_margin: null
        },
        debt_structure: {
            total_debt: toNumber(latestCredit.short_and_long_term_debt),
            total_equity: toNumber(latestBalance.bs_total_equity),
            cash_and_equivalents: toNumber(latestBalance.bs_c_and_ce_and_sti_detailed),
            interest_expense: toNumber(latestIncome.is_int_expense),
            interest_rate_percent: null,
            debt_to_equity_ratio: null,
            interest_coverage_ratio: null
        },
        liquidity: {
            current_assets: toNumber(latestBalance.bs_cur_asset_report),
            current_liabilities: toNumber(latestBalance.bs_cur_liab),
            current_ratio: null
        },
        historical_trend: historicalTrend,

        // Calculated later 
        yoy_revenue_growth: null,
        yoy_profit_growth: null,
        yoy_debt_growth: null,

        red_flags: [],
        notes: [],
        data_warnings: [],

        //source metadata 
        data_source: {
            type: "api",
            provider: "ROIC.ai",
            source_name: "company/profile + fundamental/income-statement + fundamental/balance-sheet + fundamental/ratios/credit"
        }
    };
}
export default mapToSchema;
