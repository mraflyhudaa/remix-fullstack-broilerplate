import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { createUserSession, registerUser, verifyLogin } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect("/login");
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase();
  const name = String(formData.get("name") || "");
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirectTo") || "/dashboard");

  if (!email || !password) {
    return json({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    await registerUser(email, password, name || undefined);
  } catch (e) {
    return json({ error: (e as Error).message }, { status: 400 });
  }

  const user = await verifyLogin(email, password);
  if (!user) return json({ error: "Registration failed" }, { status: 400 });
  return createUserSession({ request, userId: user.id, remember: true, redirectTo });
}

export default function RegisterRoute() {
  const actionData = useActionData<typeof action>();
  return (
    <div className="mx-auto mt-24 max-w-sm">
      <h1 className="mb-6 text-xl font-semibold">Register</h1>
      {actionData?.error ? (
        <p className="mb-3 text-sm text-red-600">{actionData.error}</p>
      ) : null}
      <Form method="post" className="flex flex-col gap-3">
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
    </div>
  );
}


