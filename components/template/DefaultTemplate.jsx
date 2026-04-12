export default function DefaultTemplate({ meta, content }) {
  return (
    <div className="prose mx-auto">
      <h1>{meta.title}</h1>
      <p>{meta.date}</p>
      <div>{content}</div>
    </div>
  );
}