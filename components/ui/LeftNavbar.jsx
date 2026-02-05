"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
export default function LeftNavbar() {
  return (
    <aside className="left-nav">
        <Link href="/">
            <h2 className="nav-title">
                <span>AnDDoanf </span>
            </h2>
        </Link>
        <nav>
            <ul className="nav-list">
            <li className=""><i><ThemeToggle/></i>
                <span>  Theme</span>
            </li>
            <li>
                <Link href="/">
                <i className="bi bi-house"></i>
                <span>Home</span>
                </Link>
            </li>

            <li>
                <Link href="/portfolio">
                <i className="bi bi-person"></i>
                <span>About</span>
                </Link>
            </li>

            <li>
                <Link href="/blog">
                <i className="bi bi-pencil-square"></i>
                <span>Blogs</span>
                </Link>
            </li>

            <li>
                <Link href="/poetry">
                <i className="bi bi-feather"></i>
                <span>Poems</span>
                </Link>
            </li>

            <li>
                <Link href="/updating">
                <i className="bi bi-egg-fried"></i>
                <span>Culinary</span>
                </Link>
            </li>

            <li>
                <Link href="/updating">
                <i className="bi bi-shop"></i>
                <span>Showrooms</span>
                </Link>
            </li>
            </ul>
            
        </nav>
    </aside>
  );
}
