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
            const { username, password } = req.body; 
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = User.create({
                username: username,
                password: hashedPassword
            })

            await user.save(); 
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
            const userId = Number(req.params.id);
            const user = await User.findOneBy({
                id: userId
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
            const userId = Number(req.params.id);
            const user = await User.findOneBy({
                id: userId
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

            const userId = req.body.userId; //we'll likely need to get this from the auth token instead 
            const user = await User.findOne({
                where: { id: userId },
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
            const userId = req.body.userId; // we'll need to get this from the auth token 
            const title = req.body.showTitle; 
            const { season, episode } = req.body;

            const user = await User.findOne({
                where: { id: userId },
                relations: ["shows", "subscriptions"]
            });

            if(!user){
                res.status(404).json({ 
                    message: "User not found"
                });
                return; 
            }
            
            const show = await Show.findOne({
                where: { title: title},
                relations: ["episodes", "subscriptions"]
            })
            
            if(!show){
                res.status(404).json({ 
                    message: "Show not found"
                });
                return; 
            }
            
            const episodeEntity = await Episode.findOneBy({
                season: season, 
                episode: episode
            })
            
            if(!episodeEntity){
                res.status(404).json({ 
                    message: "Episode not found"
                });
                return; 
            }

            const subscriptionInfo = SubscriptionInfo.create({
                user: user,
                show: show,
                currentEpisode: episodeEntity
            });
            await subscriptionInfo.save(); 

            res.status(200).json({
                message: "Subscription Added Successfully"
            });
            return; 

        } catch (error) {
            res.status(500).json({
                message: "Internal server error", 
                error: error
            })
            return; 
        }    
    }
}