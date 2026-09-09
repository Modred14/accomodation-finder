// components/ui/SafeImage.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

// Wraps next/image with a local, non-remote fallback for two cases this app
// hits constantly: a property that has no image row yet (src is falsy), and
// a stored image URL that fails to load at runtime (owner-pasted links can
// go dead; third-party photo hosts can rate-limit or disappear). Either way
// we render an inline placeholder instead of a broken-image icon or an
// empty box, and we never fall back to another remote fetch.
//
// Expects to sit inside a `position: relative` container and is used with
// `fill`, matching how every gallery/card image in this app is laid out.
export default function SafeImage({ src, alt, label = "Photo unavailable", className = "", ...imageProps }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-surface-2 text-muted ${className}`}
      >
        <ImageOff className="h-5 w-5" />
        <span className="text-xs">{label}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || label}
      className={className}
      onError={() => setFailed(true)}
      {...imageProps}
    />
  );
}