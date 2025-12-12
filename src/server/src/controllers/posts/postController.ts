import { Request, Response } from "express";
import { IPostController } from "./IPostController";
import { OpenAIController } from "../llm/openaiController";
import { In, LessThan, Not } from "typeorm";
import { Show } from "../../model/entities/show";
import { User } from "../../model/entities/User"
import { Post } from "../../model/entities/post"
import { GeminiController } from "../llm/geminiController";
import { PostEmbeddingService } from "../../services/postEmbeddingService";
import { SpoilerService } from "../../services/spoilerService";

const openAiController = new OpenAIController(); 
const geminiController = new GeminiController();
const postEmbeddingService = new PostEmbeddingService();
const spoilerService = new SpoilerService();

export class PostController implements IPostController {
    async create(req: Request, res: Response){
        try {
            const fireBaseId = req.body.userId;
            const user = await User.findOneBy({ fireBaseId });

            const showTitle = req.body.showTitle; 
            const show = await Show.findOne({ 
                where: { title: showTitle },
                relations: ["episodes"]
            });
            
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

            // Pre-compute and store post-to-chunk similarities
            // This runs async in background - doesn't block the response
            postEmbeddingService.computeAndStoreSimilarities(post).catch(err => {
                console.error("Failed to compute similarities for post:", err);
            });

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
            const post = await Post.findOne({
                where: { id: postId },
                relations: ["user", "show"],
            });

            if(!post){
                res.status(404).json({ 
                    message: "Post nod foun"
                });
                return;
            }

            const strippedPost = {
                id: post.id,
                content: post.content,
                createdAt: post.createdAt,
                user: post.user.username,
                show: post.show.title,
            };

            res.status(200).json({ post: strippedPost });
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
            const fireBaseId = req.query.userId as string;
            const user = await User.findOne({
                where: { fireBaseId: fireBaseId },
                relations: ["shows", "subscriptions", "subscriptions.show", "subscriptions.currentEpisode"]
            });

            if(!user){
                res.status(404).json({
                    message: "User not found"
                });
                return; 
            }

            const showIds = user.shows.map(show => show.id);
            const limit = Number(req.query.limit) || 5; 
            
            let cursor: Date;

            if (req.query.cursor) {
                cursor = new Date(req.query.cursor as string);
            } else {
                cursor = new Date();
                cursor.setHours(cursor.getHours() + 6);
            }

            const posts = await Post.find({
                where: { 
                    show: In(showIds),
                    createdAt: LessThan(cursor),
                    user: { fireBaseId: Not(fireBaseId) }
                },
                relations: ["show", "user"],
                order: { createdAt: "DESC" },
                take: limit
            });

            // OPTIMIZED: Use SpoilerService with pre-computed chunks
            const safePosts = await spoilerService.checkSpoilersOptimized(posts, user);

            const cleanedPosts = safePosts.map(({ post, spoiler }) => ({
                id: post.id,
                content: post.content,
                createdAt: post.createdAt,
                username: post.user?.username || "Unknown",
                showTitle: post.show?.title || "Unknown",
                spoiler
            }));

            let nextCursor: string | null = null;
            if(posts.length === limit){
                const lastPost = posts[posts.length - 1];
                nextCursor = lastPost.createdAt.toISOString();
            }

            res.status(200).json({
                message: "Recommendations",
                recommendations: cleanedPosts,
                nextCursor
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