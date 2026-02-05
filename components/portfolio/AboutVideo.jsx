import { video } from '@/data/portfolio/video'

export default function AboutVideo() {
  return (
    <section id="portfolio-about" className="portfolio-section">
      <h1 className="portfolio-section-title">More About Me</h1>

      <div className="portfolio-video-wrapper">
        <iframe
          src={video.embedUrl}
          title="About me video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  )
}
