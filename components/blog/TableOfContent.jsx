export default function TableOfContents({ headings }) {
  if (!headings.length) return null;

  return (
    <aside className="toc">
      <p className="toc-title">On this page</p>
      <ul>
        {headings.map(h => (
          <li key={h.id}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
