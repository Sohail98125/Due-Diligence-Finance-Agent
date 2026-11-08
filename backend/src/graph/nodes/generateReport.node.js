import generateReport from "../../services/groq.service.js";

const generateReportNode = async (state) => {
    if (!state.schema) {
        return {
            llmSummary: null,
            riskLevel: null,
            error: "Financial schema is missing"
        }
    }
    try {
        const result = await generateReport(
            state.schema,
            state.newsContext,
        );
        return {
            llmSummary: result.summary,
            riskLevel: result.riskLevel,
            error: null
        };
    } catch (error) {
        return {
            llmSummary: null,
            riskLevel: null,
            error: error instanceof Error ? error.message : "Report generation failed"
        };
    }
};

export default generateReportNode;