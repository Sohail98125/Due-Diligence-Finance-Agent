import Navbar from "../components/layout/Navbar.jsx";
import { useNavigate, Link } from "react-router-dom";
import BackgroundDecor from "../utils/BackgroundDecor.jsx";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

const steps = [
    {
        title: "Submit Your Request",
        desc: "Type your free request or a Company Name, like 'Is IBM's profit growth sustainable?'or 'Analyze TCS'"
    },
    {
        title: "Financial Analysis",
        desc: "It pulls financials, computes ratios and trends, checks red flags and scans recent news. You can watch the progress live."
    },
    {
        title: "Review Your Report",
        desc: "Get a risk level, a clear summary , key metrics, red flags and news sources. Every past report stays in the history"
    }
]

const SAMPLE = {
    risk: "Medium risk",
    summary:
        "Overall risk is moderate. Debt is rising across recent years while liquidity stays adequate.",
    metrics: [
        { label: "Debt ratio", value: "0.82x" },
        { label: "Liquidity", value: "1.4" },
        { label: "Net margin", value: "11%" },
    ],
};

const features = [
    {
        title: "Financial Ratios",
        desc: "Debt, liquidity and profitability."
    },
    {
        title: "Multi-Year Trends",
        desc: "Track how key financial metrics change across years."
    },
    {
        title: "Red Flags",
        desc: "Identify financial metrics that cross predefined risk thresholds."
    },
    {
        title: "Latest News",
        desc: "Review relevant recent news that may provide additional context for the analysis."
    },
]
const Home = () => {
    const navigate = useNavigate();
    const demoQuery = "Is IBM's profit growth sustainable?"
    const [showReport, setShowReport] = useState(false);
    const [typedText, setTypedText] = useState("");

    const constantVarient = {
        hidden: {
            opacity: 0
        },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.2
            }
        }
    };

    const itemVarients = {
        hidden: {
            opacity: 0,
            y: 10
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            }
        }
    }

    useEffect(() => {
        let index = 0;
        let reportTimer;
        const typingTimer = setInterval(() => {
            index++;

            setTypedText(demoQuery.slice(0, index));

            if (index >= demoQuery.length) {
                clearInterval(typingTimer);

                // Typing complete hone ke 2 sec baad report
                reportTimer = setTimeout(() => {
                    setShowReport(true);
                }, 1500);
            }
        }, 65);
        return () => {
            clearInterval(typingTimer);
            clearTimeout(reportTimer);
        };
    }, []);

    const handleStarted = () => {
        navigate("/login")
    }

    const typedWords = typedText.split(" ");

    return (
        <div className="relative isolate min-h-screen overflow-x-hidden bg-[#E8E8E8]">
            <BackgroundDecor />
            <div>
                {/* navbar */}
                <Navbar />
            </div>

            {/* Hero */}
            <section className="relative z-10 mx-auto grid w-full max-w-375 grid-cols-2 items-center gap-3 px-3 py-5 md:gap-8 md:px-6 md:py-8 lg:min-h-[70vh] lg:gap-16 lg:px-10 lg:py-10">

                {/* LEFT */}
                <motion.div
                    variants={constantVarient}
                    initial="hidden"
                    animate="visible"
                    className="flex min-w-0 flex-col items-start gap-1.5 md:gap-3 lg:gap-4" >
                    <motion.p variants={itemVarients} className="rounded-full border border-white bg-white/30 px-2 py-1 text-[7px] font-medium text-indigo-600 shadow-sm md:px-3 md:py-1.5 md:text-xs lg:px-4 lg:py-2 lg:text-sm" > ✦ AI-Powered Financial Intelligence </motion.p>

                    <motion.h1 variants={itemVarients} className="max-w-162.5 text-xl font-bold leading-[1.05] tracking-tight md:text-4xl lg:text-6xl" >
                        Due Diligence
                        <span className="block">Finance Agent</span>
                    </motion.h1>

                    <motion.p variants={itemVarients} className="text-[10px] leading-snug text-gray-600 md:text-sm lg:text-lg">
                        Look beyond the numbers. Understand the risk.
                    </motion.p>

                    <motion.button
                        variants={itemVarients}
                        className="mt-1 rounded-full bg-black px-4 py-2 text-[11px] font-semibold text-white shadow-lg transition hover:bg-white hover:text-black md:px-7 md:py-3 md:text-sm lg:px-9 lg:py-4 lg:text-base"
                        onClick={handleStarted}
                    >
                        Get Started
                    </motion.button>
                </motion.div>

                {/* RIGHT */}
                <motion.div
                    initial={{
                        opacity: 0,
                        x: 40,
                        scale: 0.97
                    }}
                    animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1
                    }}
                    transition={{
                        duration: 0.8,
                        ease: "easeOut"
                    }}
                    whileHover={{ x: -0.5 }}
                    className="flex w-full min-w-0 max-w-135 flex-col gap-2 md:gap-3 lg:gap-4">

                    {/* Animated search preview */}
                    <div className="flex items-center gap-1.5 rounded-full bg-white/70 py-1.5 pl-3 pr-1.5 shadow-[0_10px_32px_rgba(0,0,0,0.10)] md:gap-2 md:py-2 md:pl-4 md:pr-2 lg:gap-3 lg:py-2.5 lg:pl-6 lg:pr-2.5">
                        <span className="min-w-0 flex-1 text-[9px] leading-tight md:text-sm lg:text-lg">
                            {/* words never break in the middle, only between words */}
                            {typedWords.map((word, wi) => (
                                <span key={wi}>
                                    <span className="inline-block whitespace-nowrap">
                                        {word.split("").map((char, ci) => (
                                            <motion.span
                                                key={ci}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className="inline-block"
                                            >
                                                {char}
                                            </motion.span>
                                        ))}
                                    </span>
                                    {wi < typedWords.length - 1 && " "}
                                </span>
                            ))}

                            {!showReport && (
                                <span className="animate-pulse">|</span>
                            )}
                        </span>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-sm text-white md:h-9 md:w-9 md:text-xl lg:h-11 lg:w-11 lg:text-2xl">→</span>
                    </div>

                    {/* Sample Report */}
                    <div className="flex flex-col gap-2 rounded-2xl border border-white/50 bg-white/55 p-3 shadow-[0_15px_45px_rgba(0,0,0,0.07)] backdrop-blur-xl md:gap-4 md:rounded-3xl md:p-4 lg:gap-5 lg:p-7">

                        <div className="flex items-center justify-between gap-1">
                            <h3 className="text-[11px] font-semibold md:text-base lg:text-lg">
                                Sample Report
                            </h3>

                            <span className="shrink-0 rounded-full bg-black px-2 py-0.5 text-[8px] font-semibold text-white md:px-3 md:py-1 md:text-xs lg:px-3.5 lg:py-1.5 lg:text-sm">
                                {showReport ? SAMPLE.risk : "Risk level"}
                            </span>
                        </div>

                        {showReport ? (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 10
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}
                                transition={{
                                    duration: 0.6,
                                    ease: "easeOut"
                                }}
                                className="flex min-h-9 flex-col justify-between text-[8px] leading-3.5 text-gray-700 md:min-h-12 md:text-xs md:leading-5 lg:min-h-14 lg:text-sm lg:leading-5"
                            >
                                {SAMPLE.summary}
                            </motion.div>
                        ) : (
                            <div className="flex min-h-9 flex-col gap-1.5 md:min-h-12 md:gap-2.5 lg:min-h-14">
                                <div className="h-1.5 w-11/12 rounded-md bg-black/10 md:h-2.5 lg:h-3" />
                                <div className="h-1.5 w-3/4 rounded-md bg-black/10 md:h-2.5 lg:h-3" />
                                <div className="h-1.5 w-3/5 rounded-md bg-black/10 md:h-2.5 lg:h-3" />
                            </div>
                        )}

                        {/* Metrics - same 3 column grid */}
                        <div className="grid grid-cols-3 gap-1 md:gap-2 lg:gap-3">
                            {showReport
                                ? SAMPLE.metrics.map((m) => (
                                    <div
                                        key={m.label}
                                        className="flex h-10 min-w-0 flex-col justify-center rounded-xl bg-white px-1.5 md:h-16 md:rounded-2xl md:px-2 lg:h-18 lg:px-4" >
                                        <p className="truncate text-[7px] text-gray-500 md:text-xs lg:text-sm">{m.label} </p>
                                        <p className="text-xs font-bold md:text-base lg:text-xl">{m.value} </p>
                                    </div>
                                ))
                                : [0, 1, 2].map((i) => (
                                    <div key={i} className="h-10 rounded-xl bg-white md:h-16 md:rounded-2xl lg:h-18" />
                                ))
                            }
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* what it does */}
            <section id="Features" className="relative z-10 mx-auto flex w-full max-w-375 flex-col gap-5 px-3 py-5 md:gap-8 md:px-6 md:py-8 lg:gap-10 lg:px-10 lg:py-10">
                <motion.h2
                    initial={{
                        opacity: 0,
                        y: 25
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0
                    }}
                    viewport={{
                        once: true,
                        amount: 0.5
                    }}
                    transition={{
                        duration: 0.8,
                        delay: 0.4,
                        ease: "easeOut"
                    }}
                    className="text-center text-[15px] font-bold leading-[1.05] tracking-tight md:text-3xl lg:text-5xl">
                    What is Due Diligence Finance Agent?
                </motion.h2>
                <motion.div
                    variants={constantVarient}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-1 rounded-2xl border border-white/30 bg-white/30 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl backdrop-saturate-150 md:gap-3 md:rounded-3xl md:p-3">
                    <motion.div
                        variants={itemVarients}
                        className="flex min-w-0 flex-col justify-center p-2 md:p-6 lg:p-9">
                        <h3 className="mb-1.5 text-[10px] font-bold tracking-wide text-black md:mb-5 md:text-xl">Problem</h3>
                        <p className="text-[8px] leading-3.5 text-gray-600 md:text-base md:leading-7">
                            Assessing a company's financial health means collecting data from multiple sources, calculating financial ratios, tracking performance trends, and reviewing recent news. Doing this manually takes time and makes it harder to spot important risk indicators.
                        </p>
                    </motion.div>
                    <div className="flex items-center justify-center">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#222222] text-[10px] text-white md:h-12 md:w-12 md:text-xl">→</span>
                    </div>
                    <motion.div
                        variants={itemVarients}
                        className="flex min-w-0 flex-col items-start gap-1 rounded-xl border border-white/70 bg-white/65 p-2 shadow-[0_8px_25px_rgba(0,0,0,0.04)] md:gap-4 md:rounded-2xl md:p-6 lg:p-9">
                        <h3 className="mb-1.5 text-[10px] font-bold tracking-wide text-black md:mb-5 md:text-xl">Solution</h3>
                        <p className="text-[8px] leading-3.5 text-gray-600 md:text-base md:leading-7">
                            DD Finance Agent automates the initial financial review. Submit a company request, and the agent gathers available financial data, calculates key metrics, identifies potential red flags, and generates a structured report with an overall risk assessment.
                        </p>
                    </motion.div>
                </motion.div>

                {/* 4 feature cards (stay in one row on phone) */}
                <motion.div
                    variants={constantVarient}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-4 gap-1.5 md:gap-3 lg:gap-4">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            variants={itemVarients}
                            className="flex min-w-0 flex-col gap-1.5 rounded-xl border border-white/30 bg-white/30 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl md:gap-3 md:rounded-3xl md:p-4 lg:gap-3.5 lg:p-6">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[8px] font-bold text-slate-700 md:h-9 md:w-9 md:text-xs lg:h-10 lg:w-10 lg:text-sm">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <h3 className="text-[9px] font-bold leading-tight md:text-base lg:text-xl">{f.title}</h3>
                            <p className="wrap-break-word text-[8px] leading-3 text-gray-600 md:text-xs md:leading-normal lg:text-base">{f.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* how to use it */}
            <section id="how-it-works" className="relative z-10 mx-auto w-full max-w-375 px-3 py-5 md:px-6 md:py-8 lg:px-10 lg:py-10">
                <motion.h2
                    initial={{
                        opacity: 0,
                        y: 25
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0
                    }}
                    viewport={{
                        once: true,
                        amount: 0.5
                    }}
                    transition={{
                        duration: 0.8,
                        delay: 0.4,
                        ease: "easeOut"
                    }}
                    className="text-center text-[15px] font-bold leading-[1.05] tracking-tight md:text-3xl lg:text-5xl">
                    From a simple request to financial insight
                </motion.h2>
                <div className="mt-5 flex flex-col gap-2 md:mt-8 md:gap-4 lg:mt-12 lg:gap-5">
                    {steps.map((s, i) => (
                        <div
                            key={s.title}
                            className="grid grid-cols-2 items-center gap-2 rounded-2xl border border-white/30 bg-white/30 p-3 shadow-[0_15px_45px_rgba(0,0,0,0.07)] backdrop-blur-xl md:gap-6 md:rounded-3xl md:p-6 lg:gap-16 lg:px-12 lg:py-10">
                            {/* title: step 2 mein right side aur right-aligned */}
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    x: i % 2 === 0 ? -60 : 60
                                }}
                                whileInView={{
                                    opacity: 1,
                                    x: 0
                                }}
                                viewport={{
                                    once: true,
                                    amount: 0.3
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: "easeOut"
                                }}
                                className={`min-w-0 ${i % 2 ? "order-2 text-right" : ""}`}>
                                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-500 md:text-xs lg:text-sm">Step {i + 1}</p>
                                <h3 className="mt-0.5 text-sm font-bold md:mt-2 md:text-2xl lg:text-4xl">{s.title}</h3>
                            </motion.div>
                            {/* description: step 2 mein left side */}
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    x: i % 2 === 0 ? 60 : -60
                                }}
                                whileInView={{
                                    opacity: 1,
                                    x: 0
                                }}
                                viewport={{
                                    once: true,
                                    amount: 0.3
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: "easeOut"
                                }}
                                className="flex min-w-0 flex-col items-start gap-2 rounded-2xl border border-white/70 bg-white/65 p-3 shadow-[0_8px_25px_rgba(0,0,0,0.04)] md:gap-4 md:rounded-3xl md:p-6 lg:rounded-4xl lg:p-9">
                                <p className="text-[9px] leading-snug text-gray-600 md:text-base md:leading-relaxed lg:text-lg">{s.desc}</p>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 mx-auto w-full max-w-7xl px-3 py-5 md:px-6 md:py-10">
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 40,
                        scale: 0.97
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                        scale: 1
                    }}
                    viewport={{
                        once: true,
                        amount: 0.3
                    }}
                    transition={{
                        duration: 0.8,
                        ease: "easeOut"
                    }}
                    className="flex min-h-[280] flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/30 px-3 py-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl backdrop-saturate-150 md:gap-6 md:rounded-3xl md:px-6 md:py-12">
                    <div className="text-center">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: 0.2,
                                ease: "easeOut"
                            }}
                            className="text-xl font-bold tracking-tight text-[#222222] md:text-4xl lg:text-5xl"> Ask about any company,</motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: 0.4,
                                ease: "easeOut"
                            }}

                            className="mt-1 text-base font-semibold text-gray-500 md:mt-2 md:text-3xl lg:text-4xl"> Get a clear risk report. </motion.p>
                    </div>
                    <motion.button
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.6,
                            delay: 0.6,
                            ease: "easeOut"
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStarted} className="group flex items-center gap-2 rounded-full border border-black bg-[#222222] p-1 pl-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#333333] md:gap-3 md:p-2 md:pl-7 md:text-xl"> Get Started
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base text-black transition-transform duration-300 group-hover:rotate-45 md:h-11 md:w-11 md:text-2xl">➚</span>
                    </motion.button>
                </motion.div>
            </section>

            {/* footer */}
            <footer className="relative z-10 mx-auto w-full max-w-7xl px-3 pb-3 pt-5 md:px-6 md:pb-6 md:pt-10">
                <div className="rounded-2xl border border-white/30 bg-white/30 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl backdrop-saturate-150 md:rounded-3xl md:p-8">
                    <motion.div
                        variants={constantVarient}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{
                            once: true,
                            amount: 0.2
                        }}
                        className="grid grid-cols-4 gap-2 md:gap-6 lg:gap-10">
                        <motion.div
                            variants={itemVarients}
                            className="flex min-w-0 items-center gap-1 md:gap-3">
                            <img src="/logo2.png" alt="DD Finance Agent" className="h-6 w-6 shrink-0 object-contain md:h-12 md:w-12" />

                            <div className="min-w-0 leading-tight">
                                <h3 className="text-[8px] font-semibold text-black md:text-lg">Due Diligence </h3>
                                <p className="text-[7px] text-gray-800 md:text-sm"> Finance Agent </p>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={itemVarients}
                            className="flex min-w-0 flex-col items-start gap-1.5 md:gap-3">
                            <h3 className="mb-0.5 text-[9px] font-semibold text-black md:mb-1 md:text-base"> Explore</h3>
                            <a href="#Features" className="text-[8px] text-gray-600 transition hover:text-black md:text-sm"> Features </a>
                            <a href="#how-it-works" className="text-[8px] text-gray-600 transition hover:text-black md:text-sm"> How It Works</a>
                            <button onClick={handleStarted} className="text-left text-[8px] text-gray-600 transition hover:text-black md:text-sm">Get Started</button>
                        </motion.div>

                        <motion.div
                            variants={itemVarients}
                            className="flex min-w-0 flex-col items-start gap-1.5 md:gap-3">
                            <h3 className="mb-0.5 text-[9px] font-semibold text-black md:mb-1 md:text-base">Your Account</h3>
                            <Link to="/login" className="text-[8px] text-gray-600 transition hover:text-black md:text-sm" > Login</Link>
                        </motion.div>

                        <motion.div
                            variants={itemVarients}
                            className="min-w-0"
                        >
                            <h3 className="mb-1.5 text-[9px] font-semibold text-black md:mb-3 md:text-base">Important Note </h3>
                            <p className="text-[7px] leading-3 text-gray-600 md:text-sm md:leading-6"> Reports support financial review and should not be treated as definitive conclusions or investment advice. </p>
                        </motion.div>
                    </motion.div>

                    <div className="my-3 border-t border-white/50 md:my-8" />
                    <motion.div variants={itemVarients}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="flex flex-row items-center justify-between gap-2 md:gap-4">
                        <p className="text-[7px] text-gray-700 md:text-sm"> © 2026 Due Diligence Finance Agent. All rights reserved. </p>

                        <div className="flex items-center gap-3 md:gap-6">
                            <a href="https://github.com/Sohail98125" target="_blank" rel="noopener noreferrer" className="text-[8px] font-medium text-gray-600 transition hover:text-black md:text-sm" >  GitHub </a>
                            <a href="www.linkedin.com/in/sohel-jakhal" target="_blank" rel="noopener noreferrer" className="text-[8px] font-medium text-gray-600 transition hover:text-black md:text-sm" > LinkedIn</a>
                        </div>
                    </motion.div>
                </div>
            </footer>
        </div>
    )
}
export default Home;