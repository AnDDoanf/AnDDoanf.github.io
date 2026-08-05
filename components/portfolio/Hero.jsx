"use client";

import { profile } from '@/data/portfolio/profile'
import myFace from "@/data/assets/myFace.jpg"
import { useI18n } from "@/components/i18n/I18nProvider";

export default function Hero() {
  const { lang } = useI18n();
  return (
    <section id="portfolio-hero" className="portfolio-section">
        <div className="portfolio-hero">
            <div
              className="portfolio-hero-img"
              style={{
                backgroundImage: `url(${myFace.src})`,
              }}
            />
            <div className="portfolio-hero-content">
              <div>
                <h1 className="portfolio-hero-name">{lang === "vi" ? profile.nameVi : profile.name}</h1>
                <p className="portfolio-hero-title">{lang === "vi" ? profile.titleVi : profile.title}</p>
              </div>

              <div className="portfolio-hero-contact">
                <p>{lang === "vi" ? profile.locationVi : profile.location}</p>
                <p>{profile.email}</p>
                <a href={profile.linkedin}>LinkedIn</a>
                <a href={profile.github}>GitHub</a>
              </div>
            </div>
        </div>
    </section>
  )
}
