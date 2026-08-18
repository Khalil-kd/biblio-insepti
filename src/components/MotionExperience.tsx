"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ADMIN_MOTION_KEY = "insepti-admin-motion";

export function MotionExperience({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [adminMotion, setAdminMotion] = useState(false);

  useEffect(() => {
    if (isAdmin) setAdminMotion(window.localStorage.getItem(ADMIN_MOTION_KEY) === "full");
  }, [isAdmin]);

  useEffect(() => {
    const root = document.documentElement;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      root.dataset.motion = adminMotion ? "full" : query.matches ? "soft" : "full";
      root.dataset.motionBoost = adminMotion ? "true" : "false";
    };
    sync();
    query.addEventListener("change", sync);
    root.classList.add("motion-ready");

    const observed = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("is-visible", entry.isIntersecting));
    }, { rootMargin: "-3% 0px -8%", threshold: [0, .08, .35] });
    const observeReveals = (scope: ParentNode = document) => {
      scope.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
        if (!observed.has(node)) { observed.add(node); observer.observe(node); }
      });
    };
    observeReveals();
    const mutations = new MutationObserver((entries) => entries.forEach((entry) => entry.addedNodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        if (node.matches("[data-reveal]") && !observed.has(node)) { observed.add(node); observer.observe(node); }
        observeReveals(node);
      }
    })));
    mutations.observe(document.body, { childList: true, subtree: true });

    let frame = 0;
    let previous = window.scrollY;
    const update = () => {
      const height = Math.max(window.innerHeight, 1);
      const center = height / 2;
      const current = window.scrollY;
      root.dataset.scrollDirection = current >= previous ? "down" : "up";
      previous = current;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((node) => {
        const box = node.getBoundingClientRect();
        const progress = Math.max(-1, Math.min(1, (box.top + box.height / 2 - center) / (height + box.height)));
        node.style.setProperty("--parallax", progress.toFixed(4));
      });
      frame = 0;
    };
    const request = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    window.dispatchEvent(new CustomEvent("insepti:motion-change"));

    return () => {
      query.removeEventListener("change", sync);
      mutations.disconnect();
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [adminMotion, pathname]);

  if (!isAdmin) return null;
  const toggle = () => {
    const next = !adminMotion;
    setAdminMotion(next);
    window.localStorage.setItem(ADMIN_MOTION_KEY, next ? "full" : "auto");
  };
  return <button type="button" className={`admin-motion-toggle ${adminMotion ? "is-active" : ""}`} aria-pressed={adminMotion} onClick={toggle}><span aria-hidden="true" />{adminMotion ? "Animation renforcée" : "Activer l’animation"}</button>;
}
