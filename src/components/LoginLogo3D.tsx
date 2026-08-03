"use client";

import { useEffect, useRef, useState } from "react";
import type { Material, Mesh, Object3D, Texture } from "three";

type SceneStatus = "loading" | "ready" | "fallback";

export function LoginLogo3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<SceneStatus>("loading");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || window.matchMedia("(max-width: 900px)").matches) return;

    let disposed = false;
    let frame = 0;
    let resizeObserver: ResizeObserver | undefined;
    let intersectionObserver: IntersectionObserver | undefined;
    let cleanupScene = () => {};

    void Promise.all([
      import("three"),
      import("three/addons/loaders/GLTFLoader.js"),
    ]).then(([THREE, { GLTFLoader }]) => {
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
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;
        renderer.domElement.className = "login-logo-3d-canvas";
        renderer.domElement.setAttribute("aria-hidden", "true");
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.set(0, 0.15, 8.4);

        const logoRig = new THREE.Group();
        const restingRotationX = Math.PI / 2 - 0.08;
        logoRig.rotation.set(restingRotationX, -0.12, 0.01);
        scene.add(logoRig);

        scene.add(new THREE.HemisphereLight(0xeaffdf, 0x071014, 2.6));
        const keyLight = new THREE.DirectionalLight(0xcaff9d, 4.4);
        keyLight.position.set(3.5, 5, 7);
        scene.add(keyLight);
        const rimLight = new THREE.DirectionalLight(0x75c044, 3.2);
        rimLight.position.set(-5, 0.5, -2);
        scene.add(rimLight);

        let model: Object3D | undefined;
        let visible = true;
        let pointerX = 0;
        let pointerY = 0;
        let targetX = 0;
        let targetY = 0;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const render = (time = 0) => {
          if (!visible || disposed) return;
          pointerX += (targetX - pointerX) * 0.075;
          pointerY += (targetY - pointerY) * 0.075;
          logoRig.rotation.y = -0.12 + pointerX * 0.62;
          logoRig.rotation.x = restingRotationX + pointerY * 0.22;
          logoRig.rotation.z = reducedMotion ? 0.01 : 0.01 + Math.sin(time * 0.0007) * 0.012;
          renderer.render(scene, camera);
          frame = window.requestAnimationFrame(render);
        };

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

        new GLTFLoader().load(
          "/brand/insepti-logo-3d.glb",
          (gltf) => {
            if (disposed) return;
            model = gltf.scene;

            let materialIndex = 0;
            model.traverse((child) => {
              const mesh = child as Mesh;
              if (!mesh.isMesh) return;
              const usesMaterialArray = Array.isArray(mesh.material);
              const sourceMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              const brandedMaterials = sourceMaterials.map(() => {
                const isGreen = materialIndex++ % 2 === 1;
                return new THREE.MeshStandardMaterial({
                  color: isGreen ? 0x75c044 : 0x7d878c,
                  emissive: isGreen ? 0x172f0c : 0x101619,
                  emissiveIntensity: isGreen ? 0.42 : 0.18,
                  metalness: isGreen ? 0.28 : 0.72,
                  roughness: isGreen ? 0.3 : 0.24,
                });
              });
              mesh.material = usesMaterialArray ? brandedMaterials : brandedMaterials[0]!;
            });

            const bounds = new THREE.Box3().setFromObject(model);
            const center = bounds.getCenter(new THREE.Vector3());
            const size = bounds.getSize(new THREE.Vector3());
            model.position.sub(center);
            const scale = 5.15 / Math.max(size.x, size.y * 1.45, size.z);
            model.scale.setScalar(scale);
            logoRig.add(model);
            setStatus("ready");
            resize();
          },
          undefined,
          () => setStatus("fallback"),
        );

        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(mount);
        intersectionObserver = new IntersectionObserver(([entry]) => {
          if (!entry) return;
          const nextVisible = entry.isIntersecting;
          if (nextVisible === visible) return;
          visible = nextVisible;
          if (visible) frame = window.requestAnimationFrame(render);
          else window.cancelAnimationFrame(frame);
        }, { threshold: 0.05 });
        intersectionObserver.observe(mount);
        mount.addEventListener("pointermove", onPointerMove);
        mount.addEventListener("pointerleave", onPointerLeave);
        resize();
        render();

        cleanupScene = () => {
          window.cancelAnimationFrame(frame);
          mount.removeEventListener("pointermove", onPointerMove);
          mount.removeEventListener("pointerleave", onPointerLeave);
          model?.traverse((child) => {
            const mesh = child as Mesh;
            if (!mesh.isMesh) return;
            mesh.geometry.dispose();
            const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as Material[];
            materials.forEach((material) => {
              Object.values(material).forEach((value) => {
                if ((value as Texture)?.isTexture) (value as Texture).dispose();
              });
              material.dispose();
            });
          });
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
    <figure className={`login-logo-3d is-${status}`} aria-label="Logo INSEPTI interactif en trois dimensions">
      <div ref={mountRef} className="login-logo-3d-mount" />
      <div className="login-logo-3d-orbit" aria-hidden="true" />
      <figcaption><span>Bougez la souris</span><i aria-hidden="true">↔</i></figcaption>
    </figure>
  );
}
