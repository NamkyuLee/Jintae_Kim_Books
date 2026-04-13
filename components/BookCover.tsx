type BookCoverProps = {
  title: string;
  author: string;
  coverImageUrl?: string | null;
  className?: string;
};

const COVER_COLORS = [
  { bg: "#1a1a2e", accent: "#e94560", text: "#eaeaea" },
  { bg: "#2d4739", accent: "#f5c518", text: "#f0f0e8" },
  { bg: "#2c1810", accent: "#d4a853", text: "#f5ede0" },
];

function hashColor(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
}

export default function BookCover({ title, author, coverImageUrl, className = "" }: BookCoverProps) {
  if (coverImageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={coverImageUrl} alt={title} className={`object-cover ${className}`} />;
  }

  const color = hashColor(title);
  const shortTitle = title.length > 18 ? title.slice(0, 18) + "…" : title;

  return (
    <svg
      viewBox="0 0 200 280"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`${title} 표지`}
    >
      {/* 배경 */}
      <rect width="200" height="280" fill={color.bg} rx="4" />

      {/* 좌측 세로선 장식 */}
      <rect x="14" y="0" width="4" height="280" fill={color.accent} opacity="0.7" />

      {/* 상단 장식 선 */}
      <line x1="24" y1="30" x2="186" y2="30" stroke={color.accent} strokeWidth="1" opacity="0.5" />
      <line x1="24" y1="34" x2="186" y2="34" stroke={color.accent} strokeWidth="0.5" opacity="0.3" />

      {/* 타이틀 영역 배경 */}
      <rect x="24" y="60" width="152" height="100" fill={color.accent} opacity="0.1" rx="2" />

      {/* 제목 */}
      <text
        x="100"
        y="95"
        textAnchor="middle"
        fill={color.text}
        fontSize="15"
        fontWeight="bold"
        fontFamily="serif"
        letterSpacing="1"
      >
        {shortTitle.length > 10 ? shortTitle.slice(0, 10) : shortTitle}
      </text>
      {shortTitle.length > 10 && (
        <text
          x="100"
          y="118"
          textAnchor="middle"
          fill={color.text}
          fontSize="15"
          fontWeight="bold"
          fontFamily="serif"
          letterSpacing="1"
        >
          {shortTitle.slice(10)}
        </text>
      )}

      {/* 장식 원 */}
      <circle cx="100" cy="185" r="28" fill="none" stroke={color.accent} strokeWidth="1.5" opacity="0.6" />
      <circle cx="100" cy="185" r="20" fill={color.accent} opacity="0.15" />

      {/* 하단 구분선 */}
      <line x1="24" y1="240" x2="186" y2="240" stroke={color.accent} strokeWidth="0.8" opacity="0.5" />

      {/* 저자명 */}
      <text
        x="100"
        y="258"
        textAnchor="middle"
        fill={color.text}
        fontSize="11"
        fontFamily="sans-serif"
        opacity="0.85"
      >
        {author}
      </text>
    </svg>
  );
}
