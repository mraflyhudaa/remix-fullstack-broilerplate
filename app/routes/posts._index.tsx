import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Button } from "~/components/ui/button";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const posts = await prisma.post.findMany({ where: { authorId: userId }, orderBy: { createdAt: "desc" } });
  return Response.json({ posts });
}

export default function PostsIndexRoute() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your posts</h1>
        <Button asChild>
          <Link to="/posts/new">New post</Link>
        </Button>
      </div>
      <ul className="divide-y">
        {posts.map((p: any) => (
          <li key={p.id} className="py-3">
            <Link className="text-blue-600 underline" to={`/posts/${p.id}`}>{p.title}</Link>
            <span className="ml-2 text-xs uppercase text-muted-foreground">{p.published ? "published" : "draft"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


