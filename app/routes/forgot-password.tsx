import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { prisma } from "~/lib/db.server";
import { createPasswordResetToken } from "~/lib/password-reset.server";
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
  const rl = rateLimit(`forgot:${ip}`);
  if (!rl.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase();
  const csrf = String(formData.get("_csrf") || "");
  if (!(await verifyCsrfToken(request, csrf))) return Response.json({ error: "Invalid CSRF" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const raw = await createPasswordResetToken(user.id);
    // TODO: send email. For dev, log the reset url.
    console.log(`Reset link: /reset-password/${raw}`);
  }
  return Response.json({ ok: true });
}

export default function ForgotPasswordRoute() {
  const actionData = useActionData<typeof action>();
  return (
    <div className="mx-auto mt-24 max-w-sm">
      <h1 className="mb-6 text-xl font-semibold">Forgot password</h1>
      {actionData?.error ? (
        <p className="mb-3 text-sm text-red-600">{actionData.error}</p>
      ) : actionData?.ok ? (
        <p className="mb-3 text-sm text-green-600">If that email exists, a reset link was sent.</p>
      ) : null}
      <Form method="post" className="flex flex-col gap-3">
        <CsrfInput />
        <input className="w-full rounded-md border px-3 py-2" name="email" type="email" placeholder="Email" required />
        <button className="rounded-md bg-black px-3 py-2 text-white dark:bg-white dark:text-black" type="submit">Send reset link</button>
      </Form>
    </div>
  );
}

import { useLoaderData } from "@remix-run/react";
function CsrfInput() {
  const { csrfToken } = useLoaderData<typeof loader>();
  return <input type="hidden" name="_csrf" value={csrfToken} />;
}


