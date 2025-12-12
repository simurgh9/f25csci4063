import { Post } from "../model/entities/post";
import { User } from "../model/entities/User";
import { PostEmbeddingService } from "./postEmbeddingService";
import { OpenAIController } from "../controllers/llm/openaiController";

const postEmbeddingService = new PostEmbeddingService();
const openAIController = new OpenAIController(); 

export class SpoilerService {
    /**
     * Check if a post is a spoiler for a user using pre-computed chunks + LLM
     * OPTIMIZED: Uses PostChunk table (no embedding/similarity calculation needed)
     */
    async checkSpoilerOptimized(post: Post, user: User): Promise<number> {
        try {
            // 1. Get pre-computed similar chunks (fast database query)
            const similarChunks = await postEmbeddingService.getSimilarChunksForLLM(post);
            
            if (similarChunks.length === 0) {
                // No chunks found, assume not a spoiler
                return 0;
            }

            // 2. Find user's progress for this show
            const subscription = user.subscriptions.find(
                sub => sub.show.id === post.show.id
            );

            if (!subscription || !subscription.currentEpisode) {
                // User not subscribed or no progress, assume not a spoiler
                return 1;
            }

            // 3. Build optimized context from pre-computed chunks
            const prompt = `
You are a spoiler classifier. Respond only with '0' or '1'.

Post content:
${post.content}

Pre-computed relevant chunks from episodes:
${JSON.stringify(similarChunks.map(c => ({
    text: c.text.substring(0, 200),
    episode: `S${c.season}E${c.episode}`,
    similarity: c.similarity.toFixed(3)
})), null, 2)}

User's current progress: S${subscription.currentEpisode.season}E${subscription.currentEpisode.episode}

IF YOU ARE NOT ABSOLUTELY CERTAIN, ASSUME IT'S A SPOILER

Return:
0 → not a spoiler for this user
1 → is a spoiler for this user
`;

            // 4. Use LLM for nuanced spoiler detection
            const result = await openAIController.classifySpoilerFromPrompt(prompt);
            return result?.trim() === "1" ? 1 : 0;

        } catch (error) {
            console.error("Error checking spoiler:", error);
            return 0; // Default to safe (not a spoiler)
        }
    }

    /**
     * Check multiple posts for spoilers (optimized batch processing)
     */
    async checkSpoilersOptimized(posts: Post[], user: User): Promise<Array<{ post: Post, spoiler: number }>> {
        const results = await Promise.all(
            posts.map(async (post) => ({
                post,
                spoiler: await this.checkSpoilerOptimized(post, user)
            }))
        );

        return results;
    }
}
