"use client";

import { CreditCard, Settings, User } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Input, Label } from "@/registry/ui/input";
import { Switch } from "@/registry/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/ui/tabs";

export default function TabsDemo() {
  return (
    <div className="grid w-full max-w-md gap-8">
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">
            <User /> Account
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard /> Billing
          </TabsTrigger>
          <TabsTrigger value="prefs">
            <Settings /> Preferences
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="grid gap-3 rounded-xl border p-4">
          <div className="grid gap-2">
            <Label htmlFor="tab-name">Display name</Label>
            <Input id="tab-name" defaultValue="synccn" />
          </div>
          <Button className="w-fit">Save changes</Button>
        </TabsContent>
        <TabsContent value="billing" className="rounded-xl border p-4 text-sm text-muted-foreground">
          You're on the Pro plan. Your next invoice is on the 1st.
        </TabsContent>
        <TabsContent value="prefs" className="rounded-xl border p-4">
          <Switch label="Weekly summary email" defaultChecked />
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="overview" variant="underline">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
