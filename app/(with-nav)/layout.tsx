import LeftNavbar from "@/components/ui/LeftNavbar";

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-layout">
      <LeftNavbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
