import { notFound } from "next/navigation";

import { getAllTrees, getTreeById } from "@/app/utils/giapha";
import GiaPhaClient from "@/components/giapha/GiaPhaClient";

export function generateStaticParams() {
  return getAllTrees().map((tree) => ({ slug: tree.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tree = getTreeById(slug);

  if (!tree) return {};

  return {
    title: tree.titleEn || tree.title,
    description: tree.branch || tree.motto || "Interactive family tree.",
  };
}

export default async function TreePage({ params }) {
  const { slug } = await params;
  const trees = getAllTrees();
  const tree = trees.find((item) => item.id === slug);

  if (!tree) notFound();

  return <GiaPhaClient initialTrees={trees} initialTreeId={tree.id} />;
}
