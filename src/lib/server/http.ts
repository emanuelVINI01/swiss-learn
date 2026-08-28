import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { auth } from "@/auth";
import { DomainError } from "./errors";

export async function requireAuth<Req extends Request>(
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

// The one place a use-case's thrown error becomes an HTTP response. Every
// route handler that calls into lib/server/quiz.ts wraps its use-case call
// in try/catch and funnels the catch through this, instead of each route
// inventing its own status-code guess from err.message.
export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof DomainError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  // Unexpected (non-domain) failure: never leak err.message to the client —
  // it may contain internal detail (a raw DB/driver error, a stack-adjacent
  // string) that was never meant to cross the API boundary.
  console.error(err);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
