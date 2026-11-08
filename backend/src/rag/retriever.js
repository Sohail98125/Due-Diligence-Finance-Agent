import { Document } from "@langchain/core/documents";
import { maximalMarginalRelevance } from "@langchain/core/utils/math";
import embeddings from "./embeddings.js";
import collection from "./chroma.js";

const retrieverConfig = {
    k: 1,         // mmr ke baad 4 documents 
    fetchK: 10,   // first 10 documents

    // lambda = 1 → relevance ko zyada importance
    // lambda = 0 → diversity ko zyada importance
    // lambda = 0.5  → balanced
    lambda: 0.5
}

const retrieveCompanyContext = async (query) => {

    // ======== Query --> Embeddings ==============
    const queryEmbeddings = await embeddings.embedQuery(query);

    // ======== Chroma --> candidate documents
    const results = await collection.query({
        queryEmbeddings: [queryEmbeddings],
        nResults: retrieverConfig.fetchK,
        include: [
            "documents",   //documents  → actual text
            "metadatas",   //metadatas  → company information
            "embeddings"   //embeddings → vectors
        ]
    });
    const documents = results.documents?.[0] ?? [];
    const metadatas = results.metadatas?.[0] ?? [];
    const candidateEmbeddings = results.embeddings?.[0] ?? [];

    // ========= No Results ===================
    if (candidateEmbeddings.length === 0) {
        return []
    }

    // =========== MMR ========================
    const selectedIndex = maximalMarginalRelevance(
        queryEmbeddings,
        candidateEmbeddings,
        retrieverConfig.lambda,
        retrieverConfig.k
    )

    // ========== Convert selected results to langchain documents
    return selectedIndex.map((index) => {
        return new Document({
            pageContent: documents[index],
            metadata: metadatas[index]
        })
    })
}

export default retrieveCompanyContext;
