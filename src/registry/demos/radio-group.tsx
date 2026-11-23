import { RadioGroup } from "@/registry/ui/radio-group";

export default function RadioGroupDemo() {
  return (
    <div className="grid w-full max-w-lg gap-8">
      <RadioGroup
        label="Plan"
        variant="cards"
        defaultValue="pro"
        options={[
          { value: "hobby", label: "Hobby", description: "Free forever" },
          { value: "pro", label: "Pro", description: "$12 per month" },
          { value: "team", label: "Team", description: "$39 per month" },
        ]}
      />
      <RadioGroup
        label="Density"
        defaultValue="comfortable"
        options={[
          { value: "compact", label: "Compact" },
          { value: "comfortable", label: "Comfortable" },
          { value: "spacious", label: "Spacious", disabled: true },
        ]}
      />
    </div>
  );
}
