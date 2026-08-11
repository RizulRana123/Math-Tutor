const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 3000;
const OLLAMA_URL = "http://localhost:11434/api/generate";

app.use(cors());
app.use(express.json());


// Check if Ollama/Mistral is running
app.get("/api/status", async (req, res) => {

    try {

        const response = await fetch("http://localhost:11434/api/tags");

        if (!response.ok) {
            throw new Error("Ollama is not running");
        }

        res.json({
            status: "online"
        });

    } catch (error) {

        res.status(500).json({
            status: "offline",
            error: "Ollama is not running"
        });

    }

});


// Chat with Mistral
app.post("/api/chat", async (req, res) => {

    try {

        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const prompt = `
You are Professor Pi, an AI Math Tutor.

Your job is to help students solve mathematics problems.

Rules:
1. Explain the solution step by step.
2. Keep explanations easy to understand.
3. Show formulas clearly.
4. Check calculations carefully.
5. Give the final answer at the end.
6. If the question is not mathematics, politely tell the user that you are a math tutor.

Student's question:
${userMessage}
`;

        const response = await fetch(OLLAMA_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                model: "mistral",
                prompt: prompt,
                stream: false
            })

        });

        if (!response.ok) {

            const errorText = await response.text();

            throw new Error(errorText);
        }

        const data = await response.json();

        res.json({
            reply: data.response
        });

    } catch (error) {

        console.error("Error:", error);

        res.status(500).json({
            error: "Could not connect to Mistral. Make sure Ollama is running."
        });

    }

});


app.listen(PORT, () => {

    console.log(`Professor Pi server running at http://localhost:${PORT}`);

});