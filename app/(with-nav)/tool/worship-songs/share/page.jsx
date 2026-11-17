import WorshipSongsApp from "@/components/worship-songs/App";

export const metadata = {
  title: "Shared worship set | An Doan",
  description: "Open a shared worship-song set.",
};

export default function SharedWorshipSongsPage() {
  return (
    <section className="worship-songs-tool" aria-label="Shared worship set">
      <WorshipSongsApp />
    </section>
  );
}
