import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { createUserSession, registerUser, verifyLogin } from "~/lib/auth.server";
import { getOrCreateCsrfToken, verifyCsrfToken } from "~/lib/csrf.server";
import { rateLimit } from "~/lib/rate-limit.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { token, setCookie } = await getOrCreateCsrfToken(request);
  return Response.json(
    { csrfToken: token },
    { headers: setCookie ? { "Set-Cookie": setCookie } : undefined }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip") || "local";
  const rl = rateLimit(`register:${ip}`);
  if (!rl.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase();
  const name = String(formData.get("name") || "");
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirectTo") || "/dashboard");
  const csrf = String(formData.get("_csrf") || "");

  if (!(await verifyCsrfToken(request, csrf))) {
    return Response.json({ error: "Invalid CSRF" }, { status: 400 });
  }

  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    await registerUser(email, password, name || undefined);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }

  const user = await verifyLogin(email, password);
  if (!user) return Response.json({ error: "Registration failed" }, { status: 400 });
  return createUserSession({ request, userId: user.id, remember: true, redirectTo });
}

export default function RegisterRoute() {
  const actionData = useActionData<typeof action>();
  const { csrfToken } = useLoaderData<typeof loader>();
  return (
    <div className="mx-auto mt-24 max-w-sm">
      <h1 className="mb-6 text-xl font-semibold">Register</h1>
      {actionData?.error ? (
        <p className="mb-3 text-sm text-red-600">{actionData.error}</p>
      ) : null}
      <Form method="post" className="flex flex-col gap-3">
        <input type="hidden" name="_csrf" value={csrfToken} />
        <input
          className="w-full rounded-md border px-3 py-2"
          name="name"
          type="text"
          placeholder="Name (optional)"
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          name="email"
          type="email"
          placeholder="Email"
          required
        />
        <input
          className="w-full rounded-md border px-3 py-2"
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <button className="rounded-md bg-black px-3 py-2 text-white dark:bg-white dark:text-black" type="submit">
          Create account
        </button>
      </Form>
      <p className="mt-3 text-sm">
        Already have an account? <a href="/login" className="underline">Login</a>
      </p>
    </div>
  );
}


