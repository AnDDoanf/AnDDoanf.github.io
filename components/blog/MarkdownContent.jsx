import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export default function MarkdownContent({
  content,
  resolveHeadingId,
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h2: ({ children }) => {
          if (!resolveHeadingId) {
            return <h2>{children}</h2>;
          }

          const id = resolveHeadingId(children, 2);
          return <h2 id={id}>{children}</h2>;
        },
        h3: ({ children }) => {
          if (!resolveHeadingId) {
            return <h3>{children}</h3>;
          }

          const id = resolveHeadingId(children, 3);
          return <h3 id={id}>{children}</h3>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
