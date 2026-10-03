import Hero from '@/components/portfolio/Hero'
import Summary from '@/components/portfolio/Summary'
import ExperienceTimeline from '@/components/portfolio/ExperienceTimeline'
import SkillsCloud from '@/components/portfolio/SkillCloud'
import Projects from '@/components/portfolio/Projects'
// import AboutMe from '@/components/portfolio/AboutMe'
import DownloadCV from "@/components/ui/DownloadCV"
import getProjectMetadata from '@/app/utils/getProjectMetadata'

export default function PortfolioPage() {
  const projects = getProjectMetadata();

  return (
    <div className="portfolio-layout">
      <main className="portfolio-page">
        <Hero />
        <Summary />
        <ExperienceTimeline />
        <Projects initialProjects={projects} />
        <SkillsCloud />
        {/* <AboutMe /> */}
      </main>
      <DownloadCV />
    </div>
  )
}
