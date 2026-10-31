"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { href: "#decucare", label: "Decucare" },
  { href: "#benefits", label: "Предимства" },
  { href: "#reviews", label: "Отзиви" },
];

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`brand ${light ? "brand-light" : ""}`}
      href="#top"
      aria-label="DECUCARE — начало"
    >
      <Image
        className="brand-mark"
        src="/images/decucare-logo.png"
        alt=""
        width={54}
        height={54}
        sizes="54px"
      />
      <span className="brand-copy">
        <span className="brand-name">DECUCARE</span>
        <span className="brand-tagline">ГРИЖА С ВНИМАНИЕ</span>
      </span>
    </a>
  );
}

export function SiteHeader({ emailsActive = false }: { emailsActive?: boolean }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <div className="preview-ribbon">
        <span className="status-dot" />
        Работен преглед <span className="ribbon-divider">/</span> Поръчките се
        записват ·{" "}
        {emailsActive ? "Имейлите са активни" : "Имейлите още не са активни"}
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Основна навигация">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <a className="button button-small header-order" href="#order">
            Поръчай сега
          </a>
          <button
            ref={toggle}
            className="menu-toggle"
            aria-label={open ? "Затвори менюто" : "Отвори менюто"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Мобилна навигация"
          hidden={!open}
        >
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          ))}
          <a href="#order" onClick={() => setOpen(false)}>
            Поръчай сега
          </a>
        </nav>
      </header>
    </>
  );
}
