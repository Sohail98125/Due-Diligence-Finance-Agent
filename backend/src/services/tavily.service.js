import dotenv from 'dotenv';
import { tavily } from '@tavily/core';
dotenv.config();

const client = tavily({
    apiKey: process.env.TAVILY_API_KEY
})

const fetchTavilyContext = async (company, symbol) => {
    const ticker = symbol?.split('.')[0] || '';

    const response = await client.search(
        `"${company}" ${ticker} financial results debt liquidity regulatory issues major risks recent news`,
        {
            searchDepth: "advanced",
            topic: "news",
            maxResults: 5,
            timeRange: "month",
            includeAnswer: false,
            includeRawContent: false
        }
    )
    const results = (response.results ?? []).filter(item => {
        const text = `${item.title} ${item.content}`.toLowerCase();

        return (
            text.includes(company.toLowerCase()) ||
            (ticker && text.includes(ticker.toLowerCase()))
        );
    });
    return {
        answer: response.answer ?? null,
        results
    };
}

export default fetchTavilyContext;
