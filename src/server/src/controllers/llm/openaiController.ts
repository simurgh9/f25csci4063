import OpenAI from "openai";
import { Request, Response } from "express";
import { IModelController } from "./IModelController";
import { User } from "../../model/entities/User"
import { SubscriptionInfo } from "../../model/entities/subscriptionInfo";
import { Post } from "../../model/entities/post"
import { Show } from "../../model/entities/show";
import { Chunk } from "../../model/entities/chunk";
import { Embedder } from "../../utils/embedding";
import { Similarities } from "../../utils/similarities";
import { In } from "typeorm";

const embedder = new Embedder();
const similarities = new Similarities(); 

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}); 

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export class OpenAIController {
    async generate(req: Request, res: Response) {
        try {
            const { prompt } = req.body;
    
            const response = await client.responses.create({
                model: "gpt-5-nano",
                input: prompt
            });
        
            res.json({ output: response.output_text });
        } catch (error: unknown) {
            console.log(`Error occured generating response: ${error}`);
        }

    }

    async checkSpoiler(posts: Post[], user: User){
        try {
            const prompts = [];

            for(let post of posts){
                const content = post.content;
                
                const embeddedContent = await embedder.generateEmbeddings([content]); 

                const episodeIds = post.show.episodes.map(ep => ep.id);

                const embeddings = await Chunk.find({
                    where: { 
                        episode: In(episodeIds) 
                    }
                });
                
                const similarEmbeddings = similarities.findSimilarityFromDb(embeddings, embeddedContent.data[0].embedding);
                
                const shows = await Promise.all(
                    user.subscriptions.map(async (subscription) => {
                        const show = await Show.findOne({
                            where: { id: subscription.show.id }
                        });
                        return {
                            show,
                            season: subscription.currentEpisode?.season,
                            episode: subscription.currentEpisode?.episode
                        };
                    })
                );
                
                let prompt = `
                    You are a spoiler checker. 
                    You are provided the following 
                    context to determine if this 
                    post 
                    
                    ${post.content}
                    
                    is a spoiler for 
                    the current user.

                    this is context from the vector db 

                    ${JSON.stringify(similarEmbeddings)}

                    and this is where the user is at in the show 

                    ${JSON.stringify(shows)}

                    return 0 if it is not a spoiler
                    return 1 if it is a spoiler
                `;

                prompts.push(this.spoiler(prompt)); 
            }

            const responses = await Promise.all(prompts);
            const nonSpoilerPosts = posts.filter((post, i) => {
            const responseText = responses[i]?.trim(); 
                return responseText === "0"; 
            });

            return nonSpoilerPosts;

        } catch (error) {
            return error
        }
    }

    private async spoiler(prompt: string) : Promise<string | undefined>{
        try {    
            const response = await client.responses.create({
                model: "gpt-5-nano",
                input: prompt
            });
                    
            return response.output_text

        } catch (error: unknown) {
            console.log(`Error occured generating response: ${error}`);
        }
    }
}
