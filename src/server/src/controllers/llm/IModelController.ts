import { Request, Response } from "express";

export interface IModelController {
    generate(req: Request, res: Response): Promise<void>;
}