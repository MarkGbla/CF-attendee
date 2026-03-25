import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, challenges, taskSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface Params {
  params: Promise<{ slug: string; challengeId: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { slug, challengeId } = await params;
    const cid = parseInt(challengeId, 10);
    const body = await request.json();
    const { submissionText } = body;

    if (!submissionText || typeof submissionText !== "string" || !submissionText.trim()) {
      return NextResponse.json(
        { error: "submissionText is required" },
        { status: 400 }
      );
    }

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.slug, slug))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, cid))
      .limit(1);

    if (!challenge || challenge.type !== "task") {
      return NextResponse.json(
        { error: "Task challenge not found" },
        { status: 404 }
      );
    }

    const [submission] = await db
      .insert(taskSubmissions)
      .values({
        studentId: student.id,
        challengeId: cid,
        submissionText: submissionText.trim(),
      })
      .returning();

    return NextResponse.json(submission, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit task" },
      { status: 500 }
    );
  }
}
