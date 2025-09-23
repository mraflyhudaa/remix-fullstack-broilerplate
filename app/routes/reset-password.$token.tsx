import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { consumePasswordResetToken, updateUserPassword, verifyPasswordResetToken } from "~/lib/password-reset.server";
import { getOrCreateCsrfToken, verifyCsrfToken } from "~/lib/csrf.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { token } = params;
  if (!token) throw redirect("/");
  const rec = await verifyPasswordResetToken(token);
  if (!rec) return Response.json({ valid: false });
  const { token: csrfToken, setCookie } = await getOrCreateCsrfToken(request);
  return Response.json(
    { valid: true, csrfToken },
    { headers: setCookie ? { "Set-Cookie": setCookie } : undefined }
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const form = await request.formData();
  const password = String(form.get("password") || "");
  const csrf = String(form.get("_csrf") || "");
  if (!(await verifyCsrfToken(request, csrf))) return Response.json({ error: "Invalid CSRF" }, { status: 400 });
  const token = params.token ?? "";
  const rec = await verifyPasswordResetToken(token);
  if (!rec) return Response.json({ error: "Invalid or expired token" }, { status: 400 });
  if (password.length < 8) return Response.json({ error: "Password too short" }, { status: 400 });
  await updateUserPassword(rec.userId, password);
  await consumePasswordResetToken(token);
  return redirect("/login");
}

export default function ResetPasswordRoute() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  if (!data.valid) return <p className="m-6">Link invalid or expired.</p>;
  return (
    <div className="mx-auto mt-24 max-w-sm">
      <h1 className="mb-6 text-xl font-semibold">Set a new password</h1>
      {actionData?.error ? (
        <p className="mb-3 text-sm text-red-600">{actionData.error}</p>
      ) : null}
      <Form method="post" className="flex flex-col gap-3">
        <input type="hidden" name="_csrf" value={data.csrfToken} />
        <input className="w-full rounded-md border px-3 py-2" name="password" type="password" placeholder="New password" required />
        <button className="rounded-md bg-black px-3 py-2 text-white dark:bg-white dark:text-black" type="submit">Update password</button>
      </Form>
    </div>
  );
}


