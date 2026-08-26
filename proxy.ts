import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const locales = ["en", "pt", "de"] as const;
export type Locale = (typeof locales)[number];
const defaultLocale: Locale = "en";

function getLocale(request: NextRequest): Locale {
  const acceptLang = request.headers.get("accept-language") ?? "";
  for (const locale of locales) {
    if (acceptLang.toLowerCase().includes(locale)) {
      return locale;
    }
  }
  return defaultLocale;
}

export const proxy = auth(async function proxy(request: any) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const session = request.auth;
  const isAppRoute = locales.some((locale) =>
    pathname.startsWith(`/${locale}/dashboard`) ||
    pathname.startsWith(`/${locale}/questions`)
  );

  if (isAppRoute && !session) {
    const locale = locales.find((l) => pathname.startsWith(`/${l}/`)) ?? defaultLocale;
    const signinUrl = new URL(`/${locale}/signin`, request.url);
    signinUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signinUrl);
  }
});

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
