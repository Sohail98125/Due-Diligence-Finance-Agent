import fetchTavilyContext from '../../services/tavily.service.js';

const tavilyNode = async (state) => {
    const company = state.schema?.company_name ?? state.companyName;
    try {
        const newsContext = await fetchTavilyContext(company);
        return {
            newsContext: newsContext,
            error: null
        }
    } catch (error) {
        console.error("Tavily search failed:", error.message);
        return {
            newsContext: {
                answer: null,
                results: []
            },
            error: null
        }
    }
}

export default tavilyNode;
