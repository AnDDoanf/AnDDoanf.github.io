import { summary } from '@/data/portfolio/summary'

export default function Summary() {
  return (
    <section id="portfolio-summary" className="portfolio-section">
        <h1 className="portfolio-section-title">Summary</h1>
        <p className="portfolio-summary-text">{summary}</p>
    </section>
  )
}
