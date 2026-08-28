import { NextRequest, NextResponse } from "next/server";
import { useAuth } from "@/lib/server/http";
import { getRanking, isRankingPeriod } from "@/lib/server/ranking";

export async function GET(request: NextRequest) {
  return useAuth(request, async (authedRequest) => {
    const period = authedRequest.nextUrl.searchParams.get("period") ?? "week";
    if (!isRankingPeriod(period)) {
      return NextResponse.json({ error: "Invalid period" }, { status: 400 });
    }

    const ranking = await getRanking(period);
    return NextResponse.json({ ranking });
  });
}
