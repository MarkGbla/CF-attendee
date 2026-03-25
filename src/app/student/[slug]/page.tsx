import { db } from "@/lib/db";
import {
  students,
  attendance,
  challenges,
  studentChallengeProgress,
} from "@/lib/db/schema";
import { eq, asc, max, and, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import StudentMapClient from "./client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.slug, slug))
    .limit(1);

  if (!student) {
    return { title: "Student Not Found" };
  }

  return {
    title: `${student.name} - Attendance Map`,
    description: `View ${student.name}'s attendance progress`,
  };
}

export default async function StudentPage({ params }: Props) {
  const { slug } = await params;

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.slug, slug))
    .limit(1);

  if (!student) {
    notFound();
  }

  const records = await db
    .select()
    .from(attendance)
    .where(eq(attendance.studentId, student.id))
    .orderBy(asc(attendance.sessionNumber));

  const [maxResult] = await db
    .select({ maxSession: max(attendance.sessionNumber) })
    .from(attendance);

  const totalSessions = Math.max(maxResult?.maxSession ?? 0, records.length, 1);

  const recordMap = new Map(records.map((r) => [r.sessionNumber, r.status]));
  const sessions = Array.from({ length: totalSessions }, (_, i) => {
    const sessionNumber = i + 1;
    const status = recordMap.get(sessionNumber) ?? "locked";
    return { sessionNumber, status: status as "present" | "absent" | "locked" };
  });

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

  const progressMap = new Map(progress.map((p) => [p.challengeId, p]));

  // Calculate streaks
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
    challenge: {
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type,
      status: c.status,
      pointsReward: c.pointsReward,
      badgeEmoji: c.badgeEmoji,
      badgeName: c.badgeName,
      anchorSession: c.anchorSession,
      streakRequired: c.streakRequired,
      createdAt: c.createdAt.toISOString(),
    },
    progress: progressMap.get(c.id)
      ? {
          id: progressMap.get(c.id)!.id,
          studentId: progressMap.get(c.id)!.studentId,
          challengeId: progressMap.get(c.id)!.challengeId,
          completed: progressMap.get(c.id)!.completed,
          pointsEarned: progressMap.get(c.id)!.pointsEarned,
          badgeEarned: progressMap.get(c.id)!.badgeEarned,
          completedAt: progressMap.get(c.id)!.completedAt?.toISOString() ?? null,
        }
      : null,
    anchorSession: c.anchorSession,
  }));

  // Compute stats
  const challengePoints = progress.reduce((sum, p) => sum + p.pointsEarned, 0);
  const totalPoints = challengePoints + (student.manualPoints ?? 0);
  const badges: { emoji: string; name: string }[] = [];
  for (const p of progress) {
    if (p.badgeEarned && p.completed) {
      const c = activeChallenges.find((ch) => ch.id === p.challengeId);
      if (c?.badgeEmoji && c?.badgeName) {
        badges.push({ emoji: c.badgeEmoji, name: c.badgeName });
      }
    }
  }

  return (
    <StudentMapClient
      studentName={student.name}
      studentSlug={slug}
      sessions={sessions}
      sideQuests={sideQuests}
      stats={{ totalPoints, badgeCount: badges.length, badges }}
      currentStreak={currentStreak}
    />
  );
}
