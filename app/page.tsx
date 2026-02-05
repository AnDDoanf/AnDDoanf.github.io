import ThemeToggle from "@/components/ui/ThemeToggle";
import Link from "next/link";
import TypingText from "@/components/ui/TypingText";
import MyImgSVG from "@/data/assets/an-doan.svg";
import Image from "next/image";

export default function HomePage() {
  return (
    <section className="home-hero">
      <div className="home-left ">
        <div className="signature home-title">
          <Image src={MyImgSVG} alt="An Doan" width={300} height={150} />
        </div>

        <div className="home-description">
          <TypingText
            text="I  am God's workmanship, created in Christ to do good works that He has prepared for me to do (Ephesians 2:10)."
          />
        </div>

        <div className="home-role">
          <div className="avatar" />
          <div>
            <strong>Full Stack Developer</strong>
            <p>Doan Thuan An</p>
          </div>
          <div className="theme-toggle-homepage">   
            <ThemeToggle/>
          </div>
        </div>
      </div>

      <div className="home-right">
        
        <ul className="home-links">
          <li>
            <i className="bi bi-person"/> 
            <Link href="/portfolio">
              <div className="home-nav">My Portfolio</div>
            </Link>  
          </li>
          <li><i className="bi bi-pencil-square" /> 
            <Link href="/blog">
              <div className="home-nav">Read a recent blog</div>
            </Link>  
          </li>
          <li><i className="bi bi-feather" />
            <Link href="/poetry">
              <div className="home-nav">Explore my poetry passion</div>
            </Link> 
          </li>
          <li><i className="bi bi-egg-fried" />
            <Link href="/culinary">
              <div className="home-nav">Explore my culinary hobby</div>
            </Link> 
          </li>
          <li><i className="bi bi-shop" />
            <Link href="/showroom">
              <div className="home-nav">Showroom</div>
            </Link> 
          </li>
          <div className="home-social">
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
