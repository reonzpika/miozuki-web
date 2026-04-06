const STAR_PATH =
  'M10 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8z';

function Star({
  fill,
  size,
}: {
  fill: 'full' | 'half' | 'empty';
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Empty background */}
      <path d={STAR_PATH} fill="#D9D3C7" />
      {/* Filled foreground */}
      {fill !== 'empty' && (
        <path
          d={STAR_PATH}
          fill="#7B1E22"
          style={fill === 'half' ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
        />
      )}
    </svg>
  );
}

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
}

export default function StarRating({
  rating,
  size = 16,
  className = '',
}: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const pos = i + 1;
    if (rating >= pos) return 'full' as const;
    if (rating >= pos - 0.5) return 'half' as const;
    return 'empty' as const;
  });

  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {stars.map((fill, i) => (
        <Star key={i} fill={fill} size={size} />
      ))}
    </div>
  );
}
