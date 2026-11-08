import "dotenv/config";
import mongoose from "mongoose";
import { randomUUID } from "crypto";

import Job from "./src/models/job.model.js";
import Report from "./src/models/report.model.js";
import { runAnalysis } from "./src/services/analysis.service.js";
import app from "./src/graph/index.js";

// Run:
// node test1.js "Give me the financial risk report of Apple"
// node test1.js "TCS ka financial risk report do"

const userRequests = process.argv.slice(2);

if (userRequests.length === 0) {
    userRequests.push("TCS ka financial risk report do");
}

const startedAt = Date.now();

let totalFailed = 0;

const delay = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

function elapsed() {
    return `${((Date.now() - startedAt) / 1000).toFixed(2)}s`;
}

function safeStringify(value) {
    try {
        return JSON.stringify(
            value,
            (_key, item) => {
                if (item instanceof Error) {
                    return {
                        name: item.name,
                        message: item.message,
                        stack: item.stack
                    };
                }

                if (typeof item === "bigint") {
                    return item.toString();
                }
                return item;
            },
            2
        );
    } catch (error) {
        return `[Unable to serialize: ${error.message}]`;
    }
}

function preview(value, limit = 2500) {
    const output =
        typeof value === "string"
            ? value
            : safeStringify(value);

    if (output == null) {
        return String(output);
    }

    if (output.length <= limit) {
        return output;
    }

    return (
        output.slice(0, limit) +
        `\n... truncated ${output.length - limit} characters`
    );
}

// =====================================================
// 1. GRAPH NODE DIAGNOSTICS
// =====================================================

// analysis.service.js aur test1.js same imported graph instance
// use karte hain. Is wrapper se original stream preserve hoti hai,
// lekin har node ka update console mein print bhi hota hai.

const originalStream = app.stream.bind(app);

app.stream = async (...args) => {
    const stream = await originalStream(...args);

    return (async function* () {
        for await (const chunk of stream) {
            for (const [nodeName, update] of Object.entries(chunk)) {
                console.log("\n" + "=".repeat(75));
                console.log(`[${elapsed()}] NODE: ${nodeName}`);
                console.log("=".repeat(75));

                if (!update || typeof update !== "object") {
                    console.log(preview(update));
                    continue;
                }

                console.log(
                    "Output fields:",
                    Object.keys(update).join(", ") || "<none>"
                );

                for (const [key, value] of Object.entries(update)) {
                    console.log(`\n--- ${key} ---`);

                    let limit = 1800;

                    if (key === "rawFinanceData") limit = 3500;
                    if (key === "schema") limit = 3500;
                    if (key === "llmSummary") limit = 2500;
                    if (key === "ragContext") limit = 1800;
                    if (key === "newsContext") limit = 2200;

                    console.log(preview(value, limit));
                }

                if (update.error) {
                    console.error(
                        `NODE ERROR [${nodeName}]:`,
                        preview(update.error, 2500)
                    );
                }
            }

            // Original analysis service ko same updates milenge
            yield chunk;
        }
    })();
};

// =====================================================
// 2. MONGODB JOB STATUS MONITOR
// =====================================================

async function monitorJob(jobId, shouldContinue) {
    let previousSnapshot = "";

    while (shouldContinue()) {
        try {
            const job = await Job.findOne({ jobId })
                .select(
                    "userRequest companyName status progress errorMessage"
                )
                .lean();

            if (job) {
                const snapshot = JSON.stringify({
                    status: job.status,
                    progress: job.progress,
                    companyName: job.companyName,
                    errorMessage: job.errorMessage
                });

                if (snapshot !== previousSnapshot) {
                    previousSnapshot = snapshot;

                    console.log("\n[JOB STATUS UPDATE]");
                    console.log("Time:", elapsed());
                    console.log("Status:", job.status);
                    console.log("Progress:", `${job.progress}%`);
                    console.log(
                        "Company:",
                        job.companyName ?? "<not extracted yet>"
                    );

                    if (job.errorMessage) {
                        console.error("Error:", job.errorMessage);
                    }
                }
            }
        } catch (error) {
            console.error(
                "Job monitoring error:",
                error.message
            );
        }

        await delay(700);
    }
}

// =====================================================
// 3. FINAL DATABASE DIAGNOSTICS
// =====================================================

async function printFinalResult(jobId, userRequest) {
    const job = await Job.findOne({ jobId }).lean();

    const report = await Report.findOne({
        jobId,
        userId: job?.userId
    }).lean();

    console.log("\n\n" + "#".repeat(75));
    console.log("FINAL RESULT");
    console.log("#".repeat(75));

    console.log("Original query:", userRequest);
    console.log("Job ID:", jobId);

    if (!job) {
        console.error("FAIL: Job document was not found.");
        totalFailed++;
        return;
    }

    console.log("\n--- JOB DOCUMENT ---");
    console.log("Status:", job.status);
    console.log("Progress:", `${job.progress}%`);
    console.log("Original request:", job.userRequest);
    console.log("Extracted company:", job.companyName);
    console.log("Error:", job.errorMessage);
    console.log("Report ID:", job.reportId);
    console.log("Created:", job.createdAt);
    console.log("Updated:", job.updatedAt);

    console.log("\n--- REPORT DOCUMENT ---");

    if (!report) {
        console.error("FAIL: Report was not found in MongoDB.");

        if (job.status !== "failed") {
            console.error(
                "The job is not marked failed, but no report exists."
            );
        }

        totalFailed++;
        return;
    }

    console.log("Report ID:", report._id);
    console.log("Company:", report.companyName);
    console.log("Ticker:", report.symbol);
    console.log("Indian company:", report.isIndian);
    console.log("Risk level:", report.riskLevel);

    console.log("\n--- LLM SUMMARY ---");
    console.log(report.llmSummary);

    console.log("\n--- RED FLAGS ---");
    console.log(preview(report.redFlags ?? [], 3000));

    console.log("\n--- NEWS SOURCES ---");
    console.log(
        preview(report.newsSources ?? [], 2500)
    );

    console.log("\n--- FINANCIAL METRICS ---");
    console.log(
        preview(report.financials ?? {}, 5000)
    );

    const validRiskLevel = [
        "Low",
        "Medium",
        "High"
    ].includes(report.riskLevel);

    const hasSummary =
        typeof report.llmSummary === "string" &&
        report.llmSummary.trim().length > 0;

    const hasCompanyName =
        typeof report.companyName === "string" &&
        report.companyName.trim().length > 0;

    console.log("\n--- VALIDATION ---");
    console.log(
        `${job.status === "completed" ? "PASS" : "FAIL"} Job completed`
    );
    console.log(
        `${hasCompanyName ? "PASS" : "FAIL"} Report company name`
    );
    console.log(
        `${validRiskLevel ? "PASS" : "FAIL"} Risk level`
    );
    console.log(
        `${hasSummary ? "PASS" : "FAIL"} LLM summary`
    );
    console.log(
        `${report.symbol ? "PASS" : "WARN"} Ticker present`
    );
    console.log(
        `${report.financials ? "PASS" : "FAIL"} Financials object present`
    );

    if (
        job.status !== "completed" ||
        !validRiskLevel ||
        !hasSummary ||
        !hasCompanyName
    ) {
        totalFailed++;
    }
}

// =====================================================
// 4. RUN END-TO-END ANALYSIS
// =====================================================

async function main() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI missing from .env");
    }

    if (!process.env.TEST_USER_ID) {
        throw new Error("TEST_USER_ID missing from .env");
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            process.env.TEST_USER_ID
        )
    ) {
        throw new Error(
            "TEST_USER_ID is not a valid MongoDB ObjectId"
        );
    }

    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY missing from .env");
    }

    console.log("#".repeat(75));
    console.log("DUE DILIGENCE FINANCE AI AGENT — INTEGRATION TEST");
    console.log("#".repeat(75));

    console.log("Started:", new Date().toISOString());
    console.log("Queries:", userRequests.length);
    console.log("Mongo URI: present (value hidden)");
    console.log("Groq API key: present (value hidden)");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("\nMongoDB connected.");

    for (const rawRequest of userRequests) {
        const userRequest =
            typeof rawRequest === "string"
                ? rawRequest.trim()
                : "";

        console.log("\n\n" + "*".repeat(75));
        console.log("NEW TEST:", userRequest);
        console.log("*".repeat(75));

        if (
            userRequest.length < 2 ||
            userRequest.length > 2000
        ) {
            console.error(
                "Skipping invalid request. Length must be 2-2000 characters."
            );
            totalFailed++;
            continue;
        }

        const jobId = randomUUID();

        let monitoring = true;
        let monitorPromise = null;

        try {
            // Natural-language request is saved before analysis
            const job = await Job.create({
                jobId,
                userId: process.env.TEST_USER_ID,
                userRequest
            });

            console.log("Job created:", job.jobId);
            console.log("Initial status:", job.status);

            monitorPromise = monitorJob(
                jobId,
                () => monitoring
            );

            console.log("\nStarting runAnalysis...\n");

            await runAnalysis(jobId);

            console.log(
                `\nrunAnalysis returned successfully in ${elapsed()}`
            );

        } catch (error) {
            console.error("\nANALYSIS THREW AN ERROR");
            console.error("Name:", error.name);
            console.error("Message:", error.message);

            if (error.stack) {
                console.error("Stack:\n", error.stack);
            }

            totalFailed++;

        } finally {
            monitoring = false;

            if (monitorPromise) {
                await monitorPromise;
            }
        }

        try {
            await printFinalResult(jobId, userRequest);
        } catch (error) {
            console.error(
                "Could not read final Job/Report:",
                error.message
            );
            totalFailed++;
        }
    }
}

try {
    await main();
} catch (error) {
    console.error("\nTEST SETUP FAILED");
    console.error("Name:", error.name);
    console.error("Message:", error.message);

    if (error.stack) {
        console.error(error.stack);
    }

    totalFailed++;
} finally {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log("\nMongoDB disconnected.");
    }

    console.log("\n" + "#".repeat(75));
    console.log("TEST RUN FINISHED");
    console.log("Duration:", elapsed());
    console.log("Failed checks/tests:", totalFailed);
    console.log(
        "OVERALL RESULT:",
        totalFailed === 0 ? "PASS" : "FAIL"
    );
    console.log("#".repeat(75));

    if (totalFailed > 0) {
        process.exitCode = 1;
    }
}