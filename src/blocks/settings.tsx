"use client";

import type * as React from "react";
import { useState } from "react";
import { Avatar } from "@/registry/ui/avatar";
import { Button } from "@/registry/ui/button";
import { Input, Label } from "@/registry/ui/input";
import { RadioGroup } from "@/registry/ui/radio-group";
import { Select } from "@/registry/ui/select";
import { Switch } from "@/registry/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/ui/tabs";
import { Textarea } from "@/registry/ui/textarea";
import { toast } from "@/registry/ui/toast";

const Row = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <div className="grid gap-3 border-b py-5 last:border-0 sm:grid-cols-[220px_1fr] sm:gap-8">
    <div className="grid content-start gap-0.5">
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="text-[13px] text-muted-foreground">{hint}</p>}
    </div>
    <div className="grid max-w-md gap-3">{children}</div>
  </div>
);

export default function SettingsBlock() {
  const [dirty, setDirty] = useState(false);
  const touch = () => setDirty(true);
  return (
    <div className="w-full max-w-4xl rounded-2xl border bg-card p-5 text-left sm:p-8">
      <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">Manage your profile and notifications.</p>
      <Tabs defaultValue="profile" variant="underline" className="mt-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Row title="Photo" hint="Shown on your comments and tasks.">
            <div className="flex items-center gap-4">
              <Avatar name="Michael" size="lg" />
              <Button size="sm" variant="outline" onClick={touch}>
                Change photo
              </Button>
              <Button size="sm" variant="ghost" onClick={touch}>
                Remove
              </Button>
            </div>
          </Row>
          <Row title="Name">
            <Input defaultValue="Michael" onChange={touch} aria-label="Name" />
          </Row>
          <Row title="Bio" hint="A sentence or two for your profile.">
            <Textarea maxLength={160} defaultValue="Design engineer who loves clean interfaces." onChange={touch} aria-label="Bio" />
          </Row>
          <Row title="Time zone">
            <Select aria-label="Time zone" defaultValue="pt" onValueChange={touch} options={[{ value: "pt", label: "Pacific Time (UTC−8)" }, { value: "et", label: "Eastern Time (UTC−5)" }, { value: "uk", label: "London (UTC+0)" }, { value: "cet", label: "Berlin (UTC+1)" }]} />
          </Row>
        </TabsContent>
        <TabsContent value="notifications">
          <Row title="Email" hint="Sent to michael@example.com">
            <Switch label="Mentions and replies" defaultChecked onCheckedChange={touch} />
            <Switch label="Weekly summary" defaultChecked onCheckedChange={touch} />
            <Switch label="Product news" onCheckedChange={touch} />
          </Row>
          <Row title="Push">
            <Switch label="Direct messages" defaultChecked onCheckedChange={touch} />
            <Switch label="Task assignments" onCheckedChange={touch} />
          </Row>
        </TabsContent>
        <TabsContent value="appearance">
          <Row title="Density" hint="Changes spacing in lists and tables.">
            <RadioGroup variant="cards" defaultValue="comfortable" onValueChange={touch} className="sm:grid-cols-2" options={[{ value: "compact", label: "Compact", description: "More on screen" }, { value: "comfortable", label: "Comfortable", description: "Easier to scan" }]} />
          </Row>
        </TabsContent>
      </Tabs>
      <div className="mt-2 flex items-center justify-end gap-2 border-t pt-5">
        <p className="mr-auto text-[13px] text-muted-foreground">{dirty ? "You have unsaved changes." : "All changes saved."}</p>
        <Button variant="ghost" disabled={!dirty} onClick={() => setDirty(false)}>
          Discard
        </Button>
        <Button
          disabled={!dirty}
          onClick={() => {
            setDirty(false);
            toast.success("Settings saved");
          }}
        >
          Save settings
        </Button>
      </div>
    </div>
  );
}
