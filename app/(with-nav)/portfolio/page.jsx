import Hero from '@/components/portfolio/Hero'
import Summary from '@/components/portfolio/Summary'
import ExperienceTimeline from '@/components/portfolio/ExperienceTimeline'
import SkillsCloud from '@/components/portfolio/SkillCloud'
import AboutVideo from '@/components/portfolio/AboutVideo'
import PortfolioTOC from '@/components/portfolio/PortfolioTOC'

export default function PortfolioPage() {
  return (
    <div className="portfolio-layout">
      <main className="portfolio-page">
        <Hero />
        <Summary />
        <ExperienceTimeline />
        <SkillsCloud />
        <AboutVideo />
      </main>

      <PortfolioTOC />
    </div>
  )
}
