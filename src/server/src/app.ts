import express, {json, urlencoded} from "express";
import "reflect-metadata";
require('dotenv').config({
    path: './.env'
})

import openAIRouter from "./routes/openAIRouter";
import userRouter from "./routes/UserRouter";
import postRouter from "./routes/PostRouter";
import scraperRouter from "./routes/scraperRouter";

export const app = express();

app.use(
    urlencoded({
        extended: true,
    })
);
app.use(json());

app.use("/openAI", openAIRouter);
app.use("/user", userRouter); 
app.use("/post", postRouter);
app.use("/scraper", scraperRouter);