import { createCookie } from "@remix-run/node";
import { randomBytes, timingSafeEqual } from "node:crypto";

const secret = process.env.SESSION_SECRET;
if (!secret) throw new Error("SESSION_SECRET missing for CSRF");

export const csrfCookie = createCookie("__csrf", {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  secrets: [secret],
});

export async function getOrCreateCsrfToken(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const existing = (await csrfCookie.parse(cookieHeader)) as string | undefined;
  if (existing) return { token: existing, setCookie: null as string | null };
  const token = randomBytes(32).toString("hex");
  const setCookie = await csrfCookie.serialize(token);
  return { token, setCookie };
}

export async function verifyCsrfToken(request: Request, formToken: string | null) {
  const cookieHeader = request.headers.get("Cookie");
  const cookieToken = (await csrfCookie.parse(cookieHeader)) as string | undefined;
  if (!cookieToken || !formToken) return false;
  const a = Buffer.from(cookieToken, "utf8");
  const b = Buffer.from(formToken, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}


