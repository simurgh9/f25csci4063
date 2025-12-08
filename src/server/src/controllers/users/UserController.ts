import { Request, Response } from "express";
import { IUserController } from "./IUserController";
import { User } from "../../model/entities/User";
import { Show } from "../../model/entities/show";
import { Episode } from "../../model/entities/episode";
import { SubscriptionInfo } from "../../model/entities/subscriptionInfo";
import bcrypt from "bcryptjs"; 

export class UserController implements IUserController {
    async create(req: Request, res: Response){
        try {
            const { username, fireBaseId } = req.body; 

            const user = User.create({
                username: username,
                fireBaseId: fireBaseId
            })

            const response = await user.save(); 
            res.status(200).json({
                message: "Action complete",
                response: response
            })
            return; 

        } catch (error) {
            res.status(500).json({
                message: "Server Error",
                error: error
            })
        }
    }

    async delete(req: Request, res: Response){
        try {
            const fireBaseId = req.params.id; //FIX 
            const user = await User.findOneBy({
                fireBaseId: fireBaseId
            });

            if(!user){
                res.status(404).json({
                    message: "User not found"
                });
                return;
            }

            res.status(204).json({
                message: "User successfully deleted"
            });
            return;

        } catch (error) {
            res.status(500).json({
                message: "Server Error",
                error: error
            })
            return; 
        }
    }

    async get(req: Request, res: Response){
        try {
            const fireBaseId = req.params.id;//FIX
            const user = await User.findOneBy({
                fireBaseId: fireBaseId
            });

            if(!user){
                res.status(404).json({
                    message: "User not found"
                });
                return; 
            }

            res.status(200).json({
                user: user
            });
            return; 
        } catch (error) {
            res.status(500).json({
                message: "Server Error",
                error: error
            })
            return; 
        }
    }

    async addShowForUser(req: Request, res: Response): Promise<void> {
        try {
            const showTitles = req.body.showTitles; 
            let shows = [];

            const fireBaseId = req.body.userId;//FIX
            const user = await User.findOne({
                where: { fireBaseId: fireBaseId },
                relations: ["shows"]
            });

            if(!user){
                res.status(404).json({
                    message: "user not found"
                });
                return; 
            }

            for(let title of showTitles){
                const show = Show.findOne({
                    where: { title: title },
                    relations: ["user"]
                });
                shows.push(show); 
            }

            shows = await Promise.all(shows);

            for(let show of shows){
                if(!show){
                    res.status(404).json({
                        message: "show(s) not found",
                        shows: shows
                    });
                    return
                }
                user.shows.push(show);
                show.user.push(user);
            }
            
            await Promise.all(shows
                .filter(show => show !== null)
                .map(show => show?.save()));

            await user.save(); 

            res.status(200).json({
                message: "shows added to user successfully"
            });
            return;

        } catch (error) {
            res.status(500).json({
                message: "server error",
                error: error
            })
            return;
        }
    }

    async addCurrentEpisode(req: Request, res: Response): Promise<void> {
        try {
            const fireBaseId = req.body.userId;
            const title = req.body.showTitle;
            const { season, episode } = req.body;

            const user = await User.findOne({
                where: { fireBaseId },
                relations: ["shows", "subscriptions"]
            });

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            const show = await Show.findOne({
                where: { title },
                relations: ["episodes", "subscriptions"]
            });

            if (!show) {
                res.status(404).json({ message: "Show not found" });
                return;
            }

            const episodeEntity = await Episode.findOneBy({
                season,
                episode
            });

            if (!episodeEntity) {
                res.status(404).json({ message: "Episode not found" });
                return;
            }

            // 1. Check for an existing subscription
            let subscriptionInfo = await SubscriptionInfo.findOne({
                where: {
                    user: { fireBaseId },
                    show: { id: show.id }
                },
                relations: ["user", "show"]
            });

            // 2. If it exists, update it
            if (subscriptionInfo) {
                subscriptionInfo.currentEpisode = episodeEntity;
            } 
            // 3. If not, create a new one
            else {
                subscriptionInfo = SubscriptionInfo.create({
                    user,
                    show,
                    currentEpisode: episodeEntity
                });
            }

            await subscriptionInfo.save();

            res.status(200).json({
                message: "Subscription updated successfully"
            });
            return;
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Internal server error",
                error
            });
            return;
        }
    }

    async getSubscriptionInfoForUser(req: Request, res: Response){
        try {
            const fireBaseId = req.body.userId;

            const user = await User.findOne({
                where: { fireBaseId },
                relations: [
                    "subscriptions",
                    "subscriptions.show",
                    "subscriptions.currentEpisode"
                ]
            });

            if (!user) {
                res.status(404).json({
                    message: "User not found"
                });
                return;
            }

            const subs = user.subscriptions.map(sub => ({
                showTitle: sub.show.title,
                season: sub.currentEpisode?.season ?? null,
                episode: sub.currentEpisode?.episode ?? null
            }));

            res.status(200).json({
                subscriptions: subs
            });
            return;

        } catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                error
            });
            return;
        }
    }


    async getPostsForUser(req: Request, res: Response){
        try {
            const fireBaseId = req.params.userId;//FIX
            const user = await User.findOne({
                where: { fireBaseId: fireBaseId }, 
                relations: ["posts", "posts.user", "posts.show"]
            });

            if(!user){
                res.status(500).json({
                    mesage: "User Not Found",
                });
                return; 
            }

            const strippedPosts = user.posts.map(post => ({
                id: post.id,
                content: post.content,
                createdAt: post.createdAt,
                user: post.user.username,
                show: post.show.title
            }));


            res.status(200).json({ posts: strippedPosts });
            return;            
        } catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                error: error
            });
            return;
        }
    }

    async unsubscribeFromShow(req: Request, res: Response): Promise<void> {
        try {
            const fireBaseId = req.body.userId;
            const title = req.body.showTitle;

            const user = await User.findOne({
                where: { fireBaseId },
                relations: ["subscriptions"]
            });

            if (!user) {
                res.status(404).json({
                    message: "User not found"
                });
                return;
            }

            const show = await Show.findOne({
                where: { title }
            });

            if (!show) {
                res.status(404).json({
                    message: "Show not found"
                });
                return;
            }

            const existingSubscription = await SubscriptionInfo.findOne({
                where: {
                    user: { fireBaseId: user.fireBaseId },
                    show: { id: show.id }
                }
            });

            if (!existingSubscription) {
                res.status(404).json({
                    message: "Subscription does not exist"
                });
                return;
            }

            await existingSubscription.remove();

            res.status(200).json({
                message: "Unsubscribed successfully"
            });
            return;

        } catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                error
            });
            return;
        }
    }

}