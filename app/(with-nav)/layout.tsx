import LeftNavbar from "@/components/ui/LeftNavbar";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-layout">
      <LeftNavbar />
      <div className="theme-toggle-main">
        <ThemeToggle />
      </div>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
