import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  students,
  studentChallengeProgress,
  challenges,
} from "@/lib/db/schema";
import { eq, and, sum, sql } from "drizzle-orm";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.slug, slug))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const progress = await db
      .select()
      .from(studentChallengeProgress)
      .where(eq(studentChallengeProgress.studentId, student.id));

    const challengePoints = progress.reduce((sum, p) => sum + p.pointsEarned, 0);
    const totalPoints = challengePoints + (student.manualPoints ?? 0);
    const badges = progress
      .filter((p) => p.badgeEarned && p.completed)
      .map((p) => p.challengeId);

    // Get badge details
    const badgeDetails: { emoji: string; name: string }[] = [];
    for (const challengeId of badges) {
      const [c] = await db
        .select({ badgeEmoji: challenges.badgeEmoji, badgeName: challenges.badgeName })
        .from(challenges)
        .where(eq(challenges.id, challengeId))
        .limit(1);
      if (c && c.badgeEmoji && c.badgeName) {
        badgeDetails.push({ emoji: c.badgeEmoji, name: c.badgeName });
      }
    }

    return NextResponse.json({
      totalPoints,
      badgeCount: badgeDetails.length,
      badges: badgeDetails,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
