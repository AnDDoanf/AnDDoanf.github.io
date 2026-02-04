import Link from "next/link";

export default function BlogPostCard({ post }) {
  console.log(post.exerpt);
  return (
    <Link
      href={`/blog/${post.slug ?? ""}`}
      className="card"
    >
      <h2 className="card-title">
        {post.title}
      </h2>

      <p className="card-date">
        {post.date}
      </p>
      <p className="card-excerpt">
        {post.excerpt} 
      </p>
    </Link>
  );
}
