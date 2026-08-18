"use client";

import { useEffect, useRef, useState } from "react";
import type { BufferGeometry, Material, Mesh, Object3D, Texture } from "three";

export function HomeNetworkScene({ label }: { label: string; fr?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frame = 0;
    let visible = true;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let cleanup = () => {};

    void Promise.all([import("three"), import("three/addons/loaders/GLTFLoader.js")])
      .then(([THREE, { GLTFLoader }]) => {
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.domElement.className = "home-network-canvas";
        renderer.domElement.setAttribute("aria-hidden", "true");
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.z = 10;
        const particles = new THREE.Group();
        particles.position.z = -1.8;
        scene.add(particles);
        const rig = new THREE.Group();
        rig.rotation.set(Math.PI / 2 - 0.06, -0.08, 0);
        scene.add(rig);

        scene.add(new THREE.HemisphereLight(0xeaffdf, 0x031014, 2.7));
        const key = new THREE.DirectionalLight(0xcaff9d, 4.5);
        key.position.set(4, 5, 7);
        scene.add(key);
        const glow = new THREE.PointLight(0x75c044, 12, 18);
        glow.position.set(-3, 2, 4);
        scene.add(glow);
        const cyan = new THREE.PointLight(0x24d4d8, 5, 14);
        cyan.position.set(4, -2, 2);
        scene.add(cyan);

        const rows = 13;
        const samples = 56;
        const count = rows * (samples - 1) * 2;
        const home = new Float32Array(count * 3);
        const colors: number[] = [];
        const green = new THREE.Color("#9be15d");
        const teal = new THREE.Color("#24d4d8");
        let vertex = 0;
        for (let row = 0; row < rows; row += 1) {
          const y = -2.35 + row * (4.7 / (rows - 1));
          const z = -1.8 + Math.sin(row * 0.72) * 0.16;
          const color = green.clone().lerp(teal, row / (rows - 1) * 0.42);
          for (let sample = 0; sample < samples - 1; sample += 1) {
            const x0 = -5.25 + sample * (10.5 / (samples - 1));
            const x1 = -5.25 + (sample + 1) * (10.5 / (samples - 1));
            home.set([x0, y, z, x1, y, z], vertex * 3);
            colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
            vertex += 2;
          }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(home.slice(), 3));
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        const material = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.72,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        particles.add(new THREE.LineSegments(geometry, material));

        const geometries: BufferGeometry[] = [geometry];
        const materials: Material[] = [material];
        let model: Object3D | undefined;
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let pointerX = 99;
        let pointerY = 99;
        let pointerActive = false;
        let targetX = 0;
        let targetY = 0;
        const reduced = () => document.documentElement.dataset.motion === "soft";

        const reset = () => {
          targetX = 0;
          targetY = 0;
        };
        const updatePointer = (event: PointerEvent) => {
          const bounds = mount.getBoundingClientRect();
          pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
          pointerY = -((event.clientY - bounds.top) / bounds.height - 0.5) * 5.8;
          pointerActive = true;
        };
        const down = (event: PointerEvent) => {
          dragging = true;
          lastX = event.clientX;
          lastY = event.clientY;
          mount.setPointerCapture(event.pointerId);
          mount.closest("figure")?.classList.add("is-dragging");
        };
        const move = (event: PointerEvent) => {
          updatePointer(event);
          if (!dragging) return;
          targetX = THREE.MathUtils.clamp(targetX + (event.clientX - lastX) * 0.012, -2.7, 2.7);
          targetY = THREE.MathUtils.clamp(targetY - (event.clientY - lastY) * 0.012, -1.7, 1.7);
          lastX = event.clientX;
          lastY = event.clientY;
        };
        const up = (event: PointerEvent) => {
          dragging = false;
          if (mount.hasPointerCapture(event.pointerId)) mount.releasePointerCapture(event.pointerId);
          mount.closest("figure")?.classList.remove("is-dragging");
        };

        const render = (time = 0) => {
          if (disposed || !visible) return;
          const positions = geometry.attributes.position!.array as Float32Array;
          for (let i = 0; i < count; i += 1) {
            const j = i * 3;
            const hx = home[j] ?? 0;
            const hy = home[j + 1] ?? 0;
            const dx = hx - pointerX;
            const dy = hy - pointerY;
            const influence = pointerActive ? Math.exp(-(dx * dx + dy * dy) / 1.55) : 0;
            const amplitude = reduced() ? 0.1 : 0.28;
            const desiredY = hy + influence * Math.sin(dx * 2.35 + time * 0.0042) * amplitude;
            positions[j] = hx;
            positions[j + 1] = (positions[j + 1] ?? hy) + (desiredY - (positions[j + 1] ?? hy)) * 0.14;
            positions[j + 2] = home[j + 2] ?? 0;
          }
          geometry.attributes.position!.needsUpdate = true;
          rig.position.x += (targetX - rig.position.x) * 0.09;
          rig.position.y += (targetY - rig.position.y) * 0.09;
          const breath = 1.107 * (1 + (reduced() ? 0.012 : 0.028) * Math.sin(time * 0.0011));
          rig.scale.setScalar(breath);
          renderer.render(scene, camera);
          frame = requestAnimationFrame(render);
        };

        new GLTFLoader().load("/brand/insepti-logo-3d.glb", (gltf) => {
          model = gltf.scene;
          let index = 0;
          model.traverse((child) => {
            const mesh = child as Mesh;
            if (!mesh.isMesh) return;
            const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            const branded = source.map(() => {
              const greenTone = index++ % 3 !== 1;
              const nextMaterial = new THREE.MeshStandardMaterial({
                color: greenTone ? 0x75c044 : 0x77868b,
                emissive: greenTone ? 0x183b0d : 0x0b1417,
                emissiveIntensity: greenTone ? 0.52 : 0.15,
                metalness: greenTone ? 0.3 : 0.7,
                roughness: 0.28,
              });
              materials.push(nextMaterial);
              return nextMaterial;
            });
            mesh.material = Array.isArray(mesh.material) ? branded : branded[0]!;
          });
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          model.position.sub(center);
          model.scale.setScalar(6.4 / Math.max(size.x, size.y * 1.45, size.z));
          rig.add(model);
          setStatus("ready");
        }, undefined, () => setStatus("fallback"));

        const resize = () => {
          const width = Math.max(mount.clientWidth, 1);
          const height = Math.max(mount.clientHeight, 1);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(mount);
        intersectionObserver = new IntersectionObserver(([entry]) => {
          const next = Boolean(entry?.isIntersecting);
          if (next === visible) return;
          visible = next;
          if (visible) frame = requestAnimationFrame(render);
          else cancelAnimationFrame(frame);
        }, { threshold: 0.03 });
        intersectionObserver.observe(mount);

        mount.addEventListener("pointerdown", down);
        mount.addEventListener("pointermove", move);
        mount.addEventListener("pointerup", up);
        mount.addEventListener("pointercancel", up);
        mount.addEventListener("pointerleave", () => {
          if (!dragging) {
            pointerX = 99;
            pointerY = 99;
            pointerActive = false;
          }
        });
        mount.addEventListener("dblclick", reset);
        resize();
        render();

        cleanup = () => {
          cancelAnimationFrame(frame);
          mount.removeEventListener("pointerdown", down);
          mount.removeEventListener("pointermove", move);
          mount.removeEventListener("pointerup", up);
          mount.removeEventListener("pointercancel", up);
          mount.removeEventListener("dblclick", reset);
          model?.traverse((child) => {
            const mesh = child as Mesh;
            if (!mesh.isMesh) return;
            mesh.geometry.dispose();
            (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((meshMaterial) => {
              Object.values(meshMaterial).forEach((value) => {
                if ((value as Texture)?.isTexture) (value as Texture).dispose();
              });
            });
          });
          geometries.forEach((item) => item.dispose());
          materials.forEach((item) => item.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => setStatus("fallback"));

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      cleanup();
    };
  }, []);

  return (
    <figure className={`home-network-scene is-${status}`} aria-label={label}>
      <div ref={mountRef} className="home-network-mount" />
    </figure>
  );
}
