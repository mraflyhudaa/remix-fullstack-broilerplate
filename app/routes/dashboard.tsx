import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { prisma } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return json({ user });
}

export default function DashboardRoute() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto mt-16 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Form method="post" action="/logout">
          <button className="rounded-md border px-3 py-1.5" type="submit">Logout</button>
        </Form>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Signed in as {user?.email}</p>
    </div>
  );
}


