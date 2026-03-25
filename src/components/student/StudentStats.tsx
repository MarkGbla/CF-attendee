"use client";

interface StudentStatsProps {
  totalPoints: number;
  badgeCount: number;
  badges: { emoji: string; name: string }[];
  currentStreak: number;
}

export default function StudentStats({
  totalPoints,
  badgeCount,
  badges,
  currentStreak,
}: StudentStatsProps) {
  if (totalPoints === 0 && badgeCount === 0 && currentStreak === 0) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-3">
      {totalPoints > 0 && (
        <div className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#333] px-3 py-1.5 rounded-full">
          <span className="text-sm">&#x1F4B0;</span>
          <span className="text-xs font-bold text-white">{totalPoints}</span>
        </div>
      )}
      {currentStreak > 0 && (
        <div className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#333] px-3 py-1.5 rounded-full">
          <span className="text-sm">&#x1F525;</span>
          <span className="text-xs font-bold text-white">{currentStreak}</span>
        </div>
      )}
      {badges.length > 0 && (
        <div className="flex items-center gap-1.5 bg-[#1A1A1A] border border-[#333] px-3 py-1.5 rounded-full">
          {badges.slice(0, 3).map((b, i) => (
            <span key={i} className="text-sm" title={b.name}>
              {b.emoji}
            </span>
          ))}
          {badges.length > 3 && (
            <span className="text-xs font-bold text-white">
              +{badges.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
