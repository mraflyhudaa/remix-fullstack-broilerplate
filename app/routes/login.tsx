import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { createUserSession, getUserId, verifyLogin } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/dashboard");
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase();
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirectTo") || "/dashboard");
  const remember = formData.get("remember") === "on";

  if (!email || !password) {
    return json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await verifyLogin(email, password);
  if (!user) {
    return json({ error: "Invalid credentials" }, { status: 400 });
  }

  return createUserSession({ request, userId: user.id, remember, redirectTo });
}

export default function LoginRoute() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  return (
    <div className="mx-auto mt-24 max-w-sm">
      <h1 className="mb-6 text-xl font-semibold">Login</h1>
      {actionData?.error ? (
        <p className="mb-3 text-sm text-red-600">{actionData.error}</p>
      ) : null}
      <Form method="post" className="flex flex-col gap-3">
        <input type="hidden" name="redirectTo" value={redirectTo} />
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
        <label className="flex items-center gap-2 text-sm">
          <input name="remember" type="checkbox" /> Remember me
        </label>
        <button className="rounded-md bg-black px-3 py-2 text-white dark:bg-white dark:text-black" type="submit">
          Sign in
        </button>
      </Form>
      <p className="mt-3 text-sm">
        Don&apos;t have an account? <a href="/register" className="underline">Register</a>
      </p>
    </div>
  );
}


