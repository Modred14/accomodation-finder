// components/dashboard/MessageThread.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";
import { relativeTime } from "@/lib/format";

export default function MessageThread({ conversationId, currentUserId, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`);
        if (!res.ok) return;
        const data = await res.json();
        setMessages(data.messages);
      } catch {
        // silent — polling failures shouldn't interrupt the user
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  async function handleSend(e) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setBody("");
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Could not send message.", "error");
        return;
      }
      setMessages((prev) => [...prev, data.message]);
    } catch {
      toast("Network error. Try again.", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col sm:h-[65vh]">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm sm:max-w-[70%] ${
                  mine ? "bg-brand-700 text-white" : "bg-surface text-ink"
                }`}
              >
                <p className="whitespace-pre-line">{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-brand-100" : "text-muted"}`}>{relativeTime(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
