import getPostMetadata from "@/app/utils/getPostMetadata";
import { redirect } from "next/navigation";

export async function generateStaticParams() {
  const posts = getPostMetadata("data/blog_posts").filter(
    (post) => post.category === "journal"
  );
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function JournalPostPage({ params }) {
  const { slug } = await params;
  redirect(`/blog/${slug}`);
}
