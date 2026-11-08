import { randomUUID } from "crypto";
import Job from "../models/job.model.js";
import Report from "../models/report.model.js";
import analysisQueue from "../queues/analysis.queue.js";

const handler = (fs) => async (req, res) => {
    try {
        await fs(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const analyze = handler(async (req, res) => {
    // Get the original natural-language request
    const rawRequest = req.body?.userRequest;

    const userRequest =
        typeof rawRequest === "string" ? rawRequest.trim() : "";

    // Validate the user's request
    if (userRequest.length < 2 || userRequest.length > 2000) {
        return res.status(400).json({
            error: "User request is required (2-2000 characters)"
        });
    }

    // Create a job before starting the analysis
    const job = await Job.create({
        jobId: randomUUID(),
        userId: req.user._id,
        userRequest
    });

    // Add the job to the existing BullMQ queue
    await analysisQueue.add("runAnalysis", {
        jobId: job.jobId
    });

    return res.status(202).json({
        jobId: job.jobId,
        status: job.status
    });
});

export const getStatus = handler(async (req, res) => {
    const job = await Job.findOne({
        jobId: req.params.jobId,
        userId: req.user._id
    }).select(
        "jobId userRequest companyName status progress errorMessage createdAt updatedAt"
    );

    if (!job) {
        return res.status(404).json({
            error: "Job not found"
        });
    }

    return res.status(200).json(job);
});

export const getReport = handler(async (req, res) => {
    const report = await Report.findOne({
        jobId: req.params.jobId,
        userId: req.user._id
    });

    if (report) {
        return res.json(report);
    }

    const job = await Job.findOne({
        jobId: req.params.jobId,
        userId: req.user._id
    });

    if (!job) {
        return res.status(404).json({
            error: "Job not found"
        });
    }

    return res.status(409).json({
        error: "Report not ready",
        status: job.status,
        errorMessage: job.errorMessage
    });
});

export const getHistory = handler(async (req, res) => {
    const reports = await Report.find({
        userId: req.user._id
    })
        .sort({ createdAt: -1 })
        .limit(20)
        .select("jobId companyName symbol riskLevel createdAt");

    return res.json(reports);
});