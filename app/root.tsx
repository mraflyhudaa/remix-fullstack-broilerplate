import { captureRemixErrorBoundaryError, withSentry } from "@sentry/remix";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import "./tailwind.css";
import { Toaster } from "~/components/ui/toaster";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="flex items-center justify-between border-b px-4 py-2">
          <a href="/" className="font-semibold">Remix Boilerplate</a>
          <div className="flex items-center gap-3">
            <a className="text-sm underline" href="/dashboard">Dashboard</a>
            <a className="text-sm underline" href="/login">Login</a>
            <a className="text-sm underline" href="/register">Register</a>
          </div>
        </header>
        <main>{children}</main>
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function App() {
  return <Outlet />;
}

export default withSentry(App);

export function ErrorBoundary() {
  const error = useRouteError();captureRemixErrorBoundaryError(error);
  return (
    <div className="m-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please try again.</p>
    </div>
  );
}