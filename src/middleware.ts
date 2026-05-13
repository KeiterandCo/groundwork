import { defineMiddleware } from "astro:middleware";

const protectedPrefixes = ["/dashboard", "/log", "/analysis", "/review"];

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const needsAuth = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!needsAuth) {
    return next();
  }

  const token = context.cookies.get("sb-access-token")?.value;
  if (!token) {
    return context.redirect("/login");
  }

  return next();
});
