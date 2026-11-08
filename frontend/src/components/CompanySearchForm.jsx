import { useState } from "react";
import { postAnalyze } from "../services/api.js";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import posthog, { isPosthogConfigured, posthogLogger } from "../posthog.js";

const CompanySearchForm = ({ value, onChange, disabled }) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const text = value.trim();
        if (!text) {
            setError("Enter a company name or a question.");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            const data = await postAnalyze(text);
            if (isPosthogConfigured) {
                posthog.capture("analysis_requested");
                posthogLogger.info("analysis request accepted", {
                    event: "analysis_request",
                    outcome: "accepted",
                });
            }
            navigate(`/dashboard/reports/${data.jobId}`);
        } catch (err) {
            if (isPosthogConfigured) {
                posthog.capture("analysis_request_failed");
                posthogLogger.error("analysis request failed", {
                    event: "analysis_request",
                    outcome: "failed",
                });
            }
            setError("Couldn't start the analysis, Try Again.");
        } finally {
            setSubmitting(false);
        }
    }
    return (
        <motion.form
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
            onSubmit={handleSubmit} className="w-full rounded-full border border-white/40 bg-white/35 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Analyze TCS"
                    disabled={disabled || submitting}
                    className="min-w-0 flex-1 rounded-full border border-white/50 bg-white/60 px-4 py-3 text-base text-black placeholder-gray-500 outline-none transition focus:border-black/40 focus:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <motion.button
                    whileHover={{
                        backgroundColor: "#262626"
                    }}
                    whileTap={{
                        scale: 0.98
                    }}
                    transition={{
                        duration: 0.2,
                        ease: "easeOut"
                    }}
                    type="submit" disabled={disabled || submitting} className="shrink-0 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60" >
                    {submitting ? "Starting..." : "Analyze"}
                </motion.button>
            </div>
            {error && <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                role="alert" className="mt-2 px-1 text-sm text-red-600">{error}</motion.p>}
        </motion.form >
    )
}

export default CompanySearchForm