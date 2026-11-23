import { Button } from "@/registry/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/ui/card";
import { Input, Label } from "@/registry/ui/input";
import { Select } from "@/registry/ui/select";

export default function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create a workspace</CardTitle>
        <CardDescription>Invite your team after it's set up.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="ws-name">Name</Label>
          <Input id="ws-name" placeholder="My workspace" />
        </div>
        <div className="grid gap-2">
          <Label>Region</Label>
          <Select aria-label="Region" defaultValue="us" options={[{ value: "us", label: "United States" }, { value: "eu", label: "Europe" }, { value: "ap", label: "Asia Pacific" }]} />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="ghost">Cancel</Button>
        <Button>Create workspace</Button>
      </CardFooter>
    </Card>
  );
}
