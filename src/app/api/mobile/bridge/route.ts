import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";

// Only these schemes may receive a live session token in a redirect —
// anything else and this route becomes an open-redirect token leak.
const ALLOWED_REDIRECT_SCHEMES = ["swisslearn://", "exp://"];

function isAllowedRedirect(url: string): boolean {
  return ALLOWED_REDIRECT_SCHEMES.some((scheme) => url.startsWith(scheme));
}

// Hands the mobile app's in-app-browser sign-in flow the same session cookie
// Auth.js just set on this very request/response chain, via a deep-link
// redirect. The mobile app replays {cookieName}={token} as a manual Cookie
// header on every future API call — every existing route (requireAuth/auth())
// keeps working completely unmodified, since it just reads whatever Cookie
// header is on the incoming request.
export async function GET(request: NextRequest) {
  const appRedirect = request.nextUrl.searchParams.get("app_redirect");
  if (!appRedirect || !isAllowedRedirect(appRedirect)) {
    return NextResponse.json({ error: "Invalid or missing app_redirect" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    // Shouldn't normally happen — this route is only ever reached as the
    // callbackUrl after a successful sign-in — but handle it defensively.
    const signinUrl = new URL("/en/signin", request.url);
    signinUrl.searchParams.set(
      "callbackUrl",
      `/api/mobile/bridge?app_redirect=${encodeURIComponent(appRedirect)}`
    );
    return NextResponse.redirect(signinUrl);
  }

  // Never hardcode the `__Secure-` prefix — Auth.js chooses the cookie name
  // based on deployment (https vs not), so just find whatever's there.
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.getAll().find((c) => c.name.endsWith("session-token"));
  if (!sessionCookie) {
    return NextResponse.json({ error: "No session cookie found" }, { status: 500 });
  }

  const redirectUrl = new URL(appRedirect);
  redirectUrl.searchParams.set("token", sessionCookie.value);
  redirectUrl.searchParams.set("cookieName", sessionCookie.name);
  return NextResponse.redirect(redirectUrl);
}
