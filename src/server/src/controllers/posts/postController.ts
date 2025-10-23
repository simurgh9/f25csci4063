import { Request, Response } from "express";
import { IPostController } from "./IPostController";
import { Show } from "model/entities/show";
import { Post } from "model/entities/post";
import { User } from "model/entities/User";

export class PostController implements IPostController {
    async create(req: Request, res: Response){
        try {
            const userId = req.body.userId;
            const user = await User.findOneBy(userId);

            const showTitle = req.body.showTitle; 
            const show = await Show.findOneBy({ title: showTitle });
            
            const content = req.body.content;

            if(!show){
                res.status(404).json({ 
                    message: "Show for post does not exist"
                }); 
                return;
            }

            if(!user){
                res.status(404).json({
                    message: "User not found"
                });
                return;
            }
            
            const post = Post.create({
                user: user,
                show: show,
                content: content
            }); 

            await post.save();
            return; 

        } catch (error) {
            res.status(500).json({
                message: "Server error",
                error: error
            })
            return;

        }
    }

    async delete(req: Request, res: Response){
        try {
            const postId = req.body.Id;
            const post = await Post.findOneBy({ id: postId})
            if(!post){
                res.status(404).json({ message: "Post Not Pound"});
                return;
            }

            await post.save();
            res.status(204).json({ message: "Post Deleted Successfully"});
            return;

        } catch (error) {
            res.json({
                status: 500,
                error: error
            })
            return; 
        }
    }

    async get(req: Request, res: Response) {
        try {
            const postId = req.body.id 
            const post = await Post.findOneBy({
                id: postId
            })

            if(!post){
                res.status(404).json({ 
                    message: "Post nod foun"
                });
                return;
            }

            res.status(200).json({ post: post });
            return; 

        } catch (error) {
            res.json({
                status: 500,
                error: error
            })
            return; 
        }
    }
}