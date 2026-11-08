import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import calculationNode from './nodes/calculation.node.js';
import roicNode from './nodes/financeApi.node.js';
import generateReportNode from './nodes/generateReport.node.js';
import resolveCompanyNode from './nodes/resolveCompany.node.js';
import retrieverChunkNode from './nodes/retrieveChunks.node.js';
import mapSchemaNode from './nodes/map.schema.node.js';
import tavilyNode from './nodes/webSearchApi.node.js';
import { understandRequestNode } from './nodes/understandRequest.node.js';

const AgentState = Annotation.Root({
    userRequest: Annotation(),

    companyName: Annotation(),
    symbol: Annotation(),
    isIndian: Annotation(),

    rawFinanceData: Annotation(),
    newsContext: Annotation(),
    ragContext: Annotation(),

    schema: Annotation(),
    llmSummary: Annotation(),
    riskLevel: Annotation(),
    clarificationMessage: Annotation(),

    error: Annotation({
        reducer: (current, update) => update ?? current,
        default: () => null
    })
});

const graph = new StateGraph(AgentState);

// NEW NODE
graph.addNode("understandRequest", understandRequestNode);
graph.addNode("resolveCompany", resolveCompanyNode);
graph.addNode("retrieverChunk", retrieverChunkNode);
graph.addNode("roic", roicNode);
graph.addNode("tavily", tavilyNode);
graph.addNode("mapSchema", mapSchemaNode);
graph.addNode("calculation", calculationNode);
graph.addNode("generateReport", generateReportNode);

function routeAfterResolve(state) {
    if (state.clarificationMessage || state.error) {
        return END;
    }

    return state.isIndian ? "retrieverChunk" : "roic";
}

function routeAfterROIC(state) {
    if (state.clarificationMessage || state.error) {
        return END;
    }

    return "mapSchema";
}

graph.addEdge(START, "understandRequest");
graph.addEdge("understandRequest", "resolveCompany");

graph.addConditionalEdges(
    "resolveCompany",
    routeAfterResolve,
    {
        retrieverChunk: "retrieverChunk",
        roic: "roic",
        [END]: END
    }
);

graph.addConditionalEdges(
    "roic",
    routeAfterROIC,
    {
        mapSchema: "mapSchema",
        [END]: END
    }
);
graph.addEdge("retrieverChunk", "calculation");
graph.addEdge("mapSchema", "calculation");
graph.addEdge("calculation", "tavily");
graph.addEdge("tavily", "generateReport");
graph.addEdge("generateReport", END);

const app = graph.compile();

export default app;