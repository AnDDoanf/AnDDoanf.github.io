import type { Metadata } from "next";
import ScrollToTop from "@/components/ui/ScrollToTop";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/styles/globals.css";
import "@/styles/portfolio.css";
import "@/styles/poetry.css";

export const metadata: Metadata = {
  title: "AnDDoanf",
  description: "A personal website of AnDDoanf",
  icons: {
    icon: 'app/img.ico',
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
