import { Chunk } from "../model/entities/chunk";
import { EmbeddingVector } from "types/embedding";

export class Similarities {
    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        if (vecA.length !== vecB.length) {
            throw new Error("Vectors must be of the same length");
        }

        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

        if (magnitudeA === 0 || magnitudeB === 0) {
            throw new Error("Vectors must not be zero vectors");
        }

        return dotProduct / (magnitudeA * magnitudeB);
    }

    findSimilarity(embeddings: EmbeddingVector[], promptEmbedding: number[]) {
        const similarities: { similarity: number; chunk: string }[] = [];

        for (const { embedding, chunk_text } of embeddings) {
            const similarity = this.cosineSimilarity(Array.from(embedding), promptEmbedding);
            similarities.push({ similarity, chunk: chunk_text });
        }

        similarities.sort((a, b) => b.similarity - a.similarity);

        return similarities.slice(0, 5);
    }

    findSimilarityFromDb(embeddings: Chunk[], promptEmbedding: number[]){
        const similarities: { similarity: number; chunk: string }[] = [];

        for (const { embedding, text } of embeddings) {
            const similarity = this.cosineSimilarity(Array.from(embedding), promptEmbedding);
            similarities.push({ similarity, chunk: text });
        }

        similarities.sort((a, b) => b.similarity - a.similarity);

        return similarities.slice(0, 5);
    }
}

// if (require.main === module) {
//   (async () => {
//     const [, , type, id] = process.argv;
//     if (type === "transcript") {
//         const { transcript } = await scraper.scrapeTranscript(id);

//         const chunks = chunker.chunkText(transcript, 2000);

//         const embeddingResponse = await embedder.generateEmbeddings(chunks);

//         const records: EmbeddingVector[] = embeddingResponse.data.map((item: any, index: number) => ({
//         embedding: item.embedding,
//         chunk_text: chunks[index],
//         }));

//         const promptResponse = await embedder.generateEmbeddings(["The way Gus went out was intense!"]);
//         const promptEmbedding = promptResponse.data[0].embedding;

//         const similarities = findSimilarity(records, promptEmbedding);
//         console.log(similarities)
//     } else {
//         console.log("Usage: npx ts-node embedding.ts transcript <topicId>");
//     }
//   })();
// }
