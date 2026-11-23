import { Accordion } from "@/registry/ui/accordion";

export default function AccordionDemo() {
  return (
    <Accordion
      className="max-w-md"
      defaultValue={["own"]}
      items={[
        { value: "own", title: "Do I own the code?", content: "Yes. The CLI copies each component's source into your project, so you can edit it like any other file." },
        { value: "a11y", title: "Are the components accessible?", content: "They use the right ARIA roles, support the keyboard and keep visible focus. Test them in your own flows too." },
        { value: "theme", title: "Can I change the look?", content: "Every colour and radius comes from CSS variables. Build a theme on the Themes page and paste the result into your CSS." },
      ]}
    />
  );
}
