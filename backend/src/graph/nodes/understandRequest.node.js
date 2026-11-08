import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";


const GROQ_API_KEY = process.env.GROQ_API_KEY;

const llm = new ChatOpenAI({
    apiKey: GROQ_API_KEY,
    model: "openai/gpt-oss-120b",
    configuration: {
        baseURL: "https://api.groq.com/openai/v1",
    },
    temperature: 0.3,
    maxTokens: 4000
});

export const understandRequestNode = async (state) => {
    try {
        const userRequest =
            typeof state.userRequest === "string"
                ? state.userRequest.trim()
                : "";

        if (!userRequest) {
            throw new Error("User request is missing");
        }

        const response = await llm.invoke([
            {
                role: "system",
                content: `
You are a company-name extraction assistant.

Your only task is to identify the company explicitly mentioned
in the user's request.

Rules:
1. Return only the company name or ticker explicitly mentioned.
2. Do not create an analysis plan or answer the user's question.
3. Do not invent a company name if none is mentioned.
4. Preserve the company's recognizable name.
5. If no company can be identified, return exactly: NONE
6. Return plain text only. No explanation or JSON.

Examples:
"Give me the revenue of Apple" -> Apple
"TCS ka financial report do" -> TCS
"Show financial risks of IBM" -> IBM
"What was its revenue?" -> NONE
                `.trim()
            },
            {
                role: "user",
                content: userRequest
            }
        ]);

        // LLM response ko safely text mein convert karo
        const content = response.content;

        const extractedName = (
            typeof content === "string"
                ? content
                : Array.isArray(content)
                    ? content
                        .filter((part) => part.type === "text")
                        .map((part) => part.text)
                        .join("")
                    : ""
        ).trim();

        // Invalid ya missing company name reject karo
        if (
            !extractedName ||
            extractedName.toUpperCase() === "NONE"
        ) {
            throw new Error(
                "Could not identify a company in the user request"
            );
        }

        if (extractedName.length > 100) {
            throw new Error("Extracted company name is too long");
        }

        console.log(
            `Company extracted from user request: ${extractedName}`
        );

        return {
            companyName: extractedName
        };

    } catch (error) {
        throw new Error(
            `understandRequest failed: ${error instanceof Error
                ? error.message
                : String(error)
            }`
        );
    }
};