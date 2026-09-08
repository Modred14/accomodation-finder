// components/dashboard/ConversationList.jsx
import Link from "next/link";
import { relativeTime } from "@/lib/format";

export default function ConversationList({ conversations, role, activeId }) {
  if (conversations.length === 0) {
    return <p className="p-4 text-sm text-muted">No conversations yet.</p>;
  }

  const basePath = role === "student" ? "/dashboard/messages" : "/owner/messages";

  return (
    <ul className="divide-y divide-border">
      {conversations.map((c) => {
        const otherName = role === "student" ? c.owner_name : c.student_name;
        const active = c.id === activeId;
        return (
          <li key={c.id}>
            <Link
              href={`${basePath}/${c.id}`}
              className={`block px-4 py-3 transition-colors ${active ? "bg-brand-50" : "hover:bg-surface"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="line-clamp-1 text-sm font-medium text-ink">{otherName}</p>
                {c.unread_count > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1.5 text-[10px] font-semibold text-white">
                    {c.unread_count}
                  </span>
                )}
              </div>
              {c.property_title && <p className="line-clamp-1 text-xs text-muted">{c.property_title}</p>}
              {c.last_message && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{c.last_message}</p>}
              <p className="mt-0.5 text-[11px] text-muted">{relativeTime(c.last_message_at)}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
