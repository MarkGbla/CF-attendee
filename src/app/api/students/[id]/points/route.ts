import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, manualPointsLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const body = await request.json();
    const { points, reason } = body;

    if (typeof points !== "number" || points === 0) {
      return NextResponse.json(
        { error: "Points must be a non-zero number" },
        { status: 400 }
      );
    }

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(students)
      .set({
        manualPoints: sql`${students.manualPoints} + ${points}`,
      })
      .where(eq(students.id, studentId))
      .returning({ manualPoints: students.manualPoints });

    await db.insert(manualPointsLog).values({
      studentId,
      points,
      reason: reason || null,
    });

    return NextResponse.json({
      studentId,
      manualPoints: updated.manualPoints,
      pointsAdded: points,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to add points" },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const [student] = await db
      .select({ manualPoints: students.manualPoints })
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ manualPoints: student.manualPoints });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}
