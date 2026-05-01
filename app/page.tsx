import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/ui/LanguageToggle";
import Link from "next/link";
import TypingText from "@/components/ui/TypingText";
import MyImgSVG from "@/data/assets/an-doan.svg";
import Image from "next/image";
import { getLang, getMessages, t } from "@/app/utils/i18n";

export default function HomePage() {
  const lang = getLang();
  const messages = getMessages(lang);

  return (
    <section className="home-hero home-animate-container">
      <div className="home-left home-animate-left">
        <div className="signature home-title home-animate-item">
          <Image src={MyImgSVG} alt="An Doan" width={300} height={150} />
        </div>

        <div className="home-description home-animate-item delay-1">
          <TypingText
            text="I am God's workmanship, created in Christ to do good works that He has prepared for me to do (Ephesians 2:10)."
          />
        </div>

        <div className="home-role home-animate-item delay-2">
          <div className="avatar" />
          <div>
            <strong>Full Stack Developer</strong>
            <p>Doan Thuan An</p>
          </div>
          <div className="theme-toggle-homepage">
            <div className="toggle-row">
              <ThemeToggle />
              <LanguageToggle
                initialLang={lang}
                labels={{ toggleLabel: t(messages, "lang.toggleLabel") }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="home-right home-animate-right">
        <ul className="home-links">
          <li className="home-animate-link delay-1">
            <i className="bi bi-person" />
            <Link href="/portfolio">
              <div className="home-nav">{t(messages, "home.portfolio")}</div>
            </Link>
          </li>

          <li className="home-animate-link delay-2">
            <i className="bi bi-pencil-square" />
            <Link href="/blog">
              <div className="home-nav">{t(messages, "home.blog")}</div>
            </Link>
          </li>

          <li className="home-animate-link delay-2">
            <i className="bi bi-pencil-square" />
            <Link href="/journal">
              <div className="home-nav">{t(messages, "home.journal")}</div>
            </Link>
          </li>

          <li className="home-animate-link delay-3">
            <i className="bi bi-feather" />
            <Link href="/poetry">
              <div className="home-nav">{t(messages, "home.poetry")}</div>
            </Link>
          </li>

          <li className="home-animate-link delay-4">
            <i className="bi bi-egg-fried" />
            <Link href="/updating">
              <div className="home-nav">{t(messages, "home.culinary")}</div>
            </Link>
          </li>

          <li className="home-animate-link delay-5">
            <i className="bi bi-shop" />
            <Link href="/showroom">
              <div className="home-nav">{t(messages, "home.showroom")}</div>
            </Link>
          </li>

          <div className="home-social home-animate-item delay-6">
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/AnDDoanf" aria-label="GitHub">
              <i className="bi bi-github"></i>
            </a>
            <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/thuan-an-doan/" aria-label="LinkedIn">
              <i className="bi bi-linkedin"></i>
            </a>
            <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/thuanan.doan/" aria-label="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a target="_blank" rel="noopener noreferrer" href="https://discord.com/users/416180260686790656" aria-label="Facebook">
              <i className="bi bi-discord"></i>
            </a>
            <a href="mailto:anddoanf.work@gmail.com" aria-label="Email" >
              <i className="bi bi-envelope"></i>
            </a>
          </div>
        </ul>
      </div>
    </section>
  );
}
