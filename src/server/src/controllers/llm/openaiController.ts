import OpenAI from "openai";
import { Request, Response } from "express";
import { IModelController } from "./IModelController";
import { SubscriptionInfo } from "../../model/entities/subscriptionInfo";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}); 

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export class OpenAIController implements IModelController {
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

    async checkSpoiler(req: Request, res: Response){
        try {
            const posts = req.body.posts;
            const user = req.body.user; 
            
            
        } catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
        }
    }
}
