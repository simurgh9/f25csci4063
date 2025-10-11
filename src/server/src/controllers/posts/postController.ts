import { Request, Response } from "express";
import { IPostController } from "./IPostController";
import { Post } from "model/entities/post";

export class PostController implements IPostController {
    async create(req: Request, res: Response){

    }

    async get(req: Request, res: Response) {
        try {
            const postId = req.body.id 
            const post = await Post.findOneBy({
                id: postId
            })

            if(!post){
                res.json({
                    status: 404,
                    message: "post nod foun"
                })
            }

            res.json({
                status: 200,
                post: post
            });

        } catch (error) {
            res.json({
                status: 500,
                error: error
            })
        }
    }
}