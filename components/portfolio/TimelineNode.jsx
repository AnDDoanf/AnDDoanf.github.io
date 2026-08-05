export default function TimelineNode({ data, align, lang }) {
  const alignClass =
    align === 'left'
      ? 'portfolio-timeline-node-left'
      : 'portfolio-timeline-node-right'

  return (
    <div className={`portfolio-timeline-node ${alignClass}`}>
        <span className="portfolio-timeline-dot" />

        <div className="portfolio-timeline-card">
            <p className="portfolio-timeline-date">{lang === "vi" ? data.dateVi : data.date}</p>
            <strong>{data.company}</strong>
            <p className="portfolio-timeline-role">{lang === "vi" ? data.roleVi : data.role}</p>
        </div>
        <div className="portfolio-timeline-bubble">
            <ul>
                {(lang === "vi" ? data.responsibilitiesVi : data.responsibilities).map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </div>
    </div>
  )
}
