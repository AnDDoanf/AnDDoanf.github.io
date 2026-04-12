export default function GalleryTemplate({ meta, content }) {
  return (
    <div>
      <h1>{meta.title}</h1>
      <div className="grid grid-cols-3 gap-4">
        {/* custom rendering logic */}
      </div>
      <div>{content}</div>
    </div>
  );
}