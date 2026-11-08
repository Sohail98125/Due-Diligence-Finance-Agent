import { motion } from "motion/react";

const steps = [
    { key: "queued", label: "Queued", percent: 10 },
    { key: "understanding_request", label: "Understanding your request", percent: 20 },
    { key: "fetching_data", label: "Fetching financials", percent: 35 },
    { key: "processing_data", label: "Processing data", percent: 55 },
    { key: "calculating", label: "Calculating ratios", percent: 75 },
    { key: "generating_report", label: "Writing report", percent: 90 },
];

/* phone: compact card | sm+: your original card */
const cardClass = "rounded-xl border border-white/40 bg-white/35 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:rounded-2xl sm:p-5";

const Sk = ({ className = "" }) => (
    <div className={`animate-pulse rounded-md bg-black/10 ${className}`} />
);

const JobProgress = ({ status }) => {
    const found = steps.findIndex((s) => s.key === status);
    // status abhi aaya nahi ya unknown hai to pehla step active
    const currentIndex = found === -1 ? 0 : found;
    const current = steps[currentIndex];

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
            className="flex grow flex-col gap-3 sm:gap-6">
            {/* progress card */}
            <div className={cardClass}>
                <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 text-sm font-semibold text-black sm:text-base">{current.label}...</p>
                    <p className="text-base font-semibold tabular-nums text-black sm:text-lg">{current.percent}%</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4">
                    <div className="flex gap-1.5 sm:gap-2">
                        {steps.map((s, i) => (
                            <span
                                key={s.key}
                                className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${i < currentIndex
                                    ? "bg-black"
                                    : i === currentIndex
                                        ? "animate-pulse bg-black"
                                        : "bg-black/15"
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-500 sm:text-xs">This can take 30-60 seconds</p>
                </div>
            </div>

            {/* skeleton report */}
            <div className={`${cardClass} flex items-center justify-between gap-3`}>
                <div className="flex min-w-0 flex-col gap-1.5 sm:gap-2">
                    <Sk className="h-5 w-36 sm:h-6 sm:w-60" />
                    <Sk className="h-2.5 w-24 sm:h-3 sm:w-32" />
                </div>
                <Sk className="h-6 w-14 shrink-0 rounded-full sm:h-7 sm:w-20" />
            </div>

            <div className={`${cardClass} flex flex-col gap-1.5 sm:gap-2`}>
                <Sk className="h-2.5 w-28 sm:h-3 sm:w-36" />
                <Sk className="h-2.5 w-full sm:h-3" />
                <Sk className="h-2.5 w-[96%] sm:h-3" />
                <Sk className="h-2.5 w-3/5 sm:h-3" />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={cardClass}>
                        <Sk className="mb-2 h-2.5 w-14 sm:mb-3 sm:h-3 sm:w-16" />
                        <Sk className="h-5 w-20 sm:h-6 sm:w-24" />
                    </div>
                ))}
            </div>

            {/* Phone/tablet only: extra skeleton sections (red flags + news) so the page is filled to the bottom */}
            <div className={`${cardClass} flex flex-col gap-2.5 lg:hidden`}>
                <Sk className="h-3 w-20" />
                {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-2.5">
                        <Sk className="h-6 w-6 shrink-0 rounded-full" />
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <Sk className="h-2.5 w-3/4" />
                            <Sk className="h-2.5 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>

            <div className={`${cardClass} flex grow flex-col gap-3 lg:hidden`}>
                <Sk className="h-3 w-24" />
                {[0, 1, 2].map((i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                        <Sk className="h-2.5 w-full" />
                        <Sk className="h-2.5 w-2/3" />
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default JobProgress;