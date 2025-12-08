import { GoogleGenAI } from "@google/genai"; 
import { Request, Response } from "express";
import { User } from "../../model/entities/User";
import { Post } from "../../model/entities/post";
import { Show } from "../../model/entities/show";
import { Chunk } from "../../model/entities/chunk";
import { Embedder } from "../../utils/embedding";
import { Similarities } from "../../utils/similarities";
import { In } from "typeorm";
import { CacheService } from "../../services/cacheService";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 
const embedder = new Embedder();
const similarities = new Similarities();

const embeddingCache = new CacheService<any>();
const similarityCache = new CacheService<any>();
const showProgressCache = new CacheService<any>();

export class GeminiController { 

    async generate(req: Request, res: Response) {
        try {
            const { prompt } = req.body;

            const response = await client.models.generateContent({
                model: "gemini-2.5-flash", 
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            });

            res.json({ output: response.text });
        } catch (error) {
            console.error("Error generating response:", error);
            res.status(500).json({ error: "Failed to generate response." });
        }
    }

    async checkSpoiler(posts: Post[], user: User): Promise<Post[]> {
        try {
            const results = await Promise.all(
                posts.map(post => this.processPost(post, user))
            );

            return posts.filter((_, idx) => results[idx]?.trim() === "0");
        } catch (error) {
            console.error("Error in checkSpoiler:", error);
            return [];
        }
    }

    private async classifySpoiler(prompt: string): Promise<string> {
        try {
            const response = await client.models.generateContent({
                model: "gemini-2.5-flash", 
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            });
            
            return (response.text ?? "").trim();
        } catch (error) {
            console.error("Error classifying spoiler:", error);
            return "";
        }
    }

    private async processPost(post: Post, user: User): Promise<string> {
        const contentKey = `embedding:${post.id}`;
        const similarityKey = `similar:${post.id}`;
        const progressKey = `userProgress:${user.id}`;

        let embedded = embeddingCache.get(contentKey);

        if (!embedded) {
            embedded = await embedder.generateEmbeddings([post.content]);
            embeddingCache.set(contentKey, embedded, 1000 * 60 * 60); // 1hr TTL
        }

        const vector = embedded.data[0].embedding;

        let similarEmbeddings = similarityCache.get(similarityKey);

        if (!similarEmbeddings) {
            const episodeIds = post.show.episodes.map(ep => ep.id);
            const chunks = await Chunk.find({ where: { episode: In(episodeIds) } });

            similarEmbeddings = similarities.findSimilarityFromDb(chunks, vector);
            similarityCache.set(similarityKey, similarEmbeddings, 1000 * 60 * 30); // 30m TTL
        }

        let userShowStates = showProgressCache.get(progressKey);

        if (!userShowStates) {
            userShowStates = await Promise.all(
                user.subscriptions.map(async sub => {
                    const show = await Show.findOne({ where: { id: sub.show.id } });
                    return {
                        show,
                        season: sub.currentEpisode?.season ?? null,
                        episode: sub.currentEpisode?.episode ?? null
                    };
                })
            );

            showProgressCache.set(progressKey, userShowStates, 1000 * 60 * 10); // 10min TTL
        }

        const prompt = `
You are a spoiler classifier. Respond only with the number '0' or '1'.

Post content:
${post.content}

Relevant context from the vector database:
${JSON.stringify(similarEmbeddings, null, 2)}

User's current progress in their shows:
${JSON.stringify(userShowStates, null, 2)}

Return:
0 → not a spoiler
1 → is a spoiler
        `;

        return this.classifySpoiler(prompt);
    }
}