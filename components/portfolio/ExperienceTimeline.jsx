import { experiences } from '@/data/portfolio/experiences'
import TimelineNode from '@/components/portfolio/TimelineNode'

export default function ExperienceTimeline() {
  return (
    <section id="portfolio-experience" className="portfolio-section">
      <h1 className="portfolio-section-title">Experience</h1>

      <div className="portfolio-timeline">
        {experiences.map((exp, i) => (
          <TimelineNode
            key={i}
            data={exp}
            align={i % 2 === 0 ? 'left' : 'right'}
          />
        ))}
      </div>
    </section>
  )
}
