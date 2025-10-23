import { Request, Response } from "express";

export interface IUserController {
    create(req: Request, res: Response): Promise<void>;
    get(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    addShowForUser(req: Request, res: Response): Promise<void>; 
}