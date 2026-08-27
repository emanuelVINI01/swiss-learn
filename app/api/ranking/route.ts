import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRanking, isRankingPeriod } from "@/lib/server/ranking";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = request.nextUrl.searchParams.get("period") ?? "week";
  if (!isRankingPeriod(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const ranking = await getRanking(period);
  return NextResponse.json({ ranking });
}
