import express from "express";
require('dotenv').config({
    path: './.env'
})

import ollamaRouter from "./routes/ollamaRouter";
import openAIRouter from "./routes/openAIRouter";

const app = express();
const PORT = 3000;

// middleware functions
app.use(express.json());

// routers
app.use("/ollama", ollamaRouter);
app.use("/openAI", openAIRouter); 

app.listen(PORT, "0.0.0.0", () => {
	console.log(`connected at port ${PORT}`);
});
