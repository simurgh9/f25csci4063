import { Router } from "express"; 

import { OpenAIController } from "../controllers/llm/openaiController";
const openAIController = new OpenAIController(); 

const openAIRouter = Router();

openAIRouter.post("/generate", openAIController.generate);

export default openAIRouter; 