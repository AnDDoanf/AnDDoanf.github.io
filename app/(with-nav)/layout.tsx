import LeftNavbar from "@/components/ui/LeftNavbar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/ui/LanguageToggle";

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-layout">
      <LeftNavbar />
      <div className="theme-toggle-main">
        <div className="toggle-row">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
