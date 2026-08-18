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
        const space = new THREE.Group();
        space.position.z = -1.8;
        scene.add(space);
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

        const geometries: BufferGeometry[] = [];
        const materials: Material[] = [];
        const starCount = 34;
        const starPositions = new Float32Array(starCount * 3);
        const starColors: number[] = [];
        const starGreen = new THREE.Color("#baff91");
        const starWhite = new THREE.Color("#eef8f3");
        for (let i = 0; i < starCount; i += 1) {
          const seed = Math.sin(i * 9283.17) * 43758.5453;
          const next = Math.sin((i + 17) * 6131.73) * 19731.224;
          const depth = Math.sin((i + 41) * 3917.31) * 8513.77;
          starPositions[i * 3] = (seed - Math.floor(seed) - 0.5) * 13;
          starPositions[i * 3 + 1] = (next - Math.floor(next) - 0.5) * 7.4;
          starPositions[i * 3 + 2] = -1 - (depth - Math.floor(depth)) * 5;
          const color = starWhite.clone().lerp(starGreen, i % 7 === 0 ? 0.75 : 0.08);
          starColors.push(color.r, color.g, color.b);
        }
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute("color", new THREE.Float32BufferAttribute(starColors, 3));
        const starMaterial = new THREE.PointsMaterial({
          size: 0.045,
          vertexColors: true,
          transparent: true,
          opacity: 0.82,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        space.add(new THREE.Points(starGeometry, starMaterial));
        geometries.push(starGeometry);
        materials.push(starMaterial);

        const planets = new THREE.Group();
        space.add(planets);
        const planetSpecs = [
          { radius: 0.72, color: 0x2e682b, emissive: 0x102d12, position: [-3.9, 1.65, -1.2], phase: 0.4, ring: true },
          { radius: 0.94, color: 0x183e4a, emissive: 0x09242d, position: [3.85, -1.55, -0.8], phase: 2.1, ring: true },
          { radius: 0.42, color: 0x7aa35c, emissive: 0x172a10, position: [3.55, 2.05, -2.8], phase: 4.2, ring: false },
          { radius: 0.34, color: 0x69767c, emissive: 0x11191c, position: [-4.25, -2.15, -3.1], phase: 5.4, ring: false },
        ] as const;
        const planetMeshes: Mesh[] = [];
        planetSpecs.forEach((spec) => {
          const planetGeometry = new THREE.SphereGeometry(spec.radius, 32, 20);
          const planetMaterial = new THREE.MeshStandardMaterial({
            color: spec.color,
            emissive: spec.emissive,
            emissiveIntensity: 0.55,
            metalness: 0.18,
            roughness: 0.72,
          });
          const planet = new THREE.Mesh(planetGeometry, planetMaterial);
          planet.position.set(...spec.position);
          planet.userData.baseY = spec.position[1];
          planet.userData.phase = spec.phase;
          planets.add(planet);
          planetMeshes.push(planet);
          geometries.push(planetGeometry);
          materials.push(planetMaterial);
          if (spec.ring) {
            const ringGeometry = new THREE.TorusGeometry(spec.radius * 1.45, 0.022, 8, 96);
            const ringMaterial = new THREE.MeshBasicMaterial({
              color: spec.color === 0x2e682b ? 0x9be15d : 0x24d4d8,
              transparent: true,
              opacity: 0.62,
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.copy(planet.position);
            ring.rotation.set(1.18, 0.22, -0.3);
            planets.add(ring);
            geometries.push(ringGeometry);
            materials.push(ringMaterial);
          }
        });
        let model: Object3D | undefined;
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let pointerActive = false;
        let pointerNX = 0;
        let pointerNY = 0;
        let targetX = 0;
        let targetY = 0;
        const reduced = () => document.documentElement.dataset.motion === "soft";

        const reset = () => {
          targetX = 0;
          targetY = 0;
        };
        const updatePointer = (event: PointerEvent) => {
          const bounds = mount.getBoundingClientRect();
          pointerNX = (event.clientX - bounds.left) / bounds.width - 0.5;
          pointerNY = (event.clientY - bounds.top) / bounds.height - 0.5;
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
          const motionFactor = reduced() ? 0.35 : 1;
          space.position.x += ((pointerActive ? pointerNX * 0.34 : 0) - space.position.x) * 0.035;
          space.position.y += ((pointerActive ? -pointerNY * 0.22 : 0) - space.position.y) * 0.035;
          planetMeshes.forEach((planet) => {
            const baseY = Number(planet.userData.baseY);
            const phase = Number(planet.userData.phase);
            planet.position.y = baseY + Math.sin(time * 0.00045 + phase) * 0.09 * motionFactor;
          });
          starMaterial.opacity = 0.74 + Math.sin(time * 0.0007) * 0.08 * motionFactor;
          const floatX = targetX + Math.sin(time * 0.00052) * 0.12 * motionFactor + (pointerActive ? pointerNX * 0.16 : 0);
          const floatY = targetY + Math.sin(time * 0.00075) * 0.26 * motionFactor + (pointerActive ? -pointerNY * 0.1 : 0);
          rig.position.x += (floatX - rig.position.x) * 0.075;
          rig.position.y += (floatY - rig.position.y) * 0.075;
          const breath = 0.5535 * (1 + (reduced() ? 0.012 : 0.028) * Math.sin(time * 0.0011));
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
            pointerActive = false;
            pointerNX = 0;
            pointerNY = 0;
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
