export default function FaithTimeline({ milestones }) {
  return (
    <div className="me-faith-timeline">
      {milestones.map((milestone, index) => (
        <article className="me-faith-node" key={`${milestone.label}-${milestone.title}`}>
          <span className="me-faith-dot" aria-hidden="true" />
          <div className="me-faith-image-wrap">
            <img
              className="me-faith-image"
              src={milestone.image}
              alt={milestone.alt || ""}
              loading="lazy"
            />
          </div>
          <div className="me-faith-copy">
            <p className="me-faith-label">{milestone.label}</p>
            <h2>{milestone.title}</h2>
            <p>{milestone.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
