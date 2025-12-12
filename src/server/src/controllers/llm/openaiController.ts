import OpenAI from "openai";
import { Request, Response } from "express";
import { User } from "../../model/entities/User";
import { Post } from "../../model/entities/post";
import { Show } from "../../model/entities/show";
import { Chunk } from "../../model/entities/chunk";
import { Embedder } from "../../utils/embedding";
import { Similarities } from "../../utils/similarities";
import { In } from "typeorm";
import { CacheService } from "../../services/cacheService";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const embedder = new Embedder();
const similarities = new Similarities();

const embeddingCache = new CacheService<any>();
const similarityCache = new CacheService<any>();
const showProgressCache = new CacheService<any>();

export class OpenAIController {

    async generate(req: Request, res: Response) {
        try {
            const { prompt } = req.body;

            const response = await client.responses.create({
                model: "gpt-5-nano",
                input: prompt
            });

            res.json({ output: response.output_text });
        } catch (error) {
            console.error("Error generating response:", error);
            res.status(500).json({ error: "Failed to generate response." });
        }
    }

    async checkSpoiler(
        posts: Post[],
        user: User
    ): Promise<{ post: Post; spoiler: number }[]> {
        try {
            const results = await Promise.all(
                posts.map(post => this.processPost(post, user))
            );

            return posts.map((post, i) => ({
                post,
                spoiler: results[i]?.trim() === "1" ? 1 : 0
            }));
        } catch (error) {
            console.error("Error in checkSpoiler:", error);
            return [];
        }
    }

    // Made public for optimized endpoint
    async classifySpoilerFromPrompt(prompt: string): Promise<string> {
        try {
            const response = await client.responses.create({
                model: "gpt-5-nano",
                input: prompt
            });
            return response.output_text ?? "";
        } catch (error) {
            console.error("Error classifying spoiler:", error);
            return "";
        }
    }

    private async classifySpoiler(prompt: string): Promise<string> {
        return this.classifySpoilerFromPrompt(prompt);
    }

    private async processPost(post: Post, user: User): Promise<string> {
        const contentKey = `embedding:${post.id}`;
        const similarityKey = `similar:${post.id}`;
        const progressKey = `userProgress:${user.fireBaseId}`;

        // ----------------------------------------------
        // 1. EMBEDDING (cached)
        // ----------------------------------------------
        let embedded = embeddingCache.get(contentKey);

        if (!embedded) {
            embedded = await embedder.generateEmbeddings([post.content]);
            embeddingCache.set(contentKey, embedded, 1000 * 60 * 60);
        }

        // Correct: normalized number[] used everywhere
        const vector: number[] = embedded.data[0].embedding;

        // ----------------------------------------------
        // 2. SIMILARITY SEARCH (cached)
        // ----------------------------------------------
        let similarEmbeddings = similarityCache.get(similarityKey);

        if (!similarEmbeddings) {
            const episodeIds = post.show.episodes.map(ep => ep.id);

            const chunks = await Chunk.find({
                where: { episode: In(episodeIds) }
            });

            // Your optimized top-K similarity function
            similarEmbeddings = similarities.findSimilarityFromDb(
                chunks,
                vector
            );

            similarityCache.set(similarityKey, similarEmbeddings, 1000 * 60 * 30);
        }

        // ----------------------------------------------
        // 3. USER PROGRESS (cached)
        // ----------------------------------------------
        let userShowStates = showProgressCache.get(progressKey);

        if (!userShowStates) {
            userShowStates = await Promise.all(
                user.subscriptions.map(async sub => {
                    const show = await Show.findOne({
                        where: { id: sub.show.id }
                    });
                    return {
                        show,
                        season: sub.currentEpisode?.season ?? null,
                        episode: sub.currentEpisode?.episode ?? null
                    };
                })
            );

            showProgressCache.set(progressKey, userShowStates, 1000 * 60 * 10);
        }

        // ----------------------------------------------
        // 4. FINAL CLASSIFICATION PROMPT
        // ----------------------------------------------
        const prompt = `
You are a spoiler classifier.

Post content:
${post.content}

Relevant retrieved context:
${JSON.stringify(similarEmbeddings, null, 2)}

User's current progress:
${JSON.stringify(userShowStates, null, 2)}

If not fully confident, return "1".

Return:
0 → not a spoiler
1 → spoiler
        `;

        return this.classifySpoiler(prompt);
    }
}
