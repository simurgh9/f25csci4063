import express from "express";

import ollamaRouter from "./routes/ollama";

const app = express();
const PORT = 3000;

// middleware functions
app.use(express.json());

// routers
app.use("/api", ollamaRouter);

app.listen(PORT, "0.0.0.0", () => {
	console.log(`connected at port ${PORT}`);
});
