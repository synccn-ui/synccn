import { AudioPlayer } from "@/registry/ui/audio-player";

export default function AudioPlayerDemo() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <AudioPlayer title="Voice note from Riley" duration={38} />
      <AudioPlayer duration={74} bars={36} />
      <p className="text-center text-xs text-muted-foreground">Silent preview. Pass a src to play a real file.</p>
    </div>
  );
}
