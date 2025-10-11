import { Request, Response } from "express";
import { Post } from "model/entities/post";

export interface IPostController {
    create(req: Request, res: Response): Promise<void>;
    get(req: Request, res: Response): Promise<void>;
}