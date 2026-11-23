import { Alert } from "@/registry/ui/alert";
import { Button } from "@/registry/ui/button";

export default function AlertDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Alert variant="info" title="A new version is available">
        synccn 2.4 adds range mode to Calendar.
      </Alert>
      <Alert variant="success" title="Payment received" dismissible>
        Your invoice for March has been paid.
      </Alert>
      <Alert variant="warning" title="Your trial ends in 3 days" action={<Button size="sm" variant="outline">Choose a plan</Button>}>
        Pick a plan to keep your projects.
      </Alert>
      <Alert variant="destructive" title="Deploy failed">
        The build step exited with code 1. Check the logs, fix the error and redeploy.
      </Alert>
    </div>
  );
}
