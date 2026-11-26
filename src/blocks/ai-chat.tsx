"use client";

import { useEffect, useRef, useState } from "react";
import { Bug, Code2, FileText, Lightbulb, SquarePen, Zap, Brain, Eye } from "lucide-react";
import { AIMessage } from "@/registry/ui/ai-message";
import { ContextMeter } from "@/registry/ui/context-meter";
import { Conversation } from "@/registry/ui/conversation";
import { ModelSelector, type AIModel } from "@/registry/ui/model-selector";
import { PromptInput } from "@/registry/ui/prompt-input";
import { PromptSuggestions } from "@/registry/ui/prompt-suggestions";
import { Reasoning } from "@/registry/ui/reasoning";
import { Sources, type Source } from "@/registry/ui/sources";
import { StreamingText } from "@/registry/ui/streaming-text";
import { ToolCall, type ToolCallStatus } from "@/registry/ui/tool-call";

const MODELS: AIModel[] = [
  { id: "fast", name: "Fast", description: "Quick everyday answers", badges: ["Fast"], context: 128_000, icon: Zap },
  { id: "smart", name: "Smart", description: "Writing, analysis and code", badges: ["Vision"], context: 200_000, icon: Eye },
  { id: "deep", name: "Deep Think", description: "Reasons before answering", badges: ["Reasoning"], context: 200_000, icon: Brain },
];

const SOURCES: Source[] = [
  { title: "Caching and revalidating", url: "https://nextjs.org/docs/app/building-your-application/caching", snippet: "Data can be cached per request or across requests and deployments." },
  { title: "HTTP caching", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching", snippet: "stale-while-revalidate lets a cache serve stale content while it fetches a fresh copy." },
];

interface Turn {
  id: number;
  prompt: string;
  model: string;
  versions: string[];
  version: number;
  phase: "thinking" | "tool" | "writing" | "done" | "stopped";
  tool: ToolCallStatus;
}

const answerFor = (prompt: string, v: number) => {
  const topic = prompt.replace(/[?.!]+$/, "").toLowerCase();
  const base = [
    `Here's a practical way to approach **${topic}**.\n\n- Start with the smallest version that works end to end\n- Measure before optimizing: \`console.time\` or the Performance panel is enough at first\n- Cache at the edge with \`stale-while-revalidate\` so repeat visits are instant\n\nIf you share the code you have, I can point at the exact lines to change.`,
    `Short version: keep it simple, then cache.\n\n1. Build it the straightforward way first\n2. Add \`Cache-Control: s-maxage=60, stale-while-revalidate=300\` to responses that don't change per user\n3. Revisit only the pages that are still slow\n\nThat usually gets **${topic}** most of the way there.`,
  ];
  return base[v % base.length];
};

export default function AiChatBlock() {
  const [model, setModel] = useState("deep");
  const [turns, setTurns] = useState<Turn[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const busy = turns.some((t) => t.phase !== "done" && t.phase !== "stopped");

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
  const patch = (id: number, p: Partial<Turn>) => setTurns((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)));

  const run = (id: number, reasoning: boolean) => {
    const start = reasoning ? 2200 : 300;
    if (reasoning) patch(id, { phase: "thinking" });
    later(start, () => patch(id, { phase: "tool", tool: "running" }));
    later(start + 1300, () => patch(id, { phase: "writing", tool: "success" }));
  };

  const send = (prompt: string) => {
    if (!prompt.trim() || busy) return;
    const id = Date.now();
    const reasoning = model === "deep";
    setTurns((ts) => [...ts, { id, prompt: prompt.trim(), model, versions: [answerFor(prompt, 0)], version: 0, phase: reasoning ? "thinking" : "tool", tool: "pending" }]);
    run(id, reasoning);
  };

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTurns((ts) => ts.map((t) => (t.phase === "done" || t.phase === "stopped" ? t : { ...t, phase: "stopped", tool: t.tool === "running" ? "error" : t.tool })));
  };

  const regenerate = (t: Turn) => {
    patch(t.id, { versions: [...t.versions, answerFor(t.prompt, t.versions.length)], version: t.versions.length, phase: "writing" });
  };

  const used = 9_400 + turns.reduce((a, t) => a + 1_800 + t.versions.length * 900, 0);
  const limit = MODELS.find((m) => m.id === model)?.context ?? 200_000;
  const last = turns[turns.length - 1];

  return (
    <div className="flex h-[680px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border bg-background text-left">
      <header className="flex items-center gap-2 border-b px-3 py-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{turns[0] ? turns[0].prompt : "New chat"}</p>
        <ContextMeter side="bottom" used={used} limit={limit} breakdown={[{ label: "System prompt", value: 2_100 }, { label: "Messages", value: Math.max(0, used - 9_400) }, { label: "Files", value: 7_300 }]} />
        <button type="button" aria-label="New chat" disabled={busy || !turns.length} onClick={() => setTurns([])} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40">
          <SquarePen className="size-4" />
        </button>
      </header>

      <Conversation
        className="min-h-0 flex-1"
        empty={
          <div className="grid min-h-[440px] content-center justify-items-center gap-6 py-6 text-center">
            <div className="grid gap-1.5">
              <h3 className="text-xl font-semibold tracking-tight">What are we working on?</h3>
              <p className="text-sm text-muted-foreground">Pick a starting point or type your own question.</p>
            </div>
            <PromptSuggestions
              variant="cards"
              className="max-w-xl"
              onSelect={send}
              suggestions={[
                { label: "Speed up my Next.js app", description: "Caching, images and bundles", icon: Zap },
                { label: "Explain this error", prompt: "Explain hydration mismatch errors", description: "Hydration mismatch in React", icon: Bug },
                { label: "Write a migration plan", prompt: "Plan a migration from REST to tRPC", description: "From REST to tRPC", icon: FileText },
                { label: "Review an API design", prompt: "Review my API pagination design", description: "Pagination and errors", icon: Code2 },
              ]}
            />
          </div>
        }
      >
        {turns.flatMap((t) => [
          <AIMessage key={`${t.id}-q`} from="user">
            {t.prompt}
          </AIMessage>,
          <AIMessage
            key={`${t.id}-a`}
            from="assistant"
            model={MODELS.find((m) => m.id === t.model)?.name}
            streaming={t.phase !== "done" && t.phase !== "stopped"}
            copyText={t.versions[t.version]}
            onRegenerate={t === last ? () => regenerate(t) : undefined}
            onFeedback={() => {}}
            branch={{ index: t.version, total: t.versions.length, onChange: (i) => patch(t.id, { version: i, phase: "done" }) }}
          >
            {t.model === "deep" && (
              <Reasoning streaming={t.phase === "thinking"}>
                The question is about {t.prompt.toLowerCase().replace(/[?.!]+$/, "")}. Check the docs for current caching behaviour first, then give steps in order of impact and keep it short.
              </Reasoning>
            )}
            {t.phase !== "thinking" && (
              <ToolCall name="search_docs" description="Searched the documentation" status={t.tool} duration={1240} input={{ query: t.prompt, limit: 2 }} output={SOURCES.map((s) => s.url)} />
            )}
            {(t.phase === "writing" || t.phase === "done") && (
              <StreamingText key={`${t.id}-${t.version}`} text={t.versions[t.version]} animate={t.phase === "writing"} speed={140} onDone={() => patch(t.id, { phase: "done" })} />
            )}
            {t.phase === "stopped" && <p className="text-[13px] italic text-muted-foreground">Stopped before answering.</p>}
            {t.phase === "done" && <Sources sources={SOURCES} />}
          </AIMessage>,
        ])}
        {last?.phase === "done" && (
          <PromptSuggestions
            key="follow"
            className="pl-10"
            onSelect={send}
            suggestions={[
              { label: "Show me the code", icon: Code2 },
              { label: "What are the trade-offs?", icon: Lightbulb },
            ]}
          />
        )}
      </Conversation>

      <div className="border-t p-3">
        <PromptInput onSubmit={({ text }) => send(text)} onStop={stop} busy={busy} placeholder="Ask a follow-up…" toolbar={<ModelSelector models={MODELS} value={model} onValueChange={setModel} />} />
        <p className="mt-2 text-center text-[11px] text-muted-foreground">Answers are simulated in this demo.</p>
      </div>
    </div>
  );
}
