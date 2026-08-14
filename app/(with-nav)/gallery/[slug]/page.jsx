import { notFound } from "next/navigation";

import { loadGallery, loadGalleryCollection } from "@/app/utils/galleryLoader";
import GalleryDetailsClient from "@/components/gallery/GalleryDetailsClient";

export async function generateStaticParams() {
  return loadGalleryCollection().map((gallery) => ({ slug: gallery.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const gallery = loadGallery(slug);
  if (!gallery) return {};

  const fallbackDescription = gallery.type === "pdf"
    ? "Interactive image canvas rendered from PDF."
    : `${gallery.imageCount} images`;

  return {
    title: gallery.title,
    description: gallery.description || fallbackDescription,
  };
}

export default async function GalleryDetailsPage({ params }) {
  const { slug } = await params;
  const gallery = loadGallery(slug);

  if (!gallery) notFound();

  return <GalleryDetailsClient gallery={gallery} />;
}
