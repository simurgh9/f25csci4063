import express, {json, urlencoded} from "express";
import "reflect-metadata";
require('dotenv').config({
    path: './.env'
})

import ollamaRouter from "./routes/ollamaRouter";
import openAIRouter from "./routes/openAIRouter";
import userRouter from "./routes/UserRouter";

export const app = express();

app.use(
    urlencoded({
        extended: true,
    })
);
app.use(json());

app.use("/ollama", ollamaRouter);
app.use("/openAI", openAIRouter);
app.use("/user", userRouter); 