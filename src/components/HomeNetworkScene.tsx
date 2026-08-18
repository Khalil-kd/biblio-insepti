"use client";

import { useEffect, useRef, useState } from "react";
import type { BufferGeometry, Material, Mesh, Object3D, Texture } from "three";

export function HomeNetworkScene({ label, fr = true }: { label: string; fr?: boolean }) {
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

        const count = 170;
        const home = new Float32Array(count * 3);
        const velocity = new Float32Array(count * 3);
        const colors: number[] = [];
        const green = new THREE.Color("#9be15d");
        const teal = new THREE.Color("#24d4d8");
        for (let i = 0; i < count; i += 1) {
          const angle = i * 0.61803398875 * Math.PI * 2;
          const radius = 1.5 + ((i * 37) % 100) / 100 * 4.1;
          home[i * 3] = Math.cos(angle) * radius;
          home[i * 3 + 1] = Math.sin(angle) * radius * 0.58;
          home[i * 3 + 2] = Math.sin(angle * 1.7) * 0.8 - 1;
          const color = green.clone().lerp(teal, (i % 11) / 18);
          colors.push(color.r, color.g, color.b);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(home.slice(), 3));
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        const arrowCanvas = document.createElement("canvas");
        arrowCanvas.width = 32;
        arrowCanvas.height = 32;
        const arrowContext = arrowCanvas.getContext("2d");
        if (arrowContext) {
          arrowContext.translate(16, 16);
          arrowContext.fillStyle = "#ffffff";
          arrowContext.beginPath();
          arrowContext.moveTo(-11, -2.4);
          arrowContext.lineTo(4, -2.4);
          arrowContext.lineTo(4, -8);
          arrowContext.lineTo(12, 0);
          arrowContext.lineTo(4, 8);
          arrowContext.lineTo(4, 2.4);
          arrowContext.lineTo(-11, 2.4);
          arrowContext.closePath();
          arrowContext.fill();
        }
        const arrowTexture = new THREE.CanvasTexture(arrowCanvas);
        arrowTexture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.PointsMaterial({
          size: 0.115,
          map: arrowTexture,
          alphaTest: 0.08,
          vertexColors: true,
          transparent: true,
          opacity: 0.82,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        particles.add(new THREE.Points(geometry, material));

        const geometries: BufferGeometry[] = [geometry];
        const materials: Material[] = [material];
        let model: Object3D | undefined;
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let pointerX = 99;
        let pointerY = 99;
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
          const force = reduced() ? 0.004 : 0.011;
          for (let i = 0; i < count; i += 1) {
            const j = i * 3;
            const px = positions[j] ?? 0;
            const py = positions[j + 1] ?? 0;
            const pz = positions[j + 2] ?? 0;
            const dx = px - pointerX;
            const dy = py - pointerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            let vx = velocity[j] ?? 0;
            let vy = velocity[j + 1] ?? 0;
            let vz = velocity[j + 2] ?? 0;
            if (distance < 1.45) {
              const push = (1 - distance / 1.45) * force;
              vx += dx / (distance + 0.01) * push;
              vy += dy / (distance + 0.01) * push;
            }
            vx = (vx + ((home[j] ?? 0) - px) * 0.012) * 0.91;
            vy = (vy + ((home[j + 1] ?? 0) - py) * 0.012) * 0.91;
            vz = (vz + ((home[j + 2] ?? 0) - pz) * 0.01) * 0.91;
            velocity[j] = vx;
            velocity[j + 1] = vy;
            velocity[j + 2] = vz;
            positions[j] = px + vx + Math.sin(time * 0.0005 + i) * 0.00035;
            positions[j + 1] = py + vy + Math.cos(time * 0.00045 + i) * 0.0003;
            positions[j + 2] = pz + vz;
          }
          geometry.attributes.position!.needsUpdate = true;
          rig.position.x += (targetX - rig.position.x) * 0.09;
          rig.position.y += (targetY - rig.position.y) * 0.09;
          const breath = 1.23 * (1 + (reduced() ? 0.012 : 0.028) * Math.sin(time * 0.0011));
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
          arrowTexture.dispose();
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
      <figcaption><b>{fr ? "Glisser pour déplacer · double-clic pour recentrer" : "Drag to move · double-click to reset"}</b></figcaption>
    </figure>
  );
}
