import OpenAI from "openai";
import { CreateEmbeddingResponse } from "openai/resources/embeddings";

require('dotenv').config({
    path: '../../.env'
})

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}); 

export class Embedder {
    async generateEmbeddings(chunks: string[]): Promise<CreateEmbeddingResponse> {
        const embeddings = await client.embeddings.create({
            model: "text-embedding-3-small",
            input: chunks, 
        });
        return embeddings;
    }
}