import { Router } from "express";

import { ShowController } from "../controllers/shows/showController";
const showController = new ShowController();

const showRouter = Router(); 

showRouter.get("/", showController.get);
showRouter.get("/episodes", showController.getEpisodesByShow);

export default showRouter; 