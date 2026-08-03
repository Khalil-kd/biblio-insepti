"use client";

import { lazy, Suspense, useEffect, useRef, useState, type PointerEvent } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

export function LoginSplineScene() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!window.matchMedia("(max-width: 900px)").matches);
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotionRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const bounds = stage.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * -18;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -14;
    stage.style.setProperty("--spline-x", `${x}px`);
    stage.style.setProperty("--spline-y", `${y}px`);
  }

  function resetPointer() {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--spline-x", "0px");
    stage.style.setProperty("--spline-y", "0px");
  }

  return (
    <div
      ref={stageRef}
      className={`login-spline-stage${ready ? " is-ready" : ""}`}
      aria-hidden="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div className="login-spline-drift">
        {enabled ? (
          <Suspense fallback={<div className="login-spline-loader" />}>
            <Spline
              className="login-spline-visual"
              scene="/brand/insepti-flow.splinecode"
              renderOnDemand
              onLoad={() => setReady(true)}
            />
          </Suspense>
        ) : <div className="login-spline-loader" />}
      </div>
      <div className="login-spline-vignette" />
    </div>
  );
}
