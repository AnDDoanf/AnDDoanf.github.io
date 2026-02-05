export default function TimelineNode({ data, align }) {
  const alignClass =
    align === 'left'
      ? 'portfolio-timeline-node-left'
      : 'portfolio-timeline-node-right'

  return (
    <div className={`portfolio-timeline-node ${alignClass}`}>
        <span className="portfolio-timeline-dot" />

        <div className="portfolio-timeline-card">
            <p className="portfolio-timeline-date">{data.date}</p>
            <strong>{data.company}</strong>
            <p className="portfolio-timeline-role">{data.role}</p>
        </div>
        <div className="portfolio-timeline-bubble">
            <ul>
                {data.responsibilities.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </div>
    </div>
  )
}
