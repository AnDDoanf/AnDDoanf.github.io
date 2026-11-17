import WorshipSongsApp from "@/components/worship-songs/App";

export const metadata = {
  title: "Thánh Ca Hội Thánh | An Doan",
  description: "Tra cứu lời bài hát, hợp âm và bản nhạc thánh ca Việt Nam.",
};

export default function WorshipSongsPage() {
  return (
    <section className="worship-songs-tool" aria-label="Thánh Ca Hội Thánh">
      <WorshipSongsApp />
    </section>
  );
}
