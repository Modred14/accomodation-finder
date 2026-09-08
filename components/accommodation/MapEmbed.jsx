// components/accommodation/MapEmbed.jsx
export default function MapEmbed({ latitude, longitude, title }) {
  if (!latitude || !longitude) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl bg-surface-2 text-sm text-muted">
        Map location not available for this listing yet.
      </div>
    );
  }

  const delta = 0.006;
  const bbox = [
    Number(longitude) - delta,
    Number(latitude) - delta,
    Number(longitude) + delta,
    Number(latitude) + delta,
  ].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
  const viewHref = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <iframe
        title={`Map showing location of ${title}`}
        src={src}
        className="h-56 w-full sm:h-72"
        loading="lazy"
      />
      <a
        href={viewHref}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-surface px-3 py-2 text-center text-xs font-medium text-brand-700 hover:underline"
      >
        View larger map
      </a>
    </div>
  );
}
