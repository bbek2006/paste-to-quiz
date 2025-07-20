// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("❌ Missing OpenRouter API Key. Add it in Render's Environment tab.");
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // 📦 serve frontend

app.post("/generate-mcq", async (req, res) => {
  const userText = req.body.text;

  const messages = [
    {
      role: "system",
      content: `You are an AI tutor. Read the following lecture content and generate 3 multiple-choice questions.
Each question must have:
- 1 question
- 4 options (a, b, c, d)
- 1 correct answer labeled clearly.
Format:
Q1. Question?
a) Option 1
b) Option 2
c) Option 3
d) Option 4
Answer: b`,
    },
    {
      role: "user",
      content: userText,
    },
  ];

  try {
    console.log("📤 Sending request to OpenRouter...");
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
      }),
    });

    const data = await response.json();
    console.log("📩 OpenRouter response:\n", JSON.stringify(data, null, 2)); // Log entire response

    const message = data?.choices?.[0]?.message?.content;

    if (message) {
      res.json({
  choices: [
    {
      message: {
        content: message
      }
    }
  ]
});

    } else {
      console.error("⚠️ No content in OpenRouter response:", data);
      res.status(500).json({ error: "No content returned from OpenRouter." });
    }
  } catch (error) {
    console.error("❌ Error contacting OpenRouter:", error);
    res.status(500).json({ error: "Failed to generate questions from OpenRouter." });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
