import OpenAI from "openai";
import { CreateEmbeddingResponse } from "openai/resources/embeddings";

require('dotenv').config({
    path: '../../.env'
})

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}); 

const scraper = require("./scraper")

export async function generateEmbeddings(chunks: string[]): Promise<CreateEmbeddingResponse> {
    const embeddings = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: chunks, 
    });
    return embeddings;
}

export function generateDbRecords(embeddings: CreateEmbeddingResponse, chunks: string[]): Object[] {
    // const records = embeddings.data.map((embedding, index) => ({
    //     show_name: "Breaking Bad",
    //     season: 4,
    //     episode: 13,
    //     chunk_index: index,
    //     chunk_text: chunks[index],
    //     embedding: embedding.embedding,
    // }));

    const embeddingVectors = embeddings.data.map((item, index) => ({
      embedding: item.embedding,
      chunk_text: chunks[index]
    }));

    return embeddingVectors;
}