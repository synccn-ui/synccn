import { Combobox } from "@/registry/ui/combobox";

const zones = [
  { value: "pst", label: "Los Angeles", hint: "UTC−8" },
  { value: "est", label: "New York", hint: "UTC−5" },
  { value: "gmt", label: "London", hint: "UTC+0" },
  { value: "cet", label: "Berlin", hint: "UTC+1" },
  { value: "ist", label: "Mumbai", hint: "UTC+5:30" },
  { value: "sgt", label: "Singapore", hint: "UTC+8" },
  { value: "jst", label: "Tokyo", hint: "UTC+9" },
  { value: "aest", label: "Sydney", hint: "UTC+10" },
];

export default function ComboboxDemo() {
  return (
    <div className="w-full max-w-xs">
      <Combobox options={zones} placeholder="Choose a time zone" searchPlaceholder="Search cities…" />
    </div>
  );
}
