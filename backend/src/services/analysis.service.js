import Job from '../models/job.model.js';
import Report from '../models/report.model.js';
import app from '../graph/index.js';

// Graph node complete hone ke baad job ka status and progress
const NODE_STEPS = {
    understandRequest: {
        status: "understanding_request",
        progress: 15
    },
    resolveCompany: {
        status: "fetching_data",
        progress: 20
    },
    roic: {
        status: "fetching_data",
        progress: 30
    },
    mapSchema: {
        status: "processing_data",
        progress: 40
    },
    calculation: {
        status: "calculating",
        progress: 60
    },
    tavily: {
        status: "generating_report",
        progress: 80
    },
    generateReport: {
        status: "generating_report",
        progress: 95
    }
};

// Error ko readable message mein convert karna
const getErrorMessage = (error) => {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === "string") {
        return error;
    }

    if (error && typeof error.message === "string") {
        return error.message;
    }

    try {
        return JSON.stringify(error) || "Unknown analysis error";
    } catch {
        return String(error);
    }
};

// Main analysis service
export const runAnalysis = async (jobId) => {
    try {
        const job = await Job.findOne({ jobId });

        if (!job) {
            throw new Error(`Job not found: ${jobId}`);
        }

        // Analysis ab user ki query samajhne se start hogi
        await Job.updateOne(
            { jobId },
            {
                $set: {
                    status: "understanding_request",
                    progress: 5,
                    errorMessage: null
                }
            }
        );

        // Graph ke node updates yahan collect honge
        let state = {};

        // User ki original query graph ko pass karo
        const stream = await app.stream(
            {
                userRequest: job.userRequest
            },
            {
                streamMode: "updates"
            }
        );

        // Har graph node ka update process karo
        for await (const chunk of stream) {
            for (const [nodeName, update] of Object.entries(chunk)) {
                if (!update || typeof update !== "object") {
                    continue;
                }

                if (update.error) {
                    throw new Error(
                        `${nodeName} failed: ${getErrorMessage(update.error)}`
                    );
                }

                // Current node ka output state mein merge karo
                state = {
                    ...state,
                    ...update
                };

                // LLM se company name extract hone ke baad save karo
                if (nodeName === "understandRequest") {
                    const extractedName =
                        typeof update.companyName === "string"
                            ? update.companyName.trim()
                            : "";

                    if (!extractedName || extractedName.length > 100) {
                        throw new Error(
                            "Company name could not be extracted from the user request"
                        );
                    }

                    await Job.updateOne(
                        { jobId },
                        {
                            $set: {
                                companyName: extractedName
                            }
                        }
                    );

                    // Current service ke job object ko bhi update karo
                    job.companyName = extractedName;
                }

                // Sirf registered graph nodes ka progress update karo
                const step = NODE_STEPS[nodeName];

                if (step) {
                    await Job.updateOne(
                        { jobId },
                        {
                            $set: step
                        }
                    );
                }
            }
        }

        // Final summary validation
        const summary =
            typeof state.llmSummary === "string"
                ? state.llmSummary.trim()
                : "";

        if (!summary) {
            throw new Error(
                "Analysis finished without generating a report"
            );
        }

        // Risk level validation
        const allowedRiskLevels = ["Low", "Medium", "High"];

        if (!allowedRiskLevels.includes(state.riskLevel)) {
            throw new Error(
                "Analysis finished with an invalid risk level"
            );
        }

        // Financial schema validation
        const schema = state.schema ?? null;

        if (
            !schema ||
            typeof schema !== "object" ||
            Array.isArray(schema)
        ) {
            throw new Error(
                "Analysis finished without a valid financial schema"
            );
        }

        // News results safely prepare karo
        const newsResult = Array.isArray(state.newsContext?.results)
            ? state.newsContext.results
            : [];

        const newsSources = newsResult
            .filter((item) => item && (item.title || item.url))
            .map((item) => ({
                title: item.title ?? "",
                url: item.url ?? ""
            }));

        // Final report ke liye company name resolve karo
        const reportCompanyName =
            schema.company_name ??
            state.companyName ??
            job.companyName;

        if (
            typeof reportCompanyName !== "string" ||
            !reportCompanyName.trim()
        ) {
            throw new Error(
                "Analysis finished without a valid company name"
            );
        }

        // Financial schema se metadata fields hatao
        const {
            _id,
            __v,
            createdAt,
            updatedAt,
            aliases,
            ...financials
        } = schema;

        // Final report data prepare karo
        const reportData = {
            jobId,
            userId: job.userId,
            companyName: reportCompanyName.trim(),
            symbol: state.symbol,
            isIndian:
                state.isIndian == null
                    ? null
                    : state.isIndian === true ||
                    state.isIndian === "true",
            riskLevel: state.riskLevel,
            llmSummary: summary,
            redFlags: Array.isArray(schema.red_flags)
                ? schema.red_flags
                : [],
            newsSources,
            financials
        };

        // Report MongoDB mein save karo
        const report = await Report.create(reportData);

        // Job completed mark karo
        await Job.updateOne(
            { jobId },
            {
                $set: {
                    status: "completed",
                    progress: 100,
                    reportId: report._id,
                    errorMessage: null
                }
            }
        );

        return report;

    } catch (error) {
        const errorMessage = getErrorMessage(error);

        try {
            await Job.updateOne(
                { jobId },
                {
                    $set: {
                        status: "failed",
                        errorMessage
                    }
                }
            );
        } catch (updateError) {
            console.error(
                "Failed to update job status",
                getErrorMessage(updateError)
            );
        }

        throw error;
    }
};