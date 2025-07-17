"use client";
import React, { useRef, useState } from "react";

const API_URL = "http://localhost:3000/conversations/chat";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      if (data.response) {
        setMessages((msgs) => [...msgs, { sender: "ai", text: data.response }]);
      } else {
        setMessages((msgs) => [...msgs, { sender: "ai", text: data.error || "Sorry, I couldn't respond." }]);
      }
    } catch (e) {
      setMessages((msgs) => [...msgs, { sender: "ai", text: "Network error. Please try again." }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  return (
    <div>
      {/* Floating Button */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl z-50"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          💬
        </button>
      )}
      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-blue-600 rounded-t-2xl">
            <span className="font-bold text-white">AI Chat Assistant</span>
            <button
              className="text-white text-xl hover:text-gray-200"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2" style={{ maxHeight: 320 }}>
            {messages.length === 0 && (
              <div className="text-gray-400 text-sm text-center mt-8">Ask me anything about the app, uploading, or AI insights!</div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[80%] text-sm whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm">Thinking...</div>
              </div>
            )}
          </div>
          <div className="flex items-center border-t border-gray-100 px-3 py-2 bg-gray-50 rounded-b-2xl">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 