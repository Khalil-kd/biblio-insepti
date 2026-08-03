"use client";

import { useEffect, useRef, useState } from "react";
import type { BufferGeometry, Material, Vector3 } from "three";

type SceneStatus = "loading" | "ready" | "fallback";

export function HomeNetworkScene({ label }: { label: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<SceneStatus>("loading");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frame = 0;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let cleanupScene = () => {};

    void import("three").then((THREE) => {
      if (disposed) return;

      try {
        const renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.className = "home-network-canvas";
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.set(0, 0, 11.5);

        const network = new THREE.Group();
        network.rotation.set(-0.12, -0.16, 0.04);
        scene.add(network);

        const geometries: BufferGeometry[] = [];
        const materials: Material[] = [];
        const colorStops = [
          new THREE.Color("#315f2a"),
          new THREE.Color("#75c044"),
          new THREE.Color("#b6f36f"),
        ] as const;

        for (let strand = 0; strand < 11; strand += 1) {
          const points: Vector3[] = [];
          const colors: number[] = [];
          const phase = strand * 0.57;
          const verticalOffset = (strand - 5) * 0.47;

          for (let step = 0; step < 150; step += 1) {
            const progress = step / 149;
            const x = (progress - 0.5) * 10.6;
            const envelope = Math.sin(progress * Math.PI);
            const y = verticalOffset + Math.sin(progress * Math.PI * 2.1 + phase) * 0.55 * envelope;
            const z = Math.cos(progress * Math.PI * 2.7 + phase) * 1.35 * envelope + Math.sin(phase) * 0.35;
            points.push(new THREE.Vector3(x, y, z));

            const blend = (progress + strand / 10) % 1;
            const color = blend < 0.55
              ? colorStops[0].clone().lerp(colorStops[1], blend / 0.55)
              : colorStops[1].clone().lerp(colorStops[2], (blend - 0.55) / 0.45);
            colors.push(color.r, color.g, color.b);
          }

          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
          const material = new THREE.LineBasicMaterial({
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: strand % 3 === 0 ? 0.86 : 0.58,
            transparent: true,
            vertexColors: true,
          });
          const line = new THREE.Line(geometry, material);
          line.rotation.x = (strand - 5) * 0.008;
          network.add(line);
          geometries.push(geometry);
          materials.push(material);
        }

        const nodePositions: number[] = [];
        for (let index = 0; index < 78; index += 1) {
          const progress = index / 77;
          const strand = index % 9;
          nodePositions.push(
            (progress - 0.5) * 10.1,
            (strand - 4) * 0.54 + Math.sin(progress * Math.PI * 4 + strand) * 0.24,
            Math.cos(progress * Math.PI * 5 + strand * 0.61) * 1.18,
          );
        }
        const nodeGeometry = new THREE.BufferGeometry();
        nodeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(nodePositions, 3));
        const nodeMaterial = new THREE.PointsMaterial({
          blending: THREE.AdditiveBlending,
          color: "#b6f36f",
          depthWrite: false,
          opacity: 0.8,
          size: 0.055,
          transparent: true,
        });
        network.add(new THREE.Points(nodeGeometry, nodeMaterial));
        geometries.push(nodeGeometry);
        materials.push(nodeMaterial);

        let pointerX = 0;
        let pointerY = 0;
        let targetX = 0;
        let targetY = 0;
        let visible = true;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const resize = () => {
          const width = Math.max(mount.clientWidth, 1);
          const height = Math.max(mount.clientHeight, 1);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };
        const onPointerMove = (event: PointerEvent) => {
          const bounds = mount.getBoundingClientRect();
          targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
          targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
        };
        const onPointerLeave = () => {
          targetX = 0;
          targetY = 0;
        };
        const render = (time = 0) => {
          if (!visible || disposed) return;
          pointerX += (targetX - pointerX) * 0.045;
          pointerY += (targetY - pointerY) * 0.045;
          network.rotation.y = -0.16 + pointerX * 0.19 + (reducedMotion ? 0 : time * 0.000035);
          network.rotation.x = -0.12 + pointerY * 0.12;
          camera.position.x = pointerX * 0.42;
          camera.position.y = -pointerY * 0.28;
          camera.lookAt(0, 0, 0);
          renderer.render(scene, camera);
          if (!reducedMotion) frame = window.requestAnimationFrame(render);
        };

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(mount);
        intersectionObserver = new IntersectionObserver(([entry]) => {
          if (!entry) return;
          const nextVisible = entry.isIntersecting;
          if (nextVisible === visible) return;
          visible = nextVisible;
          if (visible && !reducedMotion) frame = window.requestAnimationFrame(render);
          if (!visible) window.cancelAnimationFrame(frame);
        }, { threshold: 0.05 });
        intersectionObserver.observe(mount);
        mount.addEventListener("pointermove", onPointerMove);
        mount.addEventListener("pointerleave", onPointerLeave);
        resize();
        render();
        setStatus("ready");

        cleanupScene = () => {
          window.cancelAnimationFrame(frame);
          mount.removeEventListener("pointermove", onPointerMove);
          mount.removeEventListener("pointerleave", onPointerLeave);
          geometries.forEach((geometry) => geometry.dispose());
          materials.forEach((material) => material.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        setStatus("fallback");
      }
    }).catch(() => setStatus("fallback"));

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      cleanupScene();
    };
  }, []);

  return (
    <figure className={`home-network-scene is-${status}`} aria-label={label}>
      <div ref={mountRef} className="home-network-mount" />
      <div className="home-network-grid" aria-hidden="true" />
      <figcaption>
        <span><i /> INSEPTI Neural Grid</span>
        <b>LIVE · 3D</b>
      </figcaption>
    </figure>
  );
}
