"use client";
import React, { useRef, useState } from "react";

const API_URL = "http://localhost:3000/conversations/chat";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function ChatPanel({ conversationId, disabled }: { conversationId: number | null, disabled?: boolean }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async () => {
    if (!input.trim() || disabled || !conversationId) return;
    const userMsg: ChatMessage = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, conversationId }),
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
    if (e.key === "Enter" && !loading && !disabled && conversationId) {
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col">
      <div className="flex items-center px-4 py-3 border-b border-gray-100 bg-blue-600 rounded-t-2xl">
        <span className="font-bold text-white">Chat about your audio</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2" style={{ maxHeight: 240 }}>
        {disabled ? (
          <div className="text-gray-400 text-sm text-center mt-8">Please upload your audio to start chatting.</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-400 text-sm text-center mt-8">Ask the AI anything about your uploaded audio!</div>
        ) : null}
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
        {loading && !disabled && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm">Thinking...</div>
          </div>
        )}
      </div>
      <div className="flex items-center border-t border-gray-100 px-3 py-2 bg-gray-50 rounded-b-2xl">
        <input
          ref={inputRef}
          type="text"
          className={`flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm ${
            loading || disabled || !conversationId
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-900'
          }`}
          placeholder={disabled ? "Please upload audio first..." : "Type your message..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || disabled || !conversationId}
        />
        <button
          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading || !input.trim() || disabled || !conversationId}
        >
          Send
        </button>
      </div>
    </div>
  );
} 