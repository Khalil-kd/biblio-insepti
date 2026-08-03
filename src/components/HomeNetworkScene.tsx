"use client";

import { useEffect, useRef, useState } from "react";
import type { BufferGeometry, Material, Mesh, Object3D, Texture, Vector3 } from "three";

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

    void Promise.all([
      import("three"),
      import("three/addons/loaders/GLTFLoader.js"),
    ]).then(([THREE, { GLTFLoader }]) => {
      if (disposed) return;

      try {
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.className = "home-network-canvas";
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
        camera.position.set(0, 0.2, 10.4);

        const network = new THREE.Group();
        network.position.z = -1.8;
        network.rotation.set(-0.12, -0.16, 0.04);
        scene.add(network);

        const logoRig = new THREE.Group();
        const restingPitch = Math.PI / 2 - 0.06;
        logoRig.rotation.set(restingPitch, -0.08, 0);
        scene.add(logoRig);

        scene.add(new THREE.HemisphereLight(0xeaffdf, 0x061014, 2.5));
        const keyLight = new THREE.DirectionalLight(0xcaff9d, 4.2);
        keyLight.position.set(4, 5, 7);
        scene.add(keyLight);
        const rimLight = new THREE.DirectionalLight(0x75c044, 3.4);
        rimLight.position.set(-5, 0, -2);
        scene.add(rimLight);

        const geometries: BufferGeometry[] = [];
        const materials: Material[] = [];
        const colorStops = [new THREE.Color("#315f2a"), new THREE.Color("#75c044"), new THREE.Color("#b6f36f")] as const;

        for (let strand = 0; strand < 12; strand += 1) {
          const points: Vector3[] = [];
          const colors: number[] = [];
          const phase = strand * 0.57;
          const verticalOffset = (strand - 5.5) * 0.44;
          for (let step = 0; step < 150; step += 1) {
            const progress = step / 149;
            const x = (progress - 0.5) * 10.8;
            const envelope = Math.sin(progress * Math.PI);
            const y = verticalOffset + Math.sin(progress * Math.PI * 2.1 + phase) * 0.52 * envelope;
            const z = Math.cos(progress * Math.PI * 2.7 + phase) * 1.25 * envelope;
            points.push(new THREE.Vector3(x, y, z));
            const blend = (progress + strand / 11) % 1;
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
            opacity: strand % 3 === 0 ? 0.68 : 0.38,
            transparent: true,
            vertexColors: true,
          });
          network.add(new THREE.Line(geometry, material));
          geometries.push(geometry);
          materials.push(material);
        }

        const nodePositions: number[] = [];
        for (let index = 0; index < 90; index += 1) {
          const progress = index / 89;
          const strand = index % 10;
          nodePositions.push((progress - 0.5) * 10.2, (strand - 4.5) * 0.5, Math.cos(progress * Math.PI * 5 + strand * 0.61));
        }
        const nodeGeometry = new THREE.BufferGeometry();
        nodeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(nodePositions, 3));
        const nodeMaterial = new THREE.PointsMaterial({
          blending: THREE.AdditiveBlending,
          color: "#b6f36f",
          depthWrite: false,
          opacity: 0.76,
          size: 0.055,
          transparent: true,
        });
        network.add(new THREE.Points(nodeGeometry, nodeMaterial));
        geometries.push(nodeGeometry);
        materials.push(nodeMaterial);

        const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x75c044, opacity: 0.16, transparent: true });
        materials.push(orbitMaterial);
        for (const [radius, tilt] of [[3.45, 0.42], [3.9, -0.34], [4.35, 0.16]] as const) {
          const orbitGeometry = new THREE.TorusGeometry(radius, 0.012, 6, 160);
          const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
          orbit.rotation.set(Math.PI / 2 + tilt, tilt * 0.5, tilt);
          scene.add(orbit);
          geometries.push(orbitGeometry);
        }

        let model: Object3D | undefined;
        let visible = true;
        let dragging = false;
        let pointerX = 0;
        let pointerY = 0;
        let pointerTargetX = 0;
        let pointerTargetY = 0;
        let previousX = 0;
        let previousY = 0;
        let targetYaw = -0.08;
        let targetPitch = restingPitch;
        let currentYaw = targetYaw;
        let currentPitch = targetPitch;
        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        let reducedMotion = motionQuery.matches;
        const onMotionPreference = (event: MediaQueryListEvent) => { reducedMotion = event.matches; };
        motionQuery.addEventListener("change", onMotionPreference);

        const resize = () => {
          const width = Math.max(mount.clientWidth, 1);
          const height = Math.max(mount.clientHeight, 1);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };
        const updatePointerTarget = (event: PointerEvent) => {
          const bounds = mount.getBoundingClientRect();
          pointerTargetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
          pointerTargetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
        };
        const onPointerDown = (event: PointerEvent) => {
          dragging = true;
          previousX = event.clientX;
          previousY = event.clientY;
          mount.setPointerCapture(event.pointerId);
          mount.classList.add("is-dragging");
        };
        const onPointerMove = (event: PointerEvent) => {
          updatePointerTarget(event);
          if (!dragging) return;
          targetYaw += (event.clientX - previousX) * 0.012;
          targetPitch = THREE.MathUtils.clamp(targetPitch + (event.clientY - previousY) * 0.008, restingPitch - 0.78, restingPitch + 0.78);
          previousX = event.clientX;
          previousY = event.clientY;
        };
        const endDrag = (event: PointerEvent) => {
          dragging = false;
          if (mount.hasPointerCapture(event.pointerId)) mount.releasePointerCapture(event.pointerId);
          mount.classList.remove("is-dragging");
        };
        const onPointerLeave = () => {
          if (!dragging) {
            pointerTargetX = 0;
            pointerTargetY = 0;
          }
        };
        const render = (time = 0) => {
          if (!visible || disposed) return;
          pointerX += (pointerTargetX - pointerX) * 0.05;
          pointerY += (pointerTargetY - pointerY) * 0.05;
          if (!dragging && !reducedMotion) targetYaw += 0.0011;
          currentYaw += (targetYaw - currentYaw) * 0.09;
          currentPitch += (targetPitch - currentPitch) * 0.09;
          logoRig.rotation.y = currentYaw;
          logoRig.rotation.x = currentPitch;
          network.rotation.y = -0.16 + pointerX * 0.12 + (reducedMotion ? 0 : time * 0.000025);
          network.rotation.x = -0.12 + pointerY * 0.08;
          network.position.y = reducedMotion ? 0 : Math.sin(time * 0.0007) * 0.08;
          renderer.render(scene, camera);
          frame = window.requestAnimationFrame(render);
        };

        new GLTFLoader().load("/brand/insepti-logo-3d.glb", (gltf) => {
          if (disposed) return;
          model = gltf.scene;
          let materialIndex = 0;
          model.traverse((child) => {
            const mesh = child as Mesh;
            if (!mesh.isMesh) return;
            const usesArray = Array.isArray(mesh.material);
            const source: Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            const branded = source.map(() => {
              const isGreen = materialIndex++ % 2 === 1;
              const material = new THREE.MeshStandardMaterial({
                color: isGreen ? 0x75c044 : 0x7d878c,
                emissive: isGreen ? 0x172f0c : 0x101619,
                emissiveIntensity: isGreen ? 0.4 : 0.16,
                metalness: isGreen ? 0.28 : 0.7,
                roughness: isGreen ? 0.3 : 0.24,
              });
              materials.push(material);
              return material;
            });
            mesh.material = usesArray ? branded : branded[0]!;
          });
          const bounds = new THREE.Box3().setFromObject(model);
          const center = bounds.getCenter(new THREE.Vector3());
          const size = bounds.getSize(new THREE.Vector3());
          model.position.sub(center);
          model.scale.setScalar(4.75 / Math.max(size.x, size.y * 1.45, size.z));
          logoRig.add(model);
          setStatus("ready");
          resize();
        }, undefined, () => setStatus("fallback"));

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
        mount.addEventListener("pointerdown", onPointerDown);
        mount.addEventListener("pointermove", onPointerMove);
        mount.addEventListener("pointerup", endDrag);
        mount.addEventListener("pointercancel", endDrag);
        mount.addEventListener("pointerleave", onPointerLeave);
        resize();
        render();

        cleanupScene = () => {
          window.cancelAnimationFrame(frame);
          motionQuery.removeEventListener("change", onMotionPreference);
          mount.removeEventListener("pointerdown", onPointerDown);
          mount.removeEventListener("pointermove", onPointerMove);
          mount.removeEventListener("pointerup", endDrag);
          mount.removeEventListener("pointercancel", endDrag);
          mount.removeEventListener("pointerleave", onPointerLeave);
          model?.traverse((child) => {
            const mesh = child as Mesh;
            if (!mesh.isMesh) return;
            mesh.geometry.dispose();
            const meshMaterials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as Material[];
            meshMaterials.forEach((material) => Object.values(material).forEach((value) => {
              if ((value as Texture)?.isTexture) (value as Texture).dispose();
            }));
          });
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
        <b>Glisser · orbite 360°</b>
      </figcaption>
    </figure>
  );
}
