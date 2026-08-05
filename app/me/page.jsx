import { getMeSections } from "@/app/utils/meSections";
import MeSections from "@/components/me/MeSections";
import MeThemeSync from "@/components/me/MeThemeSync";
import { video } from "@/data/portfolio/video";
import MePageIntro from "@/components/me/MePageIntro";
import MeVideoHeading from "@/components/me/MeVideoHeading";

export const metadata = {
  title: "More About Me | Thuan An Doan",
  description: "Hobbies, faith, vision, and personal Q&A from Thuan An Doan.",
};

export default function MePage() {
  const sections = getMeSections();

  return (
    <main className="me-page">
      <MeThemeSync />

      <MePageIntro />

      <section className="portfolio-section me-video-section">
        <div className="me-video-heading">
          <MeVideoHeading />
        </div>
        <div className="portfolio-video-wrapper">
          <iframe
            src={video.embedUrl}
            title="About me video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      <MeSections sections={sections} />
    </main>
  );
}
