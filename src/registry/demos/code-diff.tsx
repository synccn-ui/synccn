"use client";

import { CodeDiff } from "@/registry/ui/code-diff";

const before = `export function Button({ children }) {
  return (
    <button className="btn">
      {children}
    </button>
  );
}`;

const after = `export function Button({ children, loading }) {
  return (
    <button className="btn" disabled={loading}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}`;

export default function CodeDiffDemo() {
  return <CodeDiff className="max-w-2xl" filename="components/ui/button.jsx" before={before} after={after} />;
}
