// components/ui/Badge.jsx
const TONES = {
  neutral: "bg-surface-2 text-ink",
  brand: "bg-brand-50 text-brand-700",
  accent: "bg-accent-50 text-accent-700",
  success: "bg-success-100 text-success-600",
  danger: "bg-danger-100 text-danger-600",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
