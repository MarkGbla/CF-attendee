"use server";

import { db } from "@/lib/db";
import {
  attendance,
  challenges,
  studentChallengeProgress,
  students,
} from "@/lib/db/schema";
import { eq, asc, sql } from "drizzle-orm";

export async function completeStreakChallenges(studentSlug: string) {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.slug, studentSlug))
    .limit(1);

  if (!student) return;

  // Calculate max streak
  const records = await db
    .select()
    .from(attendance)
    .where(eq(attendance.studentId, student.id))
    .orderBy(asc(attendance.sessionNumber));

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

  // Find active streak challenges
  const activeChallenges = await db
    .select()
    .from(challenges)
    .where(eq(challenges.status, "active"));

  const progress = await db
    .select()
    .from(studentChallengeProgress)
    .where(eq(studentChallengeProgress.studentId, student.id));

  const progressMap = new Map(progress.map((p) => [p.challengeId, p]));

  for (const challenge of activeChallenges) {
    if (
      challenge.type === "streak" &&
      challenge.streakRequired &&
      maxStreak >= challenge.streakRequired &&
      !progressMap.get(challenge.id)?.completed
    ) {
      await db
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
        });
    }
  }
}
