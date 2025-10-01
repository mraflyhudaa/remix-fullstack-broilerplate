import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { prisma } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  return Response.json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const title = String(form.get("title") || "");
  const content = String(form.get("content") || "");
  const published = form.get("published") === "on";
  if (!title) return Response.json({ error: "Title is required" }, { status: 400 });
  const post = await prisma.post.create({ data: { title, content, published, authorId: userId } });
  return redirect(`/posts/${post.id}`);
}

export default function NewPostRoute() {
  const actionData = useActionData<typeof action>();
  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold">New post</h1>
      {actionData?.error ? (
        <p className="mb-3 text-sm text-red-600">{actionData.error}</p>
      ) : null}
      <Form method="post" className="grid gap-3">
        <div className="grid gap-1">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="content">Content</Label>
          <textarea id="content" name="content" className="min-h-40 w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" /> Published
        </label>
        <div className="flex gap-2">
          <Button type="submit">Create</Button>
          <Button variant="outline" asChild>
            <Link to="/posts">Cancel</Link>
          </Button>
        </div>
      </Form>
    </div>
  );
}


