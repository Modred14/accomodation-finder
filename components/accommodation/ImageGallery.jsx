// components/accommodation/ImageGallery.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

export default function ImageGallery({ images, title }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const photos = images?.length ? images : [];

  function show(i) {
    setIndex(i);
    setOpen(true);
  }

  function next(e) {
    e?.stopPropagation();
    setIndex((i) => (i + 1) % photos.length);
  }
  function prev(e) {
    e?.stopPropagation();
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }

  if (!photos.length) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-surface-2 text-sm text-muted">
        No photos uploaded yet
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl sm:h-[420px]">
        <button
          onClick={() => show(0)}
          className="relative col-span-4 row-span-2 aspect-[16/10] overflow-hidden sm:col-span-2 sm:row-span-2 sm:aspect-auto"
        >
          <Image src={photos[0].url} alt={title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" priority />
        </button>
        {photos.slice(1, 5).map((img, i) => (
          <button key={img.id} onClick={() => show(i + 1)} className="relative hidden aspect-square overflow-hidden sm:block">
            <Image src={img.url} alt={title} fill sizes="25vw" className="object-cover" />
            {i === 3 && photos.length > 5 && (
              <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-ink/50 text-sm font-medium text-white">
                <Images className="h-4 w-4" /> +{photos.length - 5} more
              </span>
            )}
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-ink">
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-white/80">
              {index + 1} / {photos.length}
            </span>
            <button onClick={() => setOpen(false)} aria-label="Close gallery" className="rounded-full p-2 text-white hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={photos[index].url} alt={title} fill sizes="100vw" className="object-contain" />
            {photos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Previous photo"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next photo"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
