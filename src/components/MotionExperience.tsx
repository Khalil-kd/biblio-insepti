"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function MotionExperience() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { root.dataset.motion = query.matches ? "soft" : "full"; };
    sync(); query.addEventListener("change", sync); root.classList.add("motion-ready");
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting)), { rootMargin: "-3% 0px -8%", threshold: [0, .08, .35] });
    reveals.forEach((node) => observer.observe(node));
    let frame = 0; let previous = window.scrollY;
    const update = () => {
      const height = Math.max(window.innerHeight, 1); const center = height / 2; const current = window.scrollY;
      root.dataset.scrollDirection = current >= previous ? "down" : "up"; previous = current;
      parallax.forEach((node) => { const box = node.getBoundingClientRect(); const progress = Math.max(-1, Math.min(1, (box.top + box.height / 2 - center) / (height + box.height))); node.style.setProperty("--parallax", progress.toFixed(4)); });
      frame = 0;
    };
    const request = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update(); window.addEventListener("scroll", request, { passive: true }); window.addEventListener("resize", request);
    return () => { query.removeEventListener("change", sync); observer.disconnect(); window.cancelAnimationFrame(frame); window.removeEventListener("scroll", request); window.removeEventListener("resize", request); };
  }, [pathname]);
  return null;
}
