import { TextEditor } from "@/registry/ui/text-editor";

export default function TextEditorDemo() {
  return (
    <TextEditor
      className="max-w-xl"
      defaultValue="<h2>Release notes</h2><p>This release adds <b>45 new components</b> and fixes focus return in <i>Dialog</i>.</p><ul><li>New: Rich text editor</li><li>New: Week schedule</li></ul>"
    />
  );
}
