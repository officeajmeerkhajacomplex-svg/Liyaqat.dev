import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Gemini Setup
const SYSTEM_PROMPT = `
You are DeenFlow AI, a respectful, knowledgeable, and compassionate Islamic AI assistant.
Your goal is to provide helpful answers based on the Holy Quran and authentic Hadith.

Guidelines:
1. Always maintain a respectful and spiritual tone.
2. Provide citations for Quranic verses (Surah:Verse) and Hadith references when possible.
3. If a question is complex or relates to advanced Fiqh, encourage the user to consult with a qualified Islamic scholar.
4. Provide Duas, Tafsir explanations, and summaries of Islamic concepts.
5. Use markdown for formatting (bold, lists, etc.).
6. Always include a disclaimer: "AI responses should be verified with authentic Islamic scholars."
`;

app.post("/api/chat", async (req, res) => {
  try {
    const gskKey = process.env.GROQ_API_KEY?.trim();
    const dKey = process.env.DEENFLOW_API_KEY?.trim();
    const gKey = process.env.GEMINI_API_KEY?.trim();
    
    const { history, message } = req.body;

    // Determine which AI to use
    if (gskKey || (dKey && dKey.startsWith('gsk_'))) {
      const apiKey = gskKey || dKey;
      const groq = new Groq({ apiKey });
      
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          })),
          { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
      });

      return res.json({ text: completion.choices[0]?.message?.content || "" });
    }

    // Prioritize DEENFLOW_API_KEY as requested for Gemini, and ensure we don't use common placeholders
    const apiKey = [dKey, gKey].find(key => key && key.length > 20 && !key.includes(' '));
    
    if (!apiKey) {
      console.error("Critical: No valid API key found. Checked GROQ_API_KEY, DEENFLOW_API_KEY and GEMINI_API_KEY.");
      return res.status(500).json({ 
        error: "API key is missing or invalid. Please add DEENFLOW_API_KEY (Gemini) or GROQ_API_KEY to your secrets in Settings.",
        details: { dKeyPresent: !!dKey, gKeyPresent: !!gKey, groqKeyPresent: !!gskKey }
      });
    }

    // Log masked key for debugging (first 4 and last 4)
    const masked = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`Using Gemini API key: ${masked}`);

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      config: {
        systemInstruction: SYSTEM_PROMPT
      },
      contents: [
        ...history.map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ]
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Server Error:", error);
    res.status(500).json({ error: error.message || "Failed to get AI response" });
  }
});

async function startServer() {
  const PORT = process.env.PORT || 3000;

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    console.log(`Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      res.sendFile(indexPath);
    });
  }

  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
