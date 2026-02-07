import type { Metadata } from "next";
import ScrollToTop from "@/components/ui/ScrollToTop";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/styles/globals.css";
import "@/styles/portfolio.css";
import "@/styles/poetry.css";
import "@/styles/updating.css";
// import "@/styles/culinary.css";

export const metadata: Metadata = {
  title: "AnDDoanf",
  description: "A personal website of AnDDoanf",
  icons: {
    icon: 'app/favicon.ico',
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="container">
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
