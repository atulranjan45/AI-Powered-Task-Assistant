// ChatWidget.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function ChatWidget() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([
    // initial welcome message
    { id: "sys-1", sender: "bot", text: "Hi! I'm your AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // helper to scroll to bottom
  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight + 200;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const getToken = () => localStorage.getItem("token") || "";

  // Adds a message to the state
  const pushMessage = (msg) => {
    setMessages((m) => [...m, msg]);
  };

  // Create a simple demo reply so it's not the same text every time
  const demoReplyFor = (userText) => {
    const short = userText.length > 80 ? userText.slice(0, 77) + "..." : userText;
    return `Demo AI: I heard you say "${short}". Tell me more or ask a specific question and I'll try to help.`;
  };

  // send message to backend (or fallback to demo reply)
  const sendMessage = async (text) => {
    if (!text || !text.trim()) return;
    const trimmed = text.trim();

    // Add user message immediately
    const userMsg = { id: `u-${Date.now()}`, sender: "user", text: trimmed };
    pushMessage(userMsg);
    setInput("");
    setLoading(true);

    const token = getToken();

    try {
      if (!token) {
        // no token -> demo fallback but produce contextual reply
        await new Promise((r) => setTimeout(r, 600));
        pushMessage({ id: `b-demo-${Date.now()}`, sender: "bot", text: demoReplyFor(trimmed) });
        setLoading(false);
        return;
      }

      // call backend chat API
      const res = await axios.post(
        "http://localhost:5000/api/chat",
        { message: trimmed },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
      );

      // Expecting res.data.reply (adjust if your backend returns differently)
      const reply = res?.data?.reply ?? res?.data?.message ?? null;

      if (reply && typeof reply === "string") {
        // push the reply
        pushMessage({ id: `b-${Date.now()}`, sender: "bot", text: reply });
      } else {
        // backend responded with unexpected shape -> fallback contextual reply
        pushMessage({ id: `b-fallback-${Date.now()}`, sender: "bot", text: demoReplyFor(trimmed) });
      }
    } catch (err) {
      console.warn("Chat send failed:", err?.message || err);
      // fallback demo reply (contextual)
      pushMessage({ id: `b-error-${Date.now()}`, sender: "bot", text: demoReplyFor(trimmed) });
    } finally {
      setLoading(false);
    }
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!input.trim() || loading) return;
    await sendMessage(input);
    // focus back to input
    inputRef.current?.focus();
  };

  // handle Enter key -> submit (Shift+Enter = newline)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // small UI helpers
  const BotBubble = ({ text }) => (
    <div className="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-[78%] shadow-sm">
      {text}
    </div>
  );

  const UserBubble = ({ text }) => (
    <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[78%] shadow-sm text-right self-end">
      {text}
    </div>
  );

  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 60 }}>
      <div className="w-80 md:w-96 shadow-lg rounded-lg overflow-hidden">
        {/* header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 flex items-center justify-between">
          <div className="font-semibold">AI Assistant</div>
          <div className="text-xs opacity-90">
            <button
              onClick={() => setOpen((o) => !o)}
              className="ml-2 px-2 py-1 bg-white/20 rounded"
            >
              {open ? "−" : "+"}
            </button>
          </div>
        </div>

        {/* body */}
        {open && (
          <>
            <div
              ref={listRef}
              className="bg-white h-64 overflow-auto p-3 flex flex-col gap-3"
              style={{ scrollbarGutter: "stable" }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.sender === "user" ? <UserBubble text={m.text} /> : <BotBubble text={m.text} />}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-2 rounded-lg max-w-[60%]">
                    <div className="flex gap-1 items-center">
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" />
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse delay-75" />
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse delay-150" />
                      <div className="ml-2 text-xs text-gray-500">Assistant is typing…</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-white">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask something..."
                rows={1}
                className="flex-1 resize-none border rounded px-3 py-2 focus:outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white px-3 py-2 rounded"
                aria-label="Send"
              >
                ➤
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
