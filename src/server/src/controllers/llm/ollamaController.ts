import { Request, Response } from "express";
import { IModelController } from "./IModelController"

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export class OllamaController implements IModelController {
    async generate(req: Request, res: Response){
        try {
            const { prompt } = req.body;
            console.log(`Awaiting response to prompt: ${prompt}...`);

            const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: "qwen3:0.6b", prompt, stream: false }),
            });

            const data = await response.json();
            console.log("Response received");
            res.json(data);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: "an unknown error occurred" });
            }
        }
    }
}
