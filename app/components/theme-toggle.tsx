import * as React from "react";

export function ThemeToggle() {
  const [dark, setDark] = React.useState<boolean>(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  );

  React.useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <button
      className="rounded-md border px-3 py-1.5 text-sm"
      onClick={() => setDark((d) => !d)}
      type="button"
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}


