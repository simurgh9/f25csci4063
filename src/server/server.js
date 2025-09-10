import express from "express";

import ollamaRouter from "./routes/ollama.js";

const PORT = 3000;
const app = express();

// middleware functions
app.use(express.json());

// routers
app.use("/api", ollamaRouter);

app.listen(PORT, "0.0.0.0", () => {
	console.log(`connected at port ${PORT}`);
});
