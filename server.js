// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");


// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("❌ Missing OpenRouter API Key. Add it to .env");
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());

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
Format it like:
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
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // update to your domain on deploy
        "X-Title": "paste-to-quiz",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages,
      }),
    });

    const data = await response.json();

    const message = data?.choices?.[0]?.message?.content;

    if (message) {
      res.json({ content: message });
    } else {
      res.status(500).json({ error: "No content returned from LLM." });
    }
  } catch (error) {
    console.error("❌ API Request Error:", error);
    res.status(500).json({ error: "Something went wrong while generating questions." });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
