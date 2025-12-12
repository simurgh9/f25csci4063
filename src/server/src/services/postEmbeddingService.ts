import { Post } from "../model/entities/post";
import { Chunk } from "../model/entities/chunk";
import { PostChunk } from "../model/entities/postChunk";
import { Embedder } from "../utils/embedding";
import { Similarities } from "../utils/similarities";
import { In } from "typeorm";

const embedder = new Embedder();
const similarities = new Similarities();

export class PostEmbeddingService {
    /**
     * Pre-computes and stores post-to-chunk similarities
     * Call this immediately after creating a post
     */
    async computeAndStoreSimilarities(post: Post): Promise<void> {
        try {
            // 1. Embed the post content
            const embedded = await embedder.generateEmbeddings([post.content]);
            const vector = embedded.data[0].embedding;

            // 2. Get all chunks for the show
            const episodeIds = post.show.episodes.map(ep => ep.id);
            const chunks = await Chunk.find({ 
                where: { episode: In(episodeIds) },
                relations: ["episode"]
            });

            if (chunks.length === 0) {
                console.log(`No chunks found for show: ${post.show.title}`);
                return;
            }

            // 3. Calculate similarities and get top 5 most relevant chunks
            const TOP_K = 5;
            const similarChunks = similarities.findSimilarityFromDb(chunks, vector, TOP_K);

            // Debug: Log top similarities
            console.log(`Post ${post.id} - Top ${TOP_K} most similar chunks:`);
            similarChunks.forEach((sc, i) => {
                console.log(`  ${i + 1}. Similarity: ${sc.similarity.toFixed(4)} - ${sc.chunk.substring(0, 60)}...`);
            });

            // 4. Store top K chunks regardless of similarity score
            const postChunkEntities = similarChunks
                .map(sc => {
                    const chunk = chunks.find(c => c.text === sc.chunk);
                    if (!chunk) return null;
                    
                    return PostChunk.create({
                        post,
                        chunk,
                        similarity: sc.similarity
                    });
                })
                .filter(pc => pc !== null) as PostChunk[];

            // 5. Batch save
            if (postChunkEntities.length > 0) {
                await PostChunk.save(postChunkEntities);
                console.log(`✅ Stored ${postChunkEntities.length} post-chunk relationships for post ${post.id}`);
                console.log(`   Similarity range: ${similarChunks[0].similarity.toFixed(4)} - ${similarChunks[similarChunks.length - 1].similarity.toFixed(4)}`);
            } else {
                console.log(`⚠️  No chunks found for post ${post.id}`);
            }

        } catch (error) {
            console.error("Error computing post similarities:", error);
            // Don't throw - we don't want post creation to fail if embedding fails
        }
    }

    /**
     * Get pre-computed similar chunks for a post (for LLM context)
     * Returns chunks with their episode info for spoiler classification
     */
    async getSimilarChunksForLLM(post: Post): Promise<Array<{ text: string; similarity: number; season: number; episode: number }>> {
        try {
            // Get all high-similarity chunks for this post
            const postChunks = await PostChunk.find({
                where: { post: { id: post.id } },
                relations: ["chunk", "chunk.episode"],
                order: { similarity: "DESC" },
                take: 10 // Top 10 most similar chunks
            });

            return postChunks.map(pc => ({
                text: pc.chunk.text,
                similarity: pc.similarity,
                season: pc.chunk.episode.season,
                episode: pc.chunk.episode.episode
            }));
        } catch (error) {
            console.error("Error getting similar chunks:", error);
            return [];
        }
    }
}
