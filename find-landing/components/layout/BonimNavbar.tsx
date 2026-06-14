"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type NavLink = {
  label: string;
  href: string;
  hasDropdown?: boolean;
  active?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { label: "בית", href: "#", active: true },
  { label: "הסיפור שלנו", href: "#" },
  { label: "השירותים שלנו", href: "#", hasDropdown: true },
  { label: "ממליצים עלינו", href: "#" },
  { label: "העסקאות שלנו", href: "#" },
  { label: "תוכן מקצועי", href: "#" },
  { label: "שאלות ותשובות", href: "#" },
  { label: "דברו איתנו", href: "#" },
];

export default function BonimNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const ticking = useRef(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop, { passive: true });
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 60);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isDesktop) setMenuOpen(false);
  }, [isDesktop]);

  return (
    <>
      <header
        role="banner"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
      >
        {/* Teal accent bar */}
        <div
          aria-hidden="true"
          style={{
            height: scrolled ? "0px" : "4px",
            overflow: "hidden",
            background:
              "linear-gradient(90deg, #2f9e92 0%, #7fd0c7 60%, #bfe6e0 100%)",
            opacity: scrolled ? 0 : 1,
            transition: "opacity 300ms ease, height 300ms ease",
          }}
        />

        {/* Main bar */}
        <div
          style={{
            backgroundColor: scrolled ? "#ffffff" : "transparent",
            backdropFilter: scrolled ? "none" : "none",
            WebkitBackdropFilter: scrolled ? "none" : "none",
            boxShadow: scrolled ? "0 2px 14px rgba(0,0,0,0.07)" : "none",
            transition: "background-color 300ms ease, box-shadow 300ms ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "77px",
              paddingLeft: "clamp(20px, 3.5vw, 56px)",
              paddingRight: "clamp(20px, 3.5vw, 56px)",
            }}
          >
            {/* RIGHT edge (RTL start): Logo - first JSX child = visual right in RTL flow */}
            <a
              href="#"
              aria-label="בונים עתיד – דף הבית"
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: "69px",
                  width: "232px",
                }}
              >
                {/* White logo (top/translucent state) */}
                <Image
                  src="/images/bonim-logo.webp"
                  alt="בונים עתיד"
                  fill
                  priority
                  sizes="232px"
                  style={{
                    objectFit: "contain",
                    objectPosition: "right center",
                    filter: "brightness(0) invert(1)",
                    opacity: scrolled ? 0 : 1,
                    transition: "opacity 300ms ease",
                  }}
                />
                {/* Full-color logo (scrolled state) */}
                <Image
                  src="/images/bonim-logo.webp"
                  alt=""
                  fill
                  aria-hidden="true"
                  priority
                  sizes="232px"
                  style={{
                    objectFit: "contain",
                    objectPosition: "right center",
                    opacity: scrolled ? 1 : 0,
                    transition: "opacity 300ms ease",
                  }}
                />
              </div>
            </a>

            {/* CENTER: navigation links (desktop only) */}
            {isDesktop && (
              <nav
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "19px",
                  flex: 1,
                  justifyContent: "center",
                }}
                aria-label="ניווט ראשי"
              >
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{
                      fontSize: "16px",
                      fontWeight: 400,
                      fontFamily: "var(--font-hebrew), sans-serif",
                      textDecoration: "none",
                      color: scrolled
                        ? "#3a3a3a"
                        : link.active
                        ? "#b9d8d1"
                        : "#ffffff",
                      whiteSpace: "nowrap",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      transition: "color 300ms ease",
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        scrolled ? "#2f9e92" : "rgba(255,255,255,0.70)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.color = scrolled
                        ? "#3a3a3a"
                        : link.active
                        ? "#b9d8d1"
                        : "#ffffff";
                    }}
                    aria-current={link.active ? "page" : undefined}
                  >
                    {link.label}
                    {link.hasDropdown && (
                      <span
                        aria-hidden="true"
                        style={{
                          fontSize: "7px",
                          opacity: 0.8,
                          display: "inline-block",
                          transform: "translateY(1px)",
                        }}
                      >
                        ▾
                      </span>
                    )}
                  </a>
                ))}
              </nav>
            )}

            {/* LEFT edge (RTL end): CTA button or hamburger - last JSX child = visual left in RTL flow */}
            {isDesktop ? (
              <div style={{ flexShrink: 0 }}>
                <a
                  href="#register"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "6px 13px",
                    borderRadius: "3px",
                    fontSize: "13px",
                    fontWeight: 400,
                    fontFamily: "var(--font-hebrew), sans-serif",
                    border: scrolled
                      ? "1px solid #444444"
                      : "1px solid rgba(255,255,255,0.60)",
                    color: scrolled ? "#333333" : "#ffffff",
                    backgroundColor: "transparent",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                    transition:
                      "border-color 300ms ease, color 300ms ease, background-color 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.backgroundColor = scrolled
                      ? "rgba(0,0,0,0.05)"
                      : "rgba(255,255,255,0.10)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.backgroundColor = "transparent";
                  }}
                >
                  שיחת ייעוץ ללא עלות »
                </a>
              </div>
            ) : (
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? "סגור תפריט" : "פתח תפריט"}
                aria-expanded={menuOpen}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  minWidth: "44px",
                  minHeight: "44px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  color: scrolled ? "#3a3a3a" : "#ffffff",
                  flexShrink: 0,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      display: "block",
                      width: "18px",
                      height: "2px",
                      backgroundColor: "currentColor",
                      transition: "transform 300ms ease, opacity 300ms ease",
                      transform:
                        menuOpen && i === 0
                          ? "translateY(7px) rotate(45deg)"
                          : menuOpen && i === 2
                          ? "translateY(-7px) rotate(-45deg)"
                          : "none",
                      opacity: menuOpen && i === 1 ? 0 : 1,
                    }}
                  />
                ))}
              </button>
            )}
          </div>
        </div>

        {/* Mobile drawer */}
        {!isDesktop && (
          <div
            aria-hidden={!menuOpen}
            style={{
              backgroundColor: "#ffffff",
              maxHeight: menuOpen ? "600px" : "0px",
              overflow: "hidden",
              transition: "max-height 300ms ease",
              boxShadow: menuOpen ? "0 8px 24px rgba(0,0,0,0.10)" : "none",
            }}
          >
            <nav
              aria-label="ניווט ראשי (נייד)"
              style={{
                padding: "8px clamp(20px, 3.5vw, 56px) 20px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-current={link.active ? "page" : undefined}
                  style={{
                    fontSize: "13px",
                    fontWeight: link.active ? 600 : 400,
                    fontFamily: "var(--font-hebrew), sans-serif",
                    color: link.active ? "#2f9e92" : "#3a3a3a",
                    textDecoration: "none",
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(0,0,0,0.07)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    minHeight: "44px",
                  }}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <span aria-hidden="true" style={{ fontSize: "10px" }}>
                      ▾
                    </span>
                  )}
                </a>
              ))}
              <div style={{ paddingTop: "16px" }}>
                <a
                  href="#register"
                  onClick={() => setMenuOpen(false)}
                  tabIndex={menuOpen ? 0 : -1}
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    border: "1px solid #444",
                    borderRadius: "3px",
                    color: "#333",
                    fontSize: "12px",
                    fontWeight: 400,
                    fontFamily: "var(--font-hebrew), sans-serif",
                    textDecoration: "none",
                  }}
                >
                  שיחת ייעוץ ללא עלות »
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
