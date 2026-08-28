import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/http";
import { getRanking, isRankingPeriod } from "@/lib/server/ranking";

export async function GET(request: NextRequest) {
  const authed = await requireAuth();
  if (authed instanceof NextResponse) return authed;

  const period = request.nextUrl.searchParams.get("period") ?? "week";
  if (!isRankingPeriod(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const ranking = await getRanking(period);
  return NextResponse.json({ ranking });
}
