"use client";

import Link from "next/link";
export default function LeftNavbar({ labels }) {
  const text = {
    home: labels?.home ?? "Home",
    about: labels?.about ?? "About",
    blogs: labels?.blogs ?? "Blogs",
    journal: labels?.journal ?? "Journal",
    poems: labels?.poems ?? "Poems",
    culinary: labels?.culinary ?? "Culinary",
    showrooms: labels?.showrooms ?? "Showrooms",
  };
  return (
    <aside className="left-nav">
        <Link href="/">
            <h2 className="nav-title">
                <span>AnDDoanf </span>
            </h2>
        </Link>
        <nav>
            <ul className="nav-list">
            <li>
                <Link href="/">
                <i className="bi bi-house"></i>
                <span>{text.home}</span>
                </Link>
            </li>

            <li>
                <Link href="/portfolio">
                <i className="bi bi-person"></i>
                <span>{text.about}</span>
                </Link>
            </li>

            <li>
                <Link href="/blog">
                <i className="bi bi-pencil-square"></i>
                <span>{text.blogs}</span>
                </Link>
            </li>

            <li>
                <Link href="/journal">
                <i className="bi bi-journal-text"></i>
                <span>{text.journal}</span>
                </Link>
            </li>

            <li>
                <Link href="/poetry">
                <i className="bi bi-feather"></i>
                <span>{text.poems}</span>
                </Link>
            </li>

            <li>
                <Link href="/updating">
                <i className="bi bi-egg-fried"></i>
                <span>{text.culinary}</span>
                </Link>
            </li>

            <li>
                <Link href="/showroom">
                <i className="bi bi-shop"></i>
                <span>{text.showrooms}</span>
                </Link>
            </li>
            </ul>
            
        </nav>
    </aside>
  );
}
