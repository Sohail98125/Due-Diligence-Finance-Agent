const companyToText = (company) => {

    const trendText = company.historical_trend
        .map(t => `${t.year}: Revenue ${t.revenue}, Net Profit ${t.net_profit ?? "N/A"}, Total Debt ${t.total_debt ?? "N/A"} `)
        .join("\n  ")

    return `
    Company : ${company.company_name} (${company.symbol})
    Sector : ${company.sector} ${company.is_financial_sector ? "(Financial Sector)" : ""}
    Country : ${company.country}
    Financial Year : ${company.financial_year}

    Revenue : ${company.profit_loss.revenue} ${company.unit} ${company.currency}
    Total Expenses : ${company.profit_loss.total_expenses ?? "Not Disclosed"}
    Net Profit : ${company.profit_loss.net_profit ?? "Not Disclosed"}
    Operating Profit : ${company.profit_loss.operating_profit ?? "Not Disclosed"}
    Net Profit Margin : ${company.profit_loss.net_profit_margin ?? "Not Disclosed"}
    
    Total Debt : ${company.debt_structure.total_debt ?? "Not Disclosed"}
    Cash and Equivalents : ${company.debt_structure.cash_and_equivalents ?? "Not Disclosed"}
    Interest Expense : ${company.debt_structure.interest_expense ?? "N/A"}
    Total Equity : ${company.debt_structure.total_equity ?? "N/A"}
    Interest-Rate Percent : ${company.debt_structure.interest_rate_percent ?? "N/A"}
    Debt-To-Equity Ratio : ${company.debt_structure.debt_to_equity_ratio ?? "N/A"}
    Interest-Coverage-Ratio : ${company.debt_structure.interest_coverage_ratio ?? "N/A"}

    Current Assets : ${company.liquidity.current_assets ?? "N/A"}
    Current Liabilities : ${company.liquidity.current_liabilities ?? "N/A"}
    Current Ratio : ${company.liquidity.current_ratio ?? "N/A"}

    Historical_trend :
     ${trendText}

    Analyze Notes : ${company.notes?.join(" ") || "None."}
    Data Warnings : ${company.data_warnings?.join(" ") || "None."}
    `.trim()
};

export default companyToText;