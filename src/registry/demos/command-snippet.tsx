import { CommandSnippet } from "@/registry/ui/command-snippet";

export default function CommandSnippetDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <CommandSnippet command="npx shadcn@latest add @synccn/command-snippet" storageKey="demo-pm" />
      <CommandSnippet command="npm install -D tailwindcss @tailwindcss/vite" storageKey="demo-pm" />
      <p className="text-center text-[13px] text-muted-foreground">Both snippets switch together, and the choice is remembered.</p>
    </div>
  );
}
