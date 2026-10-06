import { getMindmapSummaries } from "@/app/utils/mindmaps";
import MindmapLibrary from "@/components/mindmap/MindmapLibrary";

export const metadata = { title: "Mindmaps", description: "Explore learning maps and family trees." };

export default function MindmapsPage() {
  return <MindmapLibrary maps={getMindmapSummaries()} />;
}
