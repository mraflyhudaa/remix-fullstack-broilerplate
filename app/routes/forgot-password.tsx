import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import { Form as UiForm, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const { toast } = useToast();

  React.useEffect(() => {
    if (actionData?.error) {
      toast({ variant: "destructive", description: actionData.error });
    } else if (actionData?.ok) {
      toast({ description: "If that email exists, a reset link was sent." });
    }
  }, [actionData, toast]);

  const schema = z.object({ email: z.string().email() });
  type Schema = z.infer<typeof schema>;
  const rhf = useForm<Schema>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  const formRef = React.useRef<HTMLFormElement>(null);
  const onValid = () => formRef.current?.submit();
  return (
    <div className="mx-auto mt-24 max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
        </CardHeader>
        <CardContent>
          {actionData?.error ? (
            <p className="mb-3 text-sm text-red-600">{actionData.error}</p>
          ) : actionData?.ok ? (
            <p className="mb-3 text-sm text-green-600">If that email exists, a reset link was sent.</p>
          ) : null}
          <UiForm {...rhf}>
            <Form method="post" className="flex flex-col gap-3" ref={formRef} onSubmit={(e)=>{e.preventDefault(); rhf.handleSubmit(onValid)();}}>
              <CsrfInput />
              <FormField control={rhf.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} name="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit">Send reset link</Button>
            </Form>
          </UiForm>
        </CardContent>
      </Card>
    </div>
  );
}

import { useLoaderData } from "@remix-run/react";
function CsrfInput() {
  const { csrfToken } = useLoaderData<typeof loader>();
  return <input type="hidden" name="_csrf" value={csrfToken} />;
}


