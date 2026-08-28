import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { auth } from "@/auth";

export async function useAuth<Req extends Request>(
  request: Req,
  handler: (authedRequest: Req & { userId: string }) => Promise<NextResponse> | NextResponse
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const authedRequest = Object.assign(request, { userId: session.user.id }) as Req & { userId: string };
  return handler(authedRequest);
}

export async function parseBody<Schema extends z.ZodTypeAny>(
  request: Request,
  schema: Schema
): Promise<z.infer<Schema> | NextResponse> {
  const body = await request.json().catch(() => null);
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  return result.data;
}
