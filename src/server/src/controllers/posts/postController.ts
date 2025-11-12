import { Request, Response } from "express";
import { IPostController } from "./IPostController";
import { OpenAIController } from "../llm/openaiController";
import { In, LessThan } from "typeorm";
import { Show } from "../../model/entities/show";
import { User } from "../../model/entities/User"
import { Post } from "../../model/entities/post"

const openAiController = new OpenAIController(); 

export class PostController implements IPostController {
    async create(req: Request, res: Response){
        try {
            const userId = req.body.userId; // we will need to get this from the auth token
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
            res.status(200).json({
                message: "Post created successfully"
            });

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
            const postId = req.body.postId;
            const post = await Post.findOneBy({ id: postId })

            if(!post){
                res.status(404).json({ message: "Post Not Pound"});
                return;
            }

            await Post.delete({
                id: postId
            });

            res.status(200).json({ message: "Post Deleted Successfully"});
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
            const postId = Number(req.params.id )
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

    async getRecommendations(req: Request, res: Response){
        try {
            const userId = Number(req.query.userId); // we need to get this from the auth token
            const user = await User.findOne({
                where: { id: userId },
                relations: ["shows", "subscriptions", "subscriptions.show", "subscriptions.currentEpisode"]
            });

            if(!user){
                res.status(404).json({
                    message: "User not found"
                });
                return; 
            }

            const showIds = user.shows.map(show => show.id);
            const limit = Number(req.query.limit); 
            const cursor = new Date(req.query.cursor as string); 

            const posts = await Post.find({
                where: { 
                    show: In(showIds),
                    createdAt: LessThan(cursor) 
                },
                relations: ["show", "show.episodes"],
                take: limit
            });

            const safePosts = await openAiController.checkSpoiler(posts, user); 

            res.status(200).json({
                message: "Recommendations",
                recommendations: safePosts
            });
            return; 
        } catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                error: error
            })
        }
    }
}