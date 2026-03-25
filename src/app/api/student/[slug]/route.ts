import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { students, attendance } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.slug, slug))
      .limit(1);

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const records = await db
      .select()
      .from(attendance)
      .where(eq(attendance.studentId, student.id))
      .orderBy(asc(attendance.sessionNumber));

    return NextResponse.json({
      student,
      attendance: records,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch student data" },
      { status: 500 }
    );
  }
}
