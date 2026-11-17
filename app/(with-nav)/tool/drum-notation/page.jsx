import DrumNotation from "@/components/tools/DrumNotation";
import getDrumLibrary from "@/app/utils/getDrumLibrary";

export const metadata = {
  title: "Drum notation | An Doan",
  description: "Write, play, and export drum grooves in your browser.",
};

export default function DrumNotationPage() {
  return <DrumNotation library={getDrumLibrary()} />;
}
