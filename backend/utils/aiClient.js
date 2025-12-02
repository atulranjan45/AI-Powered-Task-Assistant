// utils/aiClient.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  // don't throw here to let server start — we'll handle missing key on calls
  console.warn("GEMINI_API_KEY not found in .env. AI calls will fallback.");
}

let genAI;
try {
  if (apiKey) genAI = new GoogleGenerativeAI(apiKey);
} catch (e) {
  console.error("Failed to create GoogleGenerativeAI client:", e);
  genAI = null;
}

/**
 * runTaskAI(taskDescription)
 * Keeps the previous behaviour — returns { summary, category, predictedDeadline }
 */
export async function runTaskAI(taskDescription) {
  try {
    if (!genAI) throw new Error("Gemini client not initialized");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a helpful assistant. Return JSON only.

Task: """${taskDescription}"""

Return a JSON object with these keys:
- summary: short one-line summary
- category: one of ["Work","Personal","Bugfix","Research","Other"]
- predictedDeadline: ISO date string YYYY-MM-DD (choose a reasonable date)
`;

    const result = await model.generateContent({
      // some SDK variants take {prompt: ...} or .generateContent({prompt:...}) — using generateContent with text
      // adapt if your version expects a different call
      prompt: prompt,
    });

    // SDK returns an object. The text may be in result.candidates[0].content[0].text or as result.text()
    let text;
    try {
      // safest attempt
      if (typeof result?.response?.text === "function") text = result.response.text();
      else if (result?.candidates?.[0]?.content?.[0]?.text) text = result.candidates[0].content[0].text;
      else text = JSON.stringify(result);
    } catch {
      text = JSON.stringify(result);
    }

    // Try parse JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // fallback heuristics if not strict JSON
      parsed = {
        summary: (taskDescription || "").slice(0, 120),
        category: "Other",
        predictedDeadline: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      };
    }

    return parsed;
  } catch (err) {
    console.error("runTaskAI error:", err);
    return {
      summary: (taskDescription || "").slice(0, 120),
      category: "Other",
      predictedDeadline: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    };
  }
}

/**
 * runChatAI(messages)
 * Accepts either a string message or an array of messages (chat-like).
 * Returns { reply: "text" }
 */
export async function runChatAI(input) {
  try {
    if (!genAI) throw new Error("Gemini client not initialized");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5" });

    // Build a prompt — allow chat-style if array provided
    let prompt;
    if (Array.isArray(input)) {
      // input is [{role:"user"/"assistant", content:"..."}]
      const conversation = input.map((m) => `${m.role || "user"}: ${m.content}`).join("\n");
      prompt = `You are a helpful assistant in a chat. Continue the conversation politely.\n\n${conversation}\nassistant:`;
    } else {
      prompt = `You are a helpful assistant. Reply concisely and helpfully.\n\nUser: ${input}\nAssistant:`;
    }

    const result = await model.generateContent({
      prompt: prompt,
      // options: temperature, maxOutputTokens etc. Adjust as needed
      // temperature: 0.2
    });

    let text;
    try {
      if (typeof result?.response?.text === "function") text = result.response.text();
      else if (result?.candidates?.[0]?.content?.[0]?.text) text = result.candidates[0].content[0].text;
      else text = String(result);
    } catch {
      text = String(result);
    }

    return { reply: (text || "").trim() };
  } catch (err) {
    console.error("runChatAI error:", err);
    return {
      reply:
        "Sorry — AI is temporarily unavailable. Try again later or describe your request and I'll assist.",
    };
  }
}
