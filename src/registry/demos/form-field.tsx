"use client";

import type * as React from "react";
import { useState } from "react";
import { Button } from "@/registry/ui/button";
import { FieldSet, FormField } from "@/registry/ui/form-field";
import { Input } from "@/registry/ui/input";
import { Select } from "@/registry/ui/select";
import { Textarea } from "@/registry/ui/textarea";
import { toast } from "@/registry/ui/toast";

export default function FormFieldDemo() {
  const [v, setV] = useState({ name: "", email: "", topic: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof v, string>>>({});
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const er: typeof errors = {};
    if (!v.name.trim()) er.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(v.email)) er.email = "Enter an email like name@company.com.";
    if (!v.topic) er.topic = "Choose a topic so we can route your message.";
    setErrors(er);
    if (!Object.keys(er).length) toast.success("Message sent", { description: "We'll reply within a day." });
  };
  const bind = (k: keyof typeof v) => ({
    value: v[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value }),
  });
  return (
    <form onSubmit={submit} noValidate className="grid w-full max-w-sm gap-5">
      <FieldSet legend="Contact us" description="Fields marked * are required.">
        <FormField label="Name" required error={errors.name}>
          <Input {...bind("name")} placeholder="Michael" />
        </FormField>
        <FormField label="Email" required error={errors.email} description="We only use this to reply.">
          <Input type="email" {...bind("email")} placeholder="michael@example.com" />
        </FormField>
        <FormField label="Topic" required error={errors.topic}>
          <Select aria-label="Topic" value={v.topic || undefined} onValueChange={(topic) => setV({ ...v, topic })} placeholder="Choose a topic" options={[{ value: "support", label: "Support" }, { value: "billing", label: "Billing" }, { value: "feedback", label: "Feedback" }]} />
        </FormField>
        <FormField label="Message" optional>
          <Textarea {...bind("message")} maxLength={300} placeholder="How can we help?" />
        </FormField>
      </FieldSet>
      <Button type="submit">Send message</Button>
    </form>
  );
}
