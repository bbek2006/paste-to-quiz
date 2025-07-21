import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();
dotenv.config();

// Middleware
app.use(cors({
  origin: ['https://bbek2006.github.io', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// MCQ Generation Endpoint
app.post('/generate-mcq', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid text input'
      });
    }

    const systemPrompt = `
    You are an expert exam creator. Generate comprehensive multiple-choice questions that thoroughly test understanding of the provided text. Follow these guidelines STRICTLY:

    1. Generate 5-8 high-quality MCQs covering all key concepts
    2. Vary question types:
       - Direct concept questions
       - Statement-based questions
       - Assertion-reasoning pairs
       - Application-based scenarios
    3. Option formats should include:
       - Complete statements
       - Single-word answers
       - "Both A and B"/"None of the above" when appropriate
       - Plausible distractors
    4. Requirements:
       - Each question must test a distinct concept
       - All options must be grammatically consistent
       - Answers must be unambiguous and text-supported
       - Include difficulty mix (20% easy, 60% medium, 20% hard)
    5. Format each question EXACTLY like this:
       Q1. [Question text]
       a) [Option 1]
       b) [Option 2]
       c) [Option 3]
       d) [Option 4]
       Answer: [ONLY a/b/c/d]
       [Blank line between questions]

    Example of excellent questions:
    Q1. What is the main advantage of the process described?
    a) It requires less energy (plausible distractor)
    b) Higher efficiency in controlled environments (correct)
    c) Assertion: It's faster. Reason: The text mentions 2x speed. (assertion-reasoning)
    d) Both A and C (combination option)
    Answer: b
    `;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{
          role: 'system',
          content: systemPrompt
        }, {
          role: 'user',
          content: text
        }],
        temperature: 0.4, // Balanced between creativity and accuracy
        max_tokens: 2000 // Allow for longer responses
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate questions');
    }

    // Clean and validate the response
    const cleanQuestions = data.choices[0].message.content
      .replace(/Answer: [^a-d]/gi, (match) => {
        const letter = match.charAt(match.length - 1).toLowerCase();
        return ['a','b','c','d'].includes(letter) ? `Answer: ${letter}` : '';
      })
      .replace(/(Q\d+\.)/g, '\n$1'); // Ensure proper spacing

    res.json({
      success: true,
      questions: cleanQuestions,
      count: (cleanQuestions.match(/Q\d+\./g) || []).length
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate valid questions. Please try with different text.'
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});