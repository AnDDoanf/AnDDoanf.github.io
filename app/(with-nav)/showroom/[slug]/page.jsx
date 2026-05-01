import fs from "fs";
import matter from "gray-matter";
import { notFound } from "next/navigation";

import productions from "@/data/showroom/productions";
import ProductionDetailsClient from "@/components/showroom/ProductionDetailsClient";

function getProduction(slug) {
  const production = productions.find((p) => p.slug === slug);
  if (!production) notFound();
  return production;
}

function getProductionContent(slug) {
  const file = `data/showroom/productions/${slug}.md`;
  if (!slug || !fs.existsSync(file)) {
    notFound();
  }
  return matter(fs.readFileSync(file, "utf-8"));
}

export async function generateStaticParams() {
  return productions
    .filter((p) => p.slug)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const production = productions.find((p) => p.slug === slug);
  if (!production) return {};
  const doc = getProductionContent(slug);
  const title = doc.data?.title ?? production.title ?? slug;
  return { title };
}

export default async function ShowroomProductionPage({ params }) {
  const { slug } = await params;
  const production = getProduction(slug);
  const doc = getProductionContent(slug);

  const title = doc.data?.title ?? production.title ?? slug;
  const description = production.description ?? "";
  const liveHref = production.liveHref ?? production.href ?? "";
  const repoHref = production.repoHref ?? "";
  const coverSrc = production.coverSrc ?? "";
  const coverAlt = production.coverAlt ?? title;
  const content = doc.content ?? "";

  return (
    <ProductionDetailsClient
      title={title}
      description={description}
      liveHref={liveHref}
      repoHref={repoHref}
      coverSrc={coverSrc}
      coverAlt={coverAlt}
      content={content}
    />
  );
}
