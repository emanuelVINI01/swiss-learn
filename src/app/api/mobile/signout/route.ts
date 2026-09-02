import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// True server-side revocation for a mobile sign-out, since the mobile app
// has no browser cookie jar for NextAuth's own signOut() to clear. Reads the
// same replayed Cookie header every other authed route does, then deletes
// that one Session row. Always succeeds (idempotent) so the client can
// unconditionally clear its local token afterward.
export async function POST() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.getAll().find((c) => c.name.endsWith("session-token"));

  if (sessionCookie) {
    await prisma.session.deleteMany({ where: { sessionToken: sessionCookie.value } }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
