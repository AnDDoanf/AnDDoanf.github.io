import { notFound } from "next/navigation";
import { getAllMindmaps } from "@/app/utils/mindmaps";
import GiaPhaClient from "@/components/giapha/GiaPhaClient";
import LearningMap from "@/components/mindmap/LearningMap";

export function generateStaticParams() {
  return getAllMindmaps().map(map => ({ slug: map.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const map = getAllMindmaps().find(map => map.slug === slug);
  return map ? { title: map.data.title, description: map.data.description } : {};
}

export default async function MindmapPage({ params }) {
  const { slug } = await params;
  const maps = getAllMindmaps();
  const map = maps.find(map => map.slug === slug);
  if (!map) notFound();
  if (map.data.type === "learning") return <LearningMap key={map.slug} map={map} />;

  return <section className="mindmap-detail">
    <GiaPhaClient initialTrees={maps.filter(item => item.tree).map(item => item.tree)} initialTreeId={map.tree.id}
      treeLinks={Object.fromEntries(maps.filter(item => item.tree).map(item => [item.tree.id, `/mindmap/${item.slug}`]))} />
  </section>;
}
