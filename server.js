import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("❌ Missing OpenRouter API Key");
  process.exit(1);
}

app.use(cors({
  origin: ['https://bbek2006.github.io', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/generate-mcq", async (req, res) => {
  try {
    const userText = req.body.text;

    if (!userText) {
      return res.status(400).json({ error: "Please provide text content" });
    }

    const messages = [
      {
        role: "system",
        content: `You are an expert quiz generator. Analyze the provided lecture content and generate the MAXIMUM number of high-quality multiple-choice questions that comprehensively cover all key concepts in the text.

        Guidelines:
        1. Generate as many questions as needed to cover all important aspects
        2. Each question must test a distinct concept or aspect
        3. Questions should vary in type (definitions, applications, comparisons, etc.)
        4. Format each question exactly like this:
        
        Q1. [Question text]
        a) Option 1
        b) Option 2
        c) Option 3
        d) Option 4
        Answer: [correct letter]
        
        [Blank line between questions]
        
        5. Continue until all testable content is covered
        6. If content is limited, generate at least 3 questions`
      },
      {
        role: "user",
        content: userText,
      },
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://paste-to-quiz.onrender.com",
        "X-Title": "paste-to-quiz",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 2000 // Allow for longer responses
      }),
    });

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content;

    if (!message) {
      return res.status(500).json({ error: "No questions generated" });
    }

    res.json({ content: message });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});