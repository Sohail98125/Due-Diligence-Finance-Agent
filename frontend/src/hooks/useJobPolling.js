import { useEffect, useState } from "react";
import { getStatus, getReport } from "../services/api.js";

const useJobPolling = (jobId, intervalMs = 3000) => {
    const [job, setJob] = useState(null);
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!jobId) {
            setJob(null);
            setReport(null);
            setError(null);
            return;
        }

        let cancelled = false;
        let timer;

        setJob(null);
        setReport(null);
        setError(null);

        const jobPoll = async () => {
            try {
                // 1. Get latest job status
                const data = await getStatus(jobId);
                if (cancelled) return;
                setJob(data);
                // 2. Check if job completed
                if (data.status === "completed") {
                    // 3. Fetch final report
                    const reportData = await getReport(jobId);
                    if (cancelled) return;
                    setReport(reportData?.report ?? reportData);
                    return;
                }

                // 4. Check if job failed
                if (data.status === "failed") {
                    setError(data.errorMessage || "Analysis failed");
                    return;
                }

                // 5. Continue polling
                timer = setTimeout(jobPoll, intervalMs);

            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.error || err.message);
                }
            }
        };

        jobPoll();

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };

    }, [jobId, intervalMs]);

    return {
        status: job?.status ?? null,
        job,
        report,
        error
    };
};

export default useJobPolling;