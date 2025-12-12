import { Chunk } from "../model/entities/chunk";
import { EmbeddingVector } from "types/embedding";

export class Similarities {
    // Normalize a vector (returns Float32Array)
    private normalize(v: number[] | Float32Array): Float32Array {
        let sum = 0;
        for (let i = 0; i < v.length; i++) sum += v[i] * v[i];
        const mag = Math.sqrt(sum);
        const out = new Float32Array(v.length);
        for (let i = 0; i < v.length; i++) out[i] = v[i] / mag;
        return out;
    }

    // Dot product (fast loop)
    private dot(a: Float32Array | number[], b: Float32Array | number[]): number {
        let sum = 0;
        for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
        return sum;
    }

    // Calculate cosine similarity assuming both vectors are normalized
    private cosineSimilarityNormalized(a: Float32Array | number[], b: Float32Array | number[]): number {
        return this.dot(a, b);
    }

    // Embeddings coming from in-memory vectors (not DB blobs)
    findSimilarity(embeddings: EmbeddingVector[], promptEmbedding: number[]) {
        const promptNorm = this.normalize(promptEmbedding);

        const sims: { similarity: number; chunk: string }[] = [];

        for (const { embedding, chunk_text } of embeddings) {
            const embNorm = this.normalize(embedding);
            const similarity = this.cosineSimilarityNormalized(embNorm, promptNorm);
            sims.push({ similarity, chunk: chunk_text });
        }

        sims.sort((a, b) => b.similarity - a.similarity);
        return sims.slice(0, 5);
    }

    // Optimized similarity for DB-stored embeddings using min-heap (no full sort)
    findSimilarityFromDb(embeddings: Chunk[], promptEmbedding: number[], topK: number = 5) {
        const promptNorm = this.normalize(promptEmbedding);

        // Use min-heap approach: maintain only top K items
        const topK_items: { similarity: number; chunk: string }[] = [];
        let minIndex = 0;

        const updateMinIndex = () => {
            minIndex = 0;
            for (let i = 1; i < topK_items.length; i++) {
                if (topK_items[i].similarity < topK_items[minIndex].similarity) {
                    minIndex = i;
                }
            }
        };

        for (const { embedding, text } of embeddings) {
            // Convert Buffer/number[] to number array and normalize
            let embArray: number[];
            if (Array.isArray(embedding)) {
                embArray = embedding as number[];
            } else {
                // It's a Buffer, convert to number array
                embArray = Array.from(embedding as any) as number[];
            }
            const embNorm = this.normalize(embArray);

            // Calculate cosine similarity (dot product of normalized vectors)
            const similarity = this.cosineSimilarityNormalized(embNorm, promptNorm);

            // Maintain top K using min-heap logic
            if (topK_items.length < topK) {
                topK_items.push({ similarity, chunk: text });
                if (topK_items.length === topK) {
                    updateMinIndex();
                }
            } else if (similarity > topK_items[minIndex].similarity) {
                topK_items[minIndex] = { similarity, chunk: text };
                updateMinIndex();
            }
        }

        // Final sort of only top K items
        topK_items.sort((a, b) => b.similarity - a.similarity);
        return topK_items;
    }
}
