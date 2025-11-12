import { Router } from "express";

import { PostController } from "../controllers/posts/postController";
const postController = new PostController();

const postRouter = Router(); 

postRouter.get("/:id", postController.get);
postRouter.post("/create", postController.create);
postRouter.delete("/delete", postController.delete);
postRouter.get("/recommendations", postController.getRecommendations);

export default postRouter; 