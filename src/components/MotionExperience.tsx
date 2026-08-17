"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type MotionMode = "system" | "full" | "reduced";

const STORAGE_KEY = "insepti-motion";

export function MotionExperience() {
  const pathname = usePathname();
  const [mode, setMode] = useState<MotionMode>("system");
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "full" || stored === "reduced") setMode(stored);
    setSystemReduced(motionQuery.matches);

    const onPreferenceChange = (event: MediaQueryListEvent) => setSystemReduced(event.matches);
    motionQuery.addEventListener("change", onPreferenceChange);
    return () => motionQuery.removeEventListener("change", onPreferenceChange);
  }, []);

  const motionEnabled = mode === "full" || (mode === "system" && !systemReduced);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = motionEnabled ? "full" : "reduced";
    window.dispatchEvent(new CustomEvent("insepti:motion-change"));
  }, [motionEnabled]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");
    const revealNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const parallaxNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));

    if (!motionEnabled) {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
      parallaxNodes.forEach((node) => node.style.setProperty("--parallax", "0"));
      return;
    }

    revealNodes.forEach((node) => node.classList.remove("is-visible"));
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -9%", threshold: 0.08 });
    revealNodes.forEach((node) => revealObserver.observe(node));

    let frame = 0;
    const updateParallax = () => {
      const viewportCenter = window.innerHeight / 2;
      parallaxNodes.forEach((node) => {
        const bounds = node.getBoundingClientRect();
        const nodeCenter = bounds.top + bounds.height / 2;
        const progress = Math.max(-1, Math.min(1, (nodeCenter - viewportCenter) / Math.max(window.innerHeight, 1)));
        node.style.setProperty("--parallax", progress.toFixed(3));
      });
      frame = 0;
    };
    const requestParallaxUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
    window.addEventListener("resize", requestParallaxUpdate);
    return () => {
      revealObserver.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestParallaxUpdate);
      window.removeEventListener("resize", requestParallaxUpdate);
    };
  }, [motionEnabled, pathname]);

  const toggleMotion = () => {
    const nextMode: MotionMode = motionEnabled ? "reduced" : "full";
    window.localStorage.setItem(STORAGE_KEY, nextMode);
    setMode(nextMode);
  };

  return (
    <button
      type="button"
      className="motion-experience-toggle"
      onClick={toggleMotion}
      aria-pressed={motionEnabled}
      aria-label={motionEnabled ? "Réduire les animations" : "Activer les animations"}
      title={motionEnabled ? "Réduire les animations" : "Activer les animations"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12h3l2.1-6 4.1 12 2.1-6H20" />
      </svg>
      <span>{motionEnabled ? "Mouvement actif" : "Activer le mouvement"}</span>
    </button>
  );
}
