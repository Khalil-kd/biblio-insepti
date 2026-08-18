"use client";

import { useEffect, useState } from "react";

export const ADMIN_MOTION_KEY = "insepti-admin-motion";
export const ADMIN_MOTION_EVENT = "insepti:admin-motion-toggle";

export function AdminMotionControl() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(window.localStorage.getItem(ADMIN_MOTION_KEY) === "full");
  }, []);

  const toggle = () => {
    const next = !active;
    setActive(next);
    window.localStorage.setItem(ADMIN_MOTION_KEY, next ? "full" : "auto");
    window.dispatchEvent(new CustomEvent<boolean>(ADMIN_MOTION_EVENT, { detail: next }));
  };

  return (
    <button
      type="button"
      className={`admin-motion-control ${active ? "is-active" : ""}`}
      aria-pressed={active}
      onClick={toggle}
    >
      <span aria-hidden="true" />
      {active ? "Animations activées" : "Activer les animations"}
    </button>
  );
}
