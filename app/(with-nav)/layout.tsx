import LeftNavbar from "@/components/ui/LeftNavbar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { getLang, getMessages, t } from "@/app/utils/i18n";

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = getLang();
  const messages = getMessages(lang);
  return (
    <div className="app-layout">
      <LeftNavbar
        labels={{
          home: t(messages, "nav.home"),
          about: t(messages, "nav.about"),
          blogs: t(messages, "nav.blogs"),
          journal: t(messages, "nav.journal"),
          poems: t(messages, "nav.poems"),
          culinary: t(messages, "nav.culinary"),
          showrooms: t(messages, "nav.showrooms"),
        }}
      />
      <div className="theme-toggle-main">
        <div className="toggle-row">
          <ThemeToggle />
          <LanguageToggle
            initialLang={lang}
            labels={{ toggleLabel: t(messages, "lang.toggleLabel") }}
          />
        </div>
      </div>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
