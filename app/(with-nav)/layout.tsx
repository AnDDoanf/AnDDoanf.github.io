import LeftNavbar from "@/components/ui/LeftNavbar";
import PageBreadcrumbs from "@/components/ui/PageBreadcrumbs";
import TopRightControls from "@/components/ui/TopRightControls";

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-layout">
      <LeftNavbar />
      <TopRightControls />
      <main className="main-content">
        <PageBreadcrumbs />
        {children}
      </main>
    </div>
  );
}
