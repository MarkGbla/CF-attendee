"use client";

import ProgressMap from "@/components/student/ProgressMap";
import type { SideQuestNode } from "@/types";

interface Session {
  sessionNumber: number;
  status: "present" | "absent" | "locked";
}

interface Props {
  studentName: string;
  studentSlug: string;
  sessions: Session[];
  sideQuests: SideQuestNode[];
  stats: { totalPoints: number; badgeCount: number; badges: { emoji: string; name: string }[] };
  currentStreak: number;
}

export default function StudentMapClient({
  studentName,
  studentSlug,
  sessions,
  sideQuests,
  stats,
  currentStreak,
}: Props) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0A0A]">

      <ProgressMap
        sessions={sessions}
        studentName={studentName}
        studentSlug={studentSlug}
        sideQuests={sideQuests}
        stats={stats}
        currentStreak={currentStreak}
      />
    </div>
  );
}
