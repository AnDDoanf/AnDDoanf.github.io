import Link from "next/link"
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { getLang, getMessages, t } from "@/app/utils/i18n";

export const metadata = {
  title: "Updating",
}

export default function UpdatingPage() {
  const lang = getLang();
  const messages = getMessages(lang);

  return (
    <main className="updating-page">
      <div className="theme-toggle-main">
        <div className="toggle-row">
          <ThemeToggle />
          <LanguageToggle
            initialLang={lang}
            labels={{ toggleLabel: t(messages, "lang.toggleLabel") }}
          />
        </div>
      </div>

      <div className="updating-card">
        <h1 className="updating-title">{t(messages, "updating.title")}</h1>

        <p className="updating-text">
          {t(messages, "updating.textLine1")}
          <br />
          {t(messages, "updating.textLine2")}
        </p>

        <div className="updating-divider" />

        <Link href="/" className="updating-back">
          {t(messages, "updating.goBack")}
        </Link>
      </div>
    </main>
  )
}
