import { profile } from '@/data/portfolio/profile'
import myFace from "@/data/assets/myFace.jpg"

export default function Hero() {
  return (
    <section id="portfolio-hero" className="portfolio-section">
        <div className="portfolio-hero">
            <div
              className="portfolio-hero-img"
              style={{
                backgroundImage: `url(${myFace.src})`,
              }}
            />
            <div>
            <h1 className="portfolio-hero-name">{profile.name}</h1>
            <p className="portfolio-hero-title">{profile.title}</p>
            </div>

            <div className="portfolio-hero-contact">
            <p>{profile.location}</p>
            <p>{profile.email}</p>
            <a href={profile.linkedin}>LinkedIn</a>
            <a href={profile.github}>GitHub</a>
            </div>
        </div>
    </section>
  )
}
