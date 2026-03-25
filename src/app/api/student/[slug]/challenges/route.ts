import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  students,
  challenges,
  studentChallengeProgress,
  attendance,
} from "@/lib/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";

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

    // Fetch active challenges
    const activeChallenges = await db
      .select()
      .from(challenges)
      .where(eq(challenges.status, "active"))
      .orderBy(asc(challenges.anchorSession));

    // Fetch student progress
    const progress = await db
      .select()
      .from(studentChallengeProgress)
      .where(eq(studentChallengeProgress.studentId, student.id));

    const progressMap = new Map(
      progress.map((p) => [p.challengeId, p])
    );

    // Auto-detect streaks
    const records = await db
      .select()
      .from(attendance)
      .where(eq(attendance.studentId, student.id))
      .orderBy(asc(attendance.sessionNumber));

    // Calculate max consecutive present streak
    let maxStreak = 0;
    let currentStreak = 0;
    for (const record of records) {
      if (record.status === "present") {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // Auto-complete streak challenges
    for (const challenge of activeChallenges) {
      if (
        challenge.type === "streak" &&
        challenge.streakRequired &&
        maxStreak >= challenge.streakRequired &&
        !progressMap.get(challenge.id)?.completed
      ) {
        const [upserted] = await db
          .insert(studentChallengeProgress)
          .values({
            studentId: student.id,
            challengeId: challenge.id,
            completed: true,
            pointsEarned: challenge.pointsReward,
            badgeEarned: !!challenge.badgeName,
            completedAt: sql`now()`,
          })
          .onConflictDoUpdate({
            target: [
              studentChallengeProgress.studentId,
              studentChallengeProgress.challengeId,
            ],
            set: {
              completed: sql`true`,
              pointsEarned: sql`${challenge.pointsReward}`,
              badgeEarned: sql`${!!challenge.badgeName}`,
              completedAt: sql`now()`,
            },
          })
          .returning();

        if (upserted) {
          progressMap.set(challenge.id, upserted);
        }
      }
    }

    const sideQuests = activeChallenges.map((c) => ({
      challenge: c,
      progress: progressMap.get(c.id) || null,
      anchorSession: c.anchorSession,
    }));

    return NextResponse.json({
      sideQuests,
      currentStreak,
      maxStreak,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}
