import { loadGalleryCollection } from "@/app/utils/galleryLoader";
import GalleryPageClient from "@/components/gallery/GalleryPageClient";

export const metadata = {
  title: "Gallery",
  description: "Image galleries loaded from the filesystem.",
};

export default function GalleryPage() {
  const galleries = loadGalleryCollection();
  return <GalleryPageClient galleries={galleries} />;
}
