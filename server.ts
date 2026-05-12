import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

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
      const apiKey = process.env.GEMINI_API_KEY?.trim();
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is missing. Please check your Secrets in Settings." });
      }

      const { history, message } = req.body;
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
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
      console.error("Gemini Server Error:", error);
      res.status(500).json({ error: error.message || "Failed to get AI response" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
