import { Request, Response } from "express";

export interface IPostController {
    create(req: Request, res: Response): Promise<void>;
    get(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    getRecommendations(req: Request, res: Response): Promise<void>;
}