// routes/aiRoutes.js
import express from "express";
import { runTaskAI, runChatAI } from "../utils/aiClient.js";

const router = express.Router();

// POST /api/ai/process-task
router.post("/process-task", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ message: "description required" });

    const out = await runTaskAI(description);
    return res.json(out);
  } catch (err) {
    console.error("process-task error:", err);
    return res.status(500).json({ message: "AI processing failed" });
  }
});

// POST /api/ai/chat
// body: { message: "Hello" } OR { messages: [{role:'user', content:'hi'}] }
router.post("/chat", async (req, res) => {
  try {
    const { message, messages } = req.body;
    if (!message && !messages) return res.status(400).json({ message: "message or messages required" });

    const input = messages || message;
    const out = await runChatAI(input);

    return res.json({ reply: out.reply });
  } catch (err) {
    console.error("ai chat error:", err);
    return res.status(500).json({ message: "AI chat failed" });
  }
});

export default router;
