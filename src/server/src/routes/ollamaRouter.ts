import { Router} from "express";

import { OllamaController } from "../controllers/llm/ollamaController";
const ollamaController = new OllamaController()

const ollamaRouter = Router();

ollamaRouter.post("/generate", ollamaController.generate);

export default ollamaRouter;