import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import { Form as UiForm, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSession, getUserId, verifyLogin } from "~/lib/auth.server";
import { getOrCreateCsrfToken, verifyCsrfToken } from "~/lib/csrf.server";
import { rateLimit } from "~/lib/rate-limit.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/dashboard");
  const { token, setCookie } = await getOrCreateCsrfToken(request);
  return Response.json(
    { csrfToken: token },
    { headers: setCookie ? { "Set-Cookie": setCookie } : undefined }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip") || "local";
  const rl = rateLimit(`login:${ip}`);
  if (!rl.allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  const formData = await request.formData();
  const email = String(formData.get("email") || "").toLowerCase();
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirectTo") || "/dashboard");
  const remember = formData.get("remember") === "on";
  const csrf = String(formData.get("_csrf") || "");

  if (!(await verifyCsrfToken(request, csrf))) {
    return Response.json({ error: "Invalid CSRF" }, { status: 400 });
  }

  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await verifyLogin(email, password);
  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 400 });
  }

  return createUserSession({ request, userId: user.id, remember, redirectTo });
}

export default function LoginRoute() {
  const actionData = useActionData<typeof action>();
  const { csrfToken } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const { toast } = useToast();

  React.useEffect(() => {
    if (actionData?.error) {
      toast({ variant: "destructive", description: actionData.error });
    }
  }, [actionData, toast]);

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
    remember: z.boolean().optional(),
  });
  type Schema = z.infer<typeof schema>;

  const rhf = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
    mode: "onBlur",
  });

  const formRef = React.useRef<HTMLFormElement>(null);
  const onValid = () => formRef.current?.submit();

  return (
    <div className="mx-auto mt-24 max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          {actionData?.error ? (
            <p className="mb-3 text-sm text-red-600">{actionData.error}</p>
          ) : null}
          <UiForm {...rhf}>
            <Form method="post" className="flex flex-col gap-3" ref={formRef} onSubmit={(e)=>{e.preventDefault(); rhf.handleSubmit(onValid)();}}>
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="_csrf" value={csrfToken} />
              <FormField control={rhf.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} name="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={rhf.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} name="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <label className="flex items-center gap-2 text-sm">
                <input name="remember" type="checkbox" onChange={(e)=>rhf.setValue("remember", e.target.checked)} /> Remember me
              </label>
              <Button type="submit">Sign in</Button>
            </Form>
          </UiForm>
          <p className="mt-3 text-sm">
            Forgot? <a className="underline" href="/forgot-password">Reset password</a>
          </p>
          <p className="mt-1 text-sm">
            Don&apos;t have an account? <a href="/register" className="underline">Register</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


