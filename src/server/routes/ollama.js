import { Router } from "express";

const ollamaRouter = Router();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

ollamaRouter.post("/generate", async (req, res) => {
	try {
		const { prompt } = req.body;
		console.log(`${OLLAMA_BASE_URL}/api/generate`);
		console.log(`Awaiting response to prompt: ${prompt}...`);
		const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ model: "qwen3:0.6b", prompt, stream: false }),
		});

		const data = await response.json();
		console.log("Response received");
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default ollamaRouter;
