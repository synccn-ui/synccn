"use client";

import type * as React from "react";
import { useState } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Checkbox } from "@/registry/ui/checkbox";
import { Input, Label } from "@/registry/ui/input";
import { Separator } from "@/registry/ui/kbd";
import { toast } from "@/registry/ui/toast";

export default function SignInBlock() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter your email as name@company.com.");
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Signed in", { description: `Welcome back, ${email}` });
    }, 1200);
  };

  return (
    <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border bg-card md:grid-cols-2">
      <form onSubmit={submit} noValidate className="grid gap-5 p-6 sm:p-10">
        <div className="grid gap-1.5">
          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="text-sm text-muted-foreground">Use your work email to continue.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={() => toast("Continue with Google")}>
            <svg viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8.1Z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1a6.4 6.4 0 0 1-6-4.4H2.3v2.8A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M6 14.2a6.6 6.6 0 0 1 0-4.4V7H2.3a11 11 0 0 0 0 10l3.7-2.8Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.3 7L6 9.8a6.4 6.4 0 0 1 6-4.4Z"/></svg>
            Google
          </Button>
          <Button type="button" variant="outline" onClick={() => toast("Continue with a magic link")}>
            <Mail /> Magic link
          </Button>
        </div>
        <Separator label="or with a password" />
        <div className="grid gap-2">
          <Label htmlFor="si-email">Email</Label>
          <Input id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!error} placeholder="you@company.com" autoComplete="email" />
          {error && <p className="text-[13px] text-destructive">{error}</p>}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="si-pass">Password</Label>
            <button type="button" className="text-[13px] font-medium text-primary hover:underline" onClick={() => toast("Reset link sent")}>
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input id="si-pass" type={show ? "text" : "password"} defaultValue="correct-horse" autoComplete="current-password" className="pr-10" />
            <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} className="absolute right-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <Checkbox label="Keep me signed in for 30 days" defaultChecked />
        <Button type="submit" size="lg" loading={loading}>
          {loading ? "Signing in" : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <button type="button" className="font-medium text-primary hover:underline">
            Create an account
          </button>
        </p>
      </form>
      <div className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground md:grid md:content-end">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
        <div className="absolute -right-24 -top-24 size-80 rounded-full border-[40px] border-current opacity-15" aria-hidden />
        <div className="absolute -right-4 top-28 size-48 rounded-full border-[28px] border-current opacity-10" aria-hidden />
        <p className="relative text-2xl font-semibold leading-snug tracking-tight">Every project, task and file your team shares, in one place.</p>
        <p className="relative mt-3 text-sm opacity-75">Sample block. Swap in your own product copy.</p>
      </div>
    </div>
  );
}
