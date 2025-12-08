import { Request, Response } from "express";
import { Show } from "../../model/entities/show";
import { Episode } from "../../model/entities/episode";

export class ShowController {
    async get(req: Request, res: Response){
        try {
            const shows = await Show.find();
            res.status(200).json({
                shows: shows
            }); 
            return;
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: error
            })
            return; 
        }
    }

    async getEpisodesByShow(req: Request, res: Response){
        try {
            const title = req.query.title as string; 
            const show = await Show.findOne({
                where: {
                    title: title
                },
                relations: ["episodes"]
            });

            if(!show){
                res.status(404).json({
                    message: "Show not found"
                })
                return; 
            }

            const episodes = await Episode.find({
                where: {
                    show: show
                }
            })
            
            res.status(200).json({
                episodes: episodes
            });
            return;
            
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: error
            })
            return; 
        }
    }
}