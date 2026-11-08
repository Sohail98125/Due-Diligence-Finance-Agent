import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { getHistory } from "../services/api.js";

const HistoryList = ({ activeJobId, refreshKey = 0 }) => {
    const [historyList, setHistoryList] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const historyContainerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const historyItemVariants = {
        hidden: {
            opacity: 0,
            x: -15
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    useEffect(() => {
        let cancelled = false;
        const loadHistory = async () => {
            try {
                setError("");

                const data = await getHistory();
                if (cancelled) return;
                setHistoryList(
                    Array.isArray(data) ? data : data.history ?? []
                );
            } catch (err) {
                if (!cancelled) setError(err.response?.data?.error || err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        loadHistory();
        return () => { cancelled = true; };
    }, [refreshKey]);


    if (loading) return <img className="mx-auto h-10 w-10" src="/loading.svg" alt="Loading" />
    if (error && historyList.length === 0) return <p className="px-2 text-sm text-gray-500">Error: {error}</p>
    if (historyList.length === 0) return <p className="px-2 text-sm text-gray-500">No report yet.</p>
    return (
        <motion.div
            variants={historyContainerVariants}
            initial="hidden"
            animate="visible"
            className="flex w-full flex-col gap-2 pb-8">
            {historyList.map((item) => {
                const name = item.companyName?.trim() || "Unknown";
                const shortName = name.length > 22 ? `${name.slice(0, 20).trim()}...` : name;
                const isActive = item.jobId === activeJobId;
                return (
                    <motion.button
                        variants={historyItemVariants}
                        whileHover={{
                            x: 3
                        }}
                        key={item.jobId || item._id || item.id}
                        type="button"
                        onClick={() => navigate(`/dashboard/reports/${item.jobId}`)}
                        aria-current={isActive ? "page" : undefined}
                        className={`block w-full rounded-xl border p-3 text-left transition ${isActive
                            ? "border-black/30 bg-white/80 shadow-sm"
                            : "border-white/40 bg-white/30 hover:bg-white/60"
                            }`}>
                        <div className="flex items-center justify-between gap-2">
                            <p title={name} className="truncate text-sm font-medium text-gray-900">{shortName} </p>
                            <span className="shrink-0 rounded-full bg-black/5 px-2 py-1 text-xs text-gray-700"> {item.riskLevel || "Pending"} </span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString() : "Data unavailable"}
                        </p>
                    </motion.button>
                )
            })}
        </motion.div>
    )
}

export default HistoryList


