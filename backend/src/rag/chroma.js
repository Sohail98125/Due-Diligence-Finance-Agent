import { CloudClient } from "chromadb";
import "dotenv/config";

const chroma = new CloudClient({
    apiKey: process.env.CHROMA_API_KEY,
});

const collection = await chroma.getOrCreateCollection({
    name: "Finance",
    embeddingFunction: null,
});

console.log("✅ Chroma Cloud connected");

export default collection;