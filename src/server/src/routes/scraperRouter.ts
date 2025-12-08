import { Router } from "express";
import { scrapeShow } from "../controllers/scraper/scraperController";

const scraperRouter = Router();

scraperRouter.post("/show", scrapeShow);

export default scraperRouter;
