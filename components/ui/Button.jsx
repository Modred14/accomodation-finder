// components/ui/Button.jsx
import Link from "next/link";

const VARIANTS = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900",
  accent: "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700",
  outline: "border border-border bg-transparent text-ink hover:bg-surface",
  ghost: "bg-transparent text-ink hover:bg-surface",
  danger: "bg-danger-500 text-white hover:bg-danger-600",
  subtle: "bg-surface text-ink hover:bg-surface-2",
};

const SIZES = {
  sm: "text-sm px-3 py-1.5 rounded-md gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-lg gap-2",
  lg: "text-base px-5 py-3 rounded-lg gap-2",
};

export default function Button({
  as,
  href,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}) {
  const classes = `inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  const Component = as || "button";
  return (
    <Component className={classes} disabled={disabled} {...props}>
      {children}
    </Component>
  );
}
