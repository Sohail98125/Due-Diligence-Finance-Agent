import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CompanySearchForm from '../components/CompanySearchForm';
import HistoryList from '../components/HistoryList';
import JobProgress from '../components/JobProgress';
import { useAuth } from '../context/AuthContext';
import useJobPolling from '../hooks/useJobPolling';
import { formatMoney, formatPercent, formatRatio, formatGrowth, } from '../utils/format';
import BackgroundDecor from '../utils/BackgroundDecor';
import { motion, AnimatePresence } from 'motion/react';

/*
  RESPONSIVE RULE:
  - no prefix -> phone (compact)
  - sm: / lg: -> your original desktop design, unchanged
*/

const examples = [
    'How well does TCS cover its interest payments?',
    "Is IBM's profit growth sustainable?",
    'What is the debt-to-equity ratio of Infosys?',
];

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'financials', label: 'Financials' },
    { id: 'risks', label: 'Risk analysis' },
    { id: 'news', label: 'News' },
    { id: 'sources', label: 'Sources & data' },
];


const kpiContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.15
        }
    }
};

const kpiItemVariants = {
    hidden: {
        opacity: 0,
        y: 18,
        scale: 0.97
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

const hasValue = (value) => value !== null && value !== undefined && value !== '';

const signTone = (value, positive = 'positive', negative = 'negative') => {
    if (!hasValue(value)) return 'neutral';
    const n = Number(value);
    if (!Number.isFinite(n) || n === 0) return 'neutral';
    return n > 0 ? positive : negative;
};

const safeFormat = (value, formatter, ...args) => {
    if (!hasValue(value)) return 'Not available';
    try {
        const formatted = formatter(value, ...args);
        return hasValue(formatted) ? formatted : 'Not available';
    } catch {
        return 'Not available';
    }
};

const getRiskStyles = (riskLevel) => {
    const risk = String(riskLevel ?? '').toLowerCase();
    if (risk === 'low') return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
    if (risk === 'high' || risk === 'critical') {
        return 'bg-rose-100 text-rose-800 ring-rose-200';
    }
    return 'bg-amber-100 text-amber-800 ring-amber-200';
};

function RiskPill({ riskLevel }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset sm:gap-2 sm:px-3 sm:py-1 sm:text-xs ${getRiskStyles(riskLevel)}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {hasValue(riskLevel) ? `${riskLevel} risk` : 'Risk not assessed'}
        </span>
    );
}

function MetricTile({ label, value, hint, tone = 'neutral' }) {
    const toneClass =
        tone === 'positive'
            ? 'text-emerald-700'
            : tone === 'negative'
                ? 'text-rose-700'
                : tone === 'warning'
                    ? 'text-amber-700'
                    : 'text-slate-900';

    return (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur-sm sm:rounded-2xl sm:p-4">
            <p className="text-[11px] font-medium text-slate-500 sm:text-xs">{label}</p>
            <p className={`mt-1 wrap-break-word text-lg font-bold tracking-tight sm:mt-2 sm:text-2xl ${toneClass}`}>
                {value}
            </p>
            {hint && <p className="mt-0.5 text-[10px] text-slate-500 sm:mt-1 sm:text-xs">{hint}</p>}
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] text-slate-500 sm:text-xs">{label}</p>
            <p className="mt-0.5 wrap-break-word text-xs font-semibold text-slate-800 sm:mt-1 sm:text-sm">{value}</p>
        </div>
    );
}

function SectionCard({ title, description, children, className = '' }) {
    return (
        <section className={`rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur-sm sm:rounded-2xl sm:p-5 ${className}`}>
            <div className="mb-2.5 sm:mb-4">
                <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h3>
                {description && <p className="mt-0.5 text-[11px] leading-4 text-slate-500 sm:mt-1 sm:text-xs sm:leading-normal">{description}</p>}
            </div>
            {children}
        </section>
    );
}

function DataRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0 sm:gap-4 sm:py-3">
            <span className="text-xs text-slate-500 sm:text-sm">{label}</span>
            <span className="max-w-[60%] wrap-break-word text-right text-xs font-semibold text-slate-800 sm:text-sm">
                {value}
            </span>
        </div>
    );
}

function TrendChart({ trends, currency, unit }) {
    const sortedTrends = [...trends].sort(
        (a, b) => Number(a.year) - Number(b.year),
    );
    const revenueValues = sortedTrends
        .map((item) => Number(item.revenue))
        .filter(Number.isFinite);
    const maxRevenue = Math.max(...revenueValues, 0);

    if (!sortedTrends.length || maxRevenue <= 0) {
        return (
            <p className="text-xs text-slate-500 sm:text-sm">
                Historical financial data is unavailable.
            </p>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="flex h-32 items-end gap-2 border-b border-l border-slate-200 px-2 pb-2 pt-3 sm:h-44 sm:gap-4 sm:px-3 sm:pt-4">
                {sortedTrends.map((item) => {
                    const revenue = Number(item.revenue);
                    const height = Number.isFinite(revenue)
                        ? Math.max(8, (revenue / maxRevenue) * 100)
                        : 8;

                    return (
                        <div key={item.year} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5 sm:gap-2">
                            <span className="text-center text-[10px] font-semibold text-slate-600 sm:text-xs">
                                {safeFormat(item.revenue, formatMoney, currency, unit)}
                            </span>
                            <div
                                className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-400 sm:max-w-16"
                                style={{ height: `${height}%` }}
                                title={`${item.year}: ${safeFormat(item.revenue, formatMoney, currency, unit)}`}
                            />
                            <span className="text-[11px] text-slate-500 sm:text-xs">{item.year}</span>
                        </div>
                    );
                })}
            </div>
            <p className="text-[11px] text-slate-500 sm:text-xs">
                Revenue trend based on the historical years available in this report.
            </p>
        </div>
    );
}

function ReportView({ report }) {
    const [activeTab, setActiveTab] = useState('overview');
    const f = report.financials ?? {};
    const profitLoss = f.profit_loss ?? {};
    const debt = f.debt_structure ?? {};
    const liquidity = f.liquidity ?? {};
    const trends = Array.isArray(f.historical_trend) ? f.historical_trend : [];
    const redFlags = Array.isArray(report.redFlags) ? report.redFlags : [];
    const newsSources = Array.isArray(report.newsSources) ? report.newsSources : [];
    const dataSource = f.data_source ?? {};
    const warnings = Array.isArray(f.data_warnings) ? f.data_warnings : [];
    const notes = Array.isArray(f.notes) ? f.notes : [];
    const companyName = report.companyName ?? f.company_name ?? 'Company report';
    const currency = f.currency;
    const unit = f.unit;

    const revenue = safeFormat(profitLoss.revenue, formatMoney, currency, unit);
    const netProfit = safeFormat(profitLoss.net_profit, formatMoney, currency, unit);
    const totalDebt = safeFormat(debt.total_debt, formatMoney, currency, unit);
    const revenueGrowth = safeFormat(f.yoy_revenue_growth, formatGrowth);
    const profitGrowth = safeFormat(f.yoy_profit_growth, formatGrowth);
    const debtGrowth = safeFormat(f.yoy_debt_growth, formatGrowth);

    const currentRatioValue = Number(liquidity.current_ratio);
    const hasCurrentRatio = hasValue(liquidity.current_ratio) && Number.isFinite(currentRatioValue);

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 20
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            transition={{
                duration: 0.6,
                ease: "easeOut"
            }}
            className="mt-3 space-y-3 sm:mt-5 sm:space-y-5">
            {/* Company heading */}
            <motion.section
                initial={{
                    opacity: 0,
                    y: 15
                }}
                animate={{
                    opacity: 1,
                    y: 0
                }}
                transition={{
                    duration: 0.6,
                    ease: "easeOut"
                }}
                className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-xl sm:rounded-3xl sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4">
                    <div className="min-w-0">
                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 10,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                duration: 0.4,
                                delay: 0.2
                            }}
                            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-600 sm:text-xs sm:tracking-[0.18em]">
                            Financial due diligence report
                        </motion.p>
                        <motion.h1
                            initial={{
                                opacity: 0,
                                y: 12
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                duration: 0.5,
                                delay: 0.3
                            }}
                            className="mt-1.5 wrap-break-word text-xl font-bold leading-tight tracking-tight text-slate-900 sm:mt-2 sm:text-3xl sm:leading-normal">
                            {companyName}
                        </motion.h1>
                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 10
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                duration: 0.5,
                                delay: 0.4
                            }}
                            className="mt-1.5 text-xs text-slate-500 sm:mt-2 sm:text-sm">
                            {[f.symbol, f.sector, f.country].filter(hasValue).join(' · ') || 'Company information'}
                        </motion.p>
                    </div>
                    <RiskPill riskLevel={report.riskLevel} />
                </div>
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.85
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1
                    }}
                    transition={{
                        duration: 0.5,
                        delay: 0.5,
                        ease: "easeOut"
                    }}
                    className="mt-4 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3 sm:mt-5 sm:grid-cols-4 sm:gap-3 sm:pt-4">
                    <InfoItem label="Financial year" value={f.financial_year ?? ''} />
                    <InfoItem label="Currency" value={currency ?? 'Not available'} />
                    <InfoItem label="Country" value={f.country ?? 'Not available'} />
                    <InfoItem label="Data provider" value={dataSource.provider ?? 'Not available'} />
                </motion.div>
            </motion.section>

            {/* Top-level KPIs */}
            <motion.div
                variants={kpiContainerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4"
            >
                <motion.div variants={kpiItemVariants}>
                    <MetricTile label="Revenue" value={revenue} hint={hasValue(revenueGrowth) ? `${revenueGrowth} YoY` : 'Annual growth unavailable'} tone={signTone(f.yoy_revenue_growth)} />
                </motion.div>
                <motion.div variants={kpiItemVariants}>
                    <MetricTile label="Net profit" value={netProfit} hint={hasValue(profitGrowth) ? `${profitGrowth} YoY` : 'Annual growth unavailable'} tone={signTone(profitLoss.net_profit)} />
                </motion.div>
                <motion.div variants={kpiItemVariants}>
                    <MetricTile label="Total debt" value={totalDebt} hint={hasValue(debtGrowth) ? `${debtGrowth} YoY` : 'Annual growth unavailable'} tone={signTone(f.yoy_debt_growth, 'warning', 'neutral')} />
                </motion.div>
                <motion.div variants={kpiItemVariants}>
                    <MetricTile label="Current ratio" value={safeFormat(liquidity.current_ratio, formatRatio)} hint="Short-term liquidity indicator" tone={hasCurrentRatio && currentRatioValue < 1 ? 'warning' : 'neutral'} />
                </motion.div>
            </motion.div>

            {/* Report tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Report sections">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id} type="button" role="tab" aria-selected={isActive} onClick={() => setActiveTab(tab.id)}
                                className={`relative shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${isActive
                                    ? "text-indigo-700" : "text-slate-500 hover:bg-white/70 hover:text-slate-900"}`}  >
                                {isActive && (
                                    <motion.span layoutId="active-report-tab" className="absolute inset-0 rounded-xl border border-indigo-200 bg-indigo-50"
                                        transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.8 }} />
                                )}
                                <span className="relative z-10">
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={activeTab}
                    initial={{
                        opacity: 0,
                        y: 10
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    exit={{
                        opacity: 0,
                        y: -8
                    }}
                    transition={{
                        duration: 0.25,
                        ease: "easeOut"
                    }}
                >

                    {/* Overview tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-3 sm:space-y-4">
                            <SectionCard title="Executive summary" description="AI-generated interpretation of the available financial data.">
                                <p className="whitespace-pre-line text-xs leading-6 text-slate-700 sm:text-sm sm:leading-7">
                                    {report.llmSummary || 'An executive summary has not been generated for this report.'}
                                </p>
                            </SectionCard>

                            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                                <SectionCard title="Revenue trend" description="Historical revenue from the financial data returned by the provider.">
                                    <TrendChart trends={trends} currency={currency} unit={unit} />
                                </SectionCard>
                                <SectionCard title="At-a-glance indicators" description="Selected profitability, leverage and liquidity metrics.">
                                    <DataRow label="Net profit margin" value={safeFormat(profitLoss.net_profit_margin, formatPercent)} />
                                    <DataRow label="Debt-to-equity" value={safeFormat(debt.debt_to_equity_ratio, formatRatio)} />
                                    <DataRow label="Interest coverage" value={safeFormat(debt.interest_coverage_ratio, formatRatio)} />
                                    <DataRow label="Cash & equivalents" value={safeFormat(debt.cash_and_equivalents, formatMoney, currency, unit)} />
                                </SectionCard>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                                <SectionCard title="Key strengths">
                                    <p className="text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                                        {hasValue(profitLoss.net_profit) && Number(profitLoss.net_profit) > 0
                                            ? 'The company reported positive net profit in the selected financial year.'
                                            : 'Profitability cannot be assessed from the available net profit value.'}
                                    </p>
                                    <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                                        {hasValue(debt.interest_coverage_ratio)
                                            ? `Interest coverage is ${safeFormat(debt.interest_coverage_ratio, formatRatio)} based on the supplied financial data.`
                                            : 'Interest coverage data is not available.'}
                                    </p>
                                </SectionCard>
                                <SectionCard title="Areas to investigate">
                                    {redFlags.length > 0 ? (
                                        <ul className="list-disc space-y-1.5 pl-4 text-xs leading-5 text-slate-600 sm:space-y-2 sm:pl-5 sm:text-sm sm:leading-6">
                                            {redFlags.map((flag, index) => <li key={`${flag}-${index}`}>{flag}</li>)}
                                        </ul>
                                    ) : (
                                        <p className="text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">No red flags are recorded. This does not necessarily mean that no risks exist.</p>
                                    )}
                                </SectionCard>
                            </div>
                        </div>
                    )}

                    {/* Financials tab */}
                    {activeTab === 'financials' && (
                        <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
                            <SectionCard title="Profit & loss" description={`${f.financial_year ?? 'Selected year'} · ${currency ?? 'Currency not specified'}`}>
                                <DataRow label="Revenue" value={revenue} />
                                <DataRow label="Operating profit" value={safeFormat(profitLoss.operating_profit, formatMoney, currency, unit)} />
                                <DataRow label="Net profit" value={netProfit} />
                                <DataRow label="Net profit margin" value={safeFormat(profitLoss.net_profit_margin, formatPercent)} />
                                <DataRow label="Total expenses" value={safeFormat(profitLoss.total_expenses, formatMoney, currency, unit)} />
                            </SectionCard>
                            <SectionCard title="Debt structure">
                                <DataRow label="Total debt" value={totalDebt} />
                                <DataRow label="Total equity" value={safeFormat(debt.total_equity, formatMoney, currency, unit)} />
                                <DataRow label="Cash & equivalents" value={safeFormat(debt.cash_and_equivalents, formatMoney, currency, unit)} />
                                <DataRow label="Interest expense" value={safeFormat(debt.interest_expense, formatMoney, currency, unit)} />
                                <DataRow label="Interest rate" value={safeFormat(debt.interest_rate_percent, formatPercent)} />
                                <DataRow label="Debt-to-equity" value={safeFormat(debt.debt_to_equity_ratio, formatRatio)} />
                                <DataRow label="Interest coverage" value={safeFormat(debt.interest_coverage_ratio, formatRatio)} />
                            </SectionCard>
                            <SectionCard title="Liquidity">
                                <DataRow label="Current ratio" value={safeFormat(liquidity.current_ratio, formatRatio)} />
                                <DataRow label="Current assets" value={safeFormat(liquidity.current_assets, formatMoney, currency, unit)} />
                                <DataRow label="Current liabilities" value={safeFormat(liquidity.current_liabilities, formatMoney, currency, unit)} />
                                <DataRow
                                    label="Working capital (calculated)"
                                    value={hasValue(liquidity.current_assets) && hasValue(liquidity.current_liabilities)
                                        ? safeFormat(Number(liquidity.current_assets) - Number(liquidity.current_liabilities), formatMoney, currency, unit)
                                        : 'Not available'}
                                />
                            </SectionCard>
                            <SectionCard title="Year-over-year growth">
                                <DataRow label="Revenue growth" value={revenueGrowth} />
                                <DataRow label="Profit growth" value={profitGrowth} />
                                <DataRow label="Debt growth" value={debtGrowth} />
                            </SectionCard>
                            <SectionCard title="Historical financial data" className="xl:col-span-2">
                                {trends.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-80 text-left text-xs sm:min-w-130 sm:text-sm">
                                            <thead className="text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs">
                                                <tr><th className="py-2 pr-2 sm:py-3 sm:pr-4">Year</th><th className="py-2 pr-2 sm:py-3 sm:pr-4">Revenue</th><th className="py-2 pr-2 sm:py-3 sm:pr-4">Net profit</th><th className="py-2 sm:py-3">Total debt</th></tr>
                                            </thead>
                                            <tbody>
                                                {[...trends].sort((a, b) => Number(b.year) - Number(a.year)).map((item) => (
                                                    <tr key={item.year} className="border-t border-slate-100">
                                                        <td className="py-2 pr-2 font-semibold text-slate-800 sm:py-3 sm:pr-4">{item.year}</td>
                                                        <td className="py-2 pr-2 text-slate-600 sm:py-3 sm:pr-4">{safeFormat(item.revenue, formatMoney, currency, unit)}</td>
                                                        <td className="py-2 pr-2 text-slate-600 sm:py-3 sm:pr-4">{safeFormat(item.net_profit, formatMoney, currency, unit)}</td>
                                                        <td className="py-2 text-slate-600 sm:py-3">{safeFormat(item.total_debt, formatMoney, currency, unit)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 sm:text-sm">Historical financial data is unavailable.</p>
                                )}
                            </SectionCard>
                        </div>
                    )}

                    {/* Risk analysis tab */}
                    {activeTab === 'risks' && (
                        <div className="space-y-3 sm:space-y-4">
                            <SectionCard title="Risk assessment" description="Flags stored with this report. A flag indicates an area for investigation, not proof of wrongdoing.">
                                {redFlags.length > 0 ? (
                                    <div className="space-y-2 sm:space-y-3">
                                        {redFlags.map((flag, index) => (
                                            <div key={`${flag}-${index}`} className="flex gap-2 rounded-xl border border-rose-100 bg-rose-50/70 p-3 sm:gap-3 sm:p-4">
                                                <span className="mt-0.5 text-xs text-rose-600 sm:text-base">●</span>
                                                <p className="text-xs leading-5 text-rose-900 sm:text-sm sm:leading-6">{flag}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 sm:text-sm">No red flags are recorded in this report.</p>
                                )}
                            </SectionCard>
                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                                <SectionCard title="Liquidity indicator">
                                    <p className="text-2xl font-bold text-slate-900 sm:text-3xl">{safeFormat(liquidity.current_ratio, formatRatio)}</p>
                                    <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">Current ratio</p>
                                    {hasCurrentRatio && currentRatioValue < 1 && (
                                        <p className="mt-3 rounded-xl bg-amber-50 p-2.5 text-xs leading-5 text-amber-900 sm:p-3 sm:text-sm sm:leading-6">
                                            Current liabilities are greater than current assets. Review short-term obligations, receivables and inventory quality.
                                        </p>
                                    )}
                                </SectionCard>
                                <SectionCard title="Further investigation">
                                    <ul className="list-disc space-y-1.5 pl-4 text-xs leading-5 text-slate-600 sm:space-y-2 sm:pl-5 sm:text-sm sm:leading-6">
                                        <li>Review the company's short-term payment obligations.</li>
                                        <li>Compare debt changes with operating cash flow.</li>
                                        <li>Review interest costs and debt repayment schedules.</li>
                                    </ul>
                                    <p className="mt-3 text-[11px] text-slate-500 sm:text-xs">These are suggested review steps, not additional detected red flags.</p>
                                </SectionCard>
                            </div>
                        </div>
                    )}

                    {/* News tab */}
                    {activeTab === 'news' && (
                        <SectionCard title="News intelligence" description="Articles attached to this analysis. Summaries and sentiment are shown only if your backend supplies them.">
                            {newsSources.length > 0 ? (
                                <div className="space-y-3 sm:space-y-4">
                                    {newsSources.map((item, index) => (
                                        <article key={item._id ?? item.url ?? index} className="rounded-xl border border-slate-100 p-3 sm:p-4">
                                            <h4 className="text-sm font-semibold leading-5 text-slate-800 sm:text-base sm:leading-6">{item.title ?? 'Untitled article'}</h4>
                                            {item.publishedAt && <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">{new Date(item.publishedAt).toLocaleDateString()}</p>}
                                            {item.summary && <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">{item.summary}</p>}
                                            {item.url && (
                                                <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-medium text-indigo-700 hover:text-indigo-900 sm:mt-3 sm:text-sm">
                                                    Read original article <span className="ml-1" aria-hidden="true">↗</span>
                                                </a>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 sm:text-sm">No news articles are attached to this report.</p>
                            )}
                            <p className="mt-3 rounded-xl bg-slate-50 p-2.5 text-[11px] leading-4 text-slate-500 sm:mt-4 sm:p-3 sm:text-xs sm:leading-5">
                                News is presented as qualitative context. Financial figures should come from verified financial statements or your finance data provider.
                            </p>
                        </SectionCard>
                    )}

                    {/* Sources tab */}
                    {activeTab === 'sources' && (
                        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                            <SectionCard title="Financial data source">
                                <DataRow label="Provider" value={dataSource.provider ?? 'Internal Finance Dataset'} />
                                <DataRow label="Source type" value={dataSource.type ?? 'RAG-based Retrieval'} />
                                {/* <DataRow label="Endpoints" value={dataSource.source_name ?? 'Not available'} /> */}
                                <DataRow label="Financial year" value={f.financial_year ?? 'Not available'} />
                            </SectionCard>
                            <SectionCard title="Data quality">
                                <DataRow label="Warnings" value={warnings.length ? `${warnings.length} warning(s)` : 'None recorded'} />
                                <DataRow label="Analysis notes" value={notes.length ? `${notes.length} note(s)` : 'None recorded'} />
                                <DataRow label="Historical years" value={trends.length ? trends.map((item) => item.year).join(', ') : 'Not available'} />
                                <DataRow label="News articles" value={String(newsSources.length)} />
                            </SectionCard>
                            {warnings.length > 0 && (
                                <SectionCard title="Data warnings" className="lg:col-span-2">
                                    <ul className="list-disc space-y-1.5 pl-4 text-xs text-amber-800 sm:space-y-2 sm:pl-5 sm:text-sm">{warnings.map((warning, index) => <li key={index}>{String(warning)}</li>)}</ul>
                                </SectionCard>
                            )}
                            {notes.length > 0 && (
                                <SectionCard title="Analysis notes" className="lg:col-span-2">
                                    <ul className="list-disc space-y-1.5 pl-4 text-xs text-slate-600 sm:space-y-2 sm:pl-5 sm:text-sm">{notes.map((note, index) => <li key={index}>{String(note)}</li>)}</ul>
                                </SectionCard>
                            )}
                            <SectionCard title="Metrics not included in this record" className="lg:col-span-2">
                                <p className="text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                                    The current report schema does not provide every possible financial metric. Missing values are shown as “Not available” rather than estimated or fabricated. For example, total assets, total liabilities and cash-flow statement values are not part of the fields used by this dashboard.
                                </p>
                            </SectionCard>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}

const Dashboard = () => {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const { user, logout } = useAuth();
    const [query, setQuery] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const { status, report, error } = useJobPolling(jobId);
    const [historyKey, setHistoryKey] = useState(0);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    useEffect(() => {
        if (report) setHistoryKey((k) => k + 1);
    }, [report]);

    useEffect(() => {
        if (!profileRef) return;

        const handleOutSideClick = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }

        const handleescape = (event) => {
            if (event.key === "Escape") {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("pointerdown", handleOutSideClick);
        document.addEventListener("keydown", handleescape);
        return () => {
            document.removeEventListener("pointerdown", handleOutSideClick);
            document.removeEventListener("keydown", handleescape);
        };
    }, [isProfileOpen]);

    const isRunning = Boolean(jobId) && !report && status !== 'failed' && !error;

    return (
        <div className="relative flex h-dvh flex-col overflow-hidden  overflow-x-hidden  bg-[#E8E8E8] text-slate-900">
            <BackgroundDecor />

            <motion.header
                initial={{
                    opacity: 0,
                    y: 20
                }}
                animate={{
                    opacity: 1,
                    y: 0
                }}
                transition={{
                    duration: 0.6,
                    ease: "easeOut"
                }}
                className="mx-auto flex items-center justify-between sticky top-0 z-50 shrink-0 px-3 py-1.5 ml-2 mr-2 mt-3 max-w-7xl rounded-full border border-white/20 bg-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl backdrop-saturate-150 sm:mt-6 sm:px-6 sm:py-2">
                <button type="button" onClick={() => navigate('/dashboard')} className="flex min-w-0 items-center gap-2 text-left sm:gap-3">
                    <img src="/logo2.png" alt="Due Diligence Finance Agent" className="h-8 w-8 rounded-xl object-contain sm:h-10 sm:w-10" />
                    <span className="min-w-0 leading-tight">
                        <span className="text-sm font-sans font-semibold text-black tracking-tight sm:text-base">Due Diligence</span>
                        <span className="block text-xs font-normal text-gray-800 sm:text-base">Finance Agent</span>
                    </span>
                </button>

                <div className="relative" ref={profileRef}>
                    <button
                        type="button"
                        onClick={() => setIsProfileOpen((open) => !open)}
                        aria-expanded={isProfileOpen}
                        className="flex items-center gap-2 rounded-full px-1.5 py-1 transition hover:bg-white/80 sm:gap-3 sm:px-3 sm:py-1.5"
                    >
                        <span className="max-w-20 truncate text-xs font-medium text-slate-700 sm:max-w-28 sm:text-sm">{user?.name ?? 'Account'}</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white sm:h-9 sm:w-9 sm:text-sm">
                            {user?.name?.trim()?.[0]?.toUpperCase() || 'U'}
                        </span>
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-full border border-slate-200 bg-white p-2 shadow-xl">
                            <button
                                type="button"
                                onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                                className="w-full rounded-full px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </motion.header>

            {/* Phone/tablet only: "+ New analysis" stays visible below the header (sidebar is hidden here) */}
            <div className="relative z-10 mx-auto mt-3 w-[calc(100%-1.5rem)] max-w-375 shrink-0 lg:hidden">
                <motion.button
                    whileTap={{
                        scale: 0.98
                    }}
                    transition={{
                        duration: 0.2,
                        ease: "easeOut"
                    }}
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                >
                    + New analysis
                </motion.button>
            </div>

            <div className="relative z-10 mx-auto mt-3 grid w-[calc(100%-1.5rem)] max-w-375 flex-1 min-h-0 gap-5 overflow-hidden sm:mt-5 lg:grid-cols-[240px_minmax(0,1fr)]">
                {/* History sidebar: hidden on phone/tablet, visible on desktop (lg+) */}
                <motion.aside
                    initial={{
                        opacity: 0,
                        x: -30
                    }}
                    animate={{
                        opacity: 1,
                        x: 0
                    }}
                    transition={{
                        duration: 0.7,
                        delay: 0.2,
                        ease: "easeOut"
                    }}
                    className="mb-8 hidden min-h-0 flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/65 p-4 shadow-sm backdrop-blur-xl lg:flex">
                    <motion.button
                        whileTap={{
                            scale: 0.98
                        }}
                        transition={{
                            duration: 0.2,
                            ease: "easeOut"
                        }}
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition "
                    >
                        + New analysis
                    </motion.button>
                    <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden">
                        <p className="mb-3 shrink-0 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400"> Recent reports </p>
                        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain custom-scrollbar">
                            <HistoryList activeJobId={jobId} refreshKey={historyKey} />
                        </div>
                    </div>
                </motion.aside>

                <main className="flex min-h-0 min-w-0 flex-col overflow-y-auto overflow-x-hidden overscroll-contain pb-6 custom-scrollbar *:shrink-0 sm:pb-8 lg:block">
                    <div className="p-1.5 sm:p-4">
                        <CompanySearchForm value={query} onChange={setQuery} disabled={isRunning} />
                    </div>

                    {error ? (
                        <div role="alert" className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 sm:mt-5 sm:p-5 sm:text-sm">
                            Something went wrong while running the analysis. Please try again.
                        </div>
                    ) : jobId && !report ? (
                        <div className="mt-3 flex grow flex-col rounded-2xl border border-white/70 bg-white/75 p-2 shadow-sm backdrop-blur-xl sm:p-3 lg:block">
                            <JobProgress status={status} />
                        </div>
                    ) : report ? (
                        <ReportView key={report.jobId ?? jobId ?? report.companyName} report={report} />
                    ) : (
                        <section className="mt-2 flex grow flex-col items-center justify-center rounded-2xl border border-white/70 bg-white/70 px-4 py-6 text-center shadow-sm backdrop-blur-xl sm:rounded-3xl sm:px-10 sm:py-10 lg:block">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-700 sm:h-14 sm:w-14 sm:text-2xl">⌕</div>
                            <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Start your financial analysis</h1>
                            <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                                Search for a company to review its financial performance, key ratios, potential risks and related news.
                            </p>

                            <p className="mt-5 text-[11px] font-medium text-slate-400 sm:hidden">Try one of these</p>
                            <div className="mt-2 flex w-full flex-col gap-2 sm:mt-6 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
                                {examples.map((example) => (
                                    <button
                                        key={example}
                                        type="button"
                                        onClick={() => setQuery(example)}
                                        className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 sm:w-auto sm:py-2"
                                    >
                                        {example}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-5 grid w-full grid-cols-2 gap-2 text-left sm:hidden">
                                {[
                                    ['Financial ratios', 'Debt, liquidity and profitability'],
                                    ['Multi-year trends', 'How key metrics change'],
                                    ['Red flags', 'Metrics crossing risk limits'],
                                    ['Latest news', 'Recent context for the analysis'],
                                ].map(([title, hint]) => (
                                    <div key={title} className="rounded-xl border border-white/80 bg-white/70 px-3 py-2.5">
                                        <p className="text-xs font-semibold text-slate-800">{title}</p>
                                        <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{hint}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;