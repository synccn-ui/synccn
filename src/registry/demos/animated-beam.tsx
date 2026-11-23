"use client";

import type * as React from "react";
import { useRef } from "react";
import { Database, FileText, Globe, Mail, MessageSquare, Zap } from "lucide-react";
import { AnimatedBeam } from "@/registry/ui/animated-beam";

const Node = ({ innerRef, icon: Icon, big }: { innerRef: React.RefObject<HTMLDivElement | null>; icon: React.ElementType; big?: boolean }) => (
  <span ref={innerRef} className={`relative z-10 grid place-items-center rounded-full border bg-background shadow-md ${big ? "size-16" : "size-12"}`}>
    <Icon className={big ? "size-7" : "size-5"} />
  </span>
);

export default function AnimatedBeamDemo() {
  const box = useRef(null);
  const ins = [useRef(null), useRef(null), useRef(null)];
  const hub = useRef(null);
  const outs = [useRef(null), useRef(null)];
  return (
    <div ref={box} className="relative flex h-72 w-full max-w-lg items-center justify-between px-6">
      <div className="flex flex-col gap-8">
        <Node innerRef={ins[0]} icon={Mail} />
        <Node innerRef={ins[1]} icon={MessageSquare} />
        <Node innerRef={ins[2]} icon={FileText} />
      </div>
      <Node innerRef={hub} icon={Zap} big />
      <div className="flex flex-col gap-16">
        <Node innerRef={outs[0]} icon={Database} />
        <Node innerRef={outs[1]} icon={Globe} />
      </div>
      {ins.map((r, i) => (
        <AnimatedBeam key={i} containerRef={box} fromRef={r} toRef={hub} curvature={(1 - i) * 40} delay={i * 0.4} />
      ))}
      {outs.map((r, i) => (
        <AnimatedBeam key={`o${i}`} containerRef={box} fromRef={hub} toRef={r} curvature={i ? -30 : 30} delay={1 + i * 0.4} />
      ))}
    </div>
  );
}
