import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendance } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionNumber, records } = body;

    if (!sessionNumber || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "sessionNumber and records array are required" },
        { status: 400 }
      );
    }

    const values = records.map(
      (r: { studentId: number; status: "present" | "absent" }) => ({
        studentId: r.studentId,
        sessionNumber: sessionNumber as number,
        status: r.status,
      })
    );

    await db
      .insert(attendance)
      .values(values)
      .onConflictDoUpdate({
        target: [attendance.studentId, attendance.sessionNumber],
        set: {
          status: sql`excluded.status`,
          date: sql`now()`,
        },
      });

    return NextResponse.json({ success: true, count: records.length });
  } catch {
    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    );
  }
}
