const tocItems = [
  { id: 'portfolio-hero', label: 'Intro' },
  { id: 'portfolio-summary', label: 'Summary' },
  { id: 'portfolio-experience', label: 'Experience' },
  { id: 'portfolio-skills', label: 'Skills' },
  { id: 'portfolio-about', label: 'About me' },
]

export default function PortfolioTOC() {
  return (
    <aside className="portfolio-toc">
      <p className="portfolio-toc-title">Contents</p>

      <ul className="portfolio-toc-list">
        {tocItems.map(item => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="portfolio-toc-link">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
