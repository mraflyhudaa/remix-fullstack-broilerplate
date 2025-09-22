import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/lib/db.server";

export async function loader({}: LoaderFunctionArgs) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}


