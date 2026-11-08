import {CohereEmbeddings} from '@langchain/cohere'
import "dotenv/config";

const embeddings = new CohereEmbeddings({
  apiKey: process.env.COHERE_API_KEY,
  model:"embed-v4.0"
});

export default embeddings;

