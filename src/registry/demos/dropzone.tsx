import { Dropzone } from "@/registry/ui/dropzone";

export default function DropzoneDemo() {
  return (
    <div className="w-full max-w-md">
      <Dropzone maxSize={5 * 1048576} />
    </div>
  );
}
