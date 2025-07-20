const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const { OPENROUTER_API_KEY } = require("./config");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ Add this line to serve frontend from /public folder
app.use(express.static(path.join(__dirname, "public")));

app.post("/generate-mcq", async (req, res) => {
  const text = req.body.text;

  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            `You are an AI tutor. Read the following lecture content and generate 3 multiple-choice questions.
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
          content: text,
        },
      ],
    }),
  });

  const data = await response.json();
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
