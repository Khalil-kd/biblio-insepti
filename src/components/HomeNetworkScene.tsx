"use client";

import { useEffect, useRef, useState } from "react";
import type { BufferGeometry, Material, Mesh, Object3D, Texture, Vector3 } from "three";

type SceneStatus = "loading" | "ready" | "fallback";
type InteractionMode = "move" | "rotate";

export function HomeNetworkScene({ label, fr = true }: { label: string; fr?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const interactionModeRef = useRef<InteractionMode>("move");
  const resetSceneRef = useRef<() => void>(() => undefined);
  const zoomSceneRef = useRef<(delta: number) => void>(() => undefined);
  const [status, setStatus] = useState<SceneStatus>("loading");
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("move");

  useEffect(() => {
    interactionModeRef.current = interactionMode;
  }, [interactionMode]);

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
        renderer.toneMappingExposure = 1.12;
        renderer.domElement.setAttribute("aria-hidden", "true");
        renderer.domElement.className = "home-network-canvas";
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
        camera.position.set(0, 0.1, 10.2);

        const network = new THREE.Group();
        network.position.z = -2.4;
        network.rotation.set(-0.1, -0.16, 0.04);
        scene.add(network);

        const logoRig = new THREE.Group();
        const restingPitch = Math.PI / 2 - 0.06;
        logoRig.rotation.set(restingPitch, -0.08, 0);
        scene.add(logoRig);

        scene.add(new THREE.HemisphereLight(0xeaffdf, 0x041014, 2.6));
        const keyLight = new THREE.DirectionalLight(0xcaff9d, 4.8);
        keyLight.position.set(4, 5, 7);
        scene.add(keyLight);
        const greenLight = new THREE.PointLight(0x75c044, 14, 18);
        greenLight.position.set(-3.8, 1.8, 3.8);
        scene.add(greenLight);
        const cyanLight = new THREE.PointLight(0x20d3d8, 9, 15);
        cyanLight.position.set(4.4, -2.2, 2.5);
        scene.add(cyanLight);
        const violetLight = new THREE.PointLight(0x8f68ff, 7, 14);
        violetLight.position.set(0.5, 3.6, -1.2);
        scene.add(violetLight);

        const geometries: BufferGeometry[] = [];
        const materials: Material[] = [];
        const strandPalettes = [
          [new THREE.Color("#315f2a"), new THREE.Color("#75c044"), new THREE.Color("#b6f36f")],
          [new THREE.Color("#0f6568"), new THREE.Color("#24d4d8"), new THREE.Color("#75c044")],
          [new THREE.Color("#4c347d"), new THREE.Color("#936dff"), new THREE.Color("#75c044")],
          [new THREE.Color("#7a461e"), new THREE.Color("#ff9f43"), new THREE.Color("#75c044")],
        ] as const;

        for (let strand = 0; strand < 14; strand += 1) {
          const points: Vector3[] = [];
          const colors: number[] = [];
          const phase = strand * 0.57;
          const verticalOffset = (strand - 6.5) * 0.39;
          const palette = strandPalettes[strand % strandPalettes.length]!;
          for (let step = 0; step < 150; step += 1) {
            const progress = step / 149;
            const x = (progress - 0.5) * 11.2;
            const envelope = Math.sin(progress * Math.PI);
            const y = verticalOffset + Math.sin(progress * Math.PI * 2.1 + phase) * 0.5 * envelope;
            const z = Math.cos(progress * Math.PI * 2.7 + phase) * 1.2 * envelope;
            points.push(new THREE.Vector3(x, y, z));
            const blend = (progress + strand / 13) % 1;
            const color = blend < 0.55
              ? palette[0].clone().lerp(palette[1], blend / 0.55)
              : palette[1].clone().lerp(palette[2], (blend - 0.55) / 0.45);
            colors.push(color.r, color.g, color.b);
          }
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
          const material = new THREE.LineBasicMaterial({
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: strand % 4 === 0 ? 0.72 : 0.34,
            transparent: true,
            vertexColors: true,
          });
          network.add(new THREE.Line(geometry, material));
          geometries.push(geometry);
          materials.push(material);
        }

        const nodePositions: number[] = [];
        for (let index = 0; index < 110; index += 1) {
          const progress = index / 109;
          const strand = index % 11;
          nodePositions.push((progress - 0.5) * 10.4, (strand - 5) * 0.46, Math.cos(progress * Math.PI * 5 + strand * 0.61));
        }
        const nodeGeometry = new THREE.BufferGeometry();
        nodeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(nodePositions, 3));
        const nodeMaterial = new THREE.PointsMaterial({
          blending: THREE.AdditiveBlending,
          color: "#b6f36f",
          depthWrite: false,
          opacity: 0.82,
          size: 0.058,
          transparent: true,
        });
        network.add(new THREE.Points(nodeGeometry, nodeMaterial));
        geometries.push(nodeGeometry);
        materials.push(nodeMaterial);

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
        let targetPositionX = 0;
        let targetPositionY = 0;
        let currentPositionX = 0;
        let currentPositionY = 0;
        let targetScale = 1.12;
        let currentScale = targetScale;
        const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        let reducedMotion = false;
        const syncMotionPreference = () => {
          reducedMotion = document.documentElement.dataset.motion === "reduced"
            || (document.documentElement.dataset.motion !== "full" && motionQuery.matches);
        };
        syncMotionPreference();
        motionQuery.addEventListener("change", syncMotionPreference);
        window.addEventListener("insepti:motion-change", syncMotionPreference);

        resetSceneRef.current = () => {
          targetPositionX = 0;
          targetPositionY = 0;
          targetYaw = -0.08;
          targetPitch = restingPitch;
          targetScale = 1.12;
        };
        zoomSceneRef.current = (delta: number) => {
          targetScale = THREE.MathUtils.clamp(targetScale + delta, 0.72, 1.68);
        };

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
          mount.closest(".home-network-scene")?.classList.add("is-dragging");
        };
        const onPointerMove = (event: PointerEvent) => {
          updatePointerTarget(event);
          if (!dragging) return;
          const deltaX = event.clientX - previousX;
          const deltaY = event.clientY - previousY;
          if (interactionModeRef.current === "move") {
            targetPositionX = THREE.MathUtils.clamp(targetPositionX + deltaX * 0.012, -2.75, 2.75);
            targetPositionY = THREE.MathUtils.clamp(targetPositionY - deltaY * 0.012, -1.75, 1.75);
          } else {
            targetYaw += deltaX * 0.012;
            targetPitch = THREE.MathUtils.clamp(targetPitch + deltaY * 0.008, restingPitch - 0.84, restingPitch + 0.84);
          }
          previousX = event.clientX;
          previousY = event.clientY;
        };
        const endDrag = (event: PointerEvent) => {
          dragging = false;
          if (mount.hasPointerCapture(event.pointerId)) mount.releasePointerCapture(event.pointerId);
          mount.closest(".home-network-scene")?.classList.remove("is-dragging");
        };
        const onPointerLeave = () => {
          if (!dragging) {
            pointerTargetX = 0;
            pointerTargetY = 0;
          }
        };
        const onWheel = (event: WheelEvent) => {
          if (!event.ctrlKey && !event.metaKey) return;
          event.preventDefault();
          targetScale = THREE.MathUtils.clamp(targetScale - event.deltaY * 0.00075, 0.72, 1.68);
        };
        const render = (time = 0) => {
          if (!visible || disposed) return;
          pointerX += (pointerTargetX - pointerX) * 0.05;
          pointerY += (pointerTargetY - pointerY) * 0.05;
          if (!dragging && !reducedMotion) targetYaw += 0.00135;
          currentYaw += (targetYaw - currentYaw) * 0.09;
          currentPitch += (targetPitch - currentPitch) * 0.09;
          currentPositionX += (targetPositionX - currentPositionX) * 0.1;
          currentPositionY += (targetPositionY - currentPositionY) * 0.1;
          currentScale += (targetScale - currentScale) * 0.1;
          logoRig.rotation.y = currentYaw;
          logoRig.rotation.x = currentPitch;
          logoRig.position.x = currentPositionX;
          logoRig.position.y = currentPositionY + (reducedMotion ? 0 : Math.sin(time * 0.0011) * 0.09);
          logoRig.scale.setScalar(currentScale);
          network.rotation.y = -0.16 + pointerX * 0.1 + (reducedMotion ? 0 : time * 0.000022);
          network.rotation.x = -0.1 + pointerY * 0.07;
          network.position.y = reducedMotion ? 0 : Math.sin(time * 0.00065) * 0.08;
          renderer.render(scene, camera);
          frame = window.requestAnimationFrame(render);
        };

        new GLTFLoader().load("/brand/insepti-logo-3d.glb", (gltf) => {
          if (disposed) return;
          model = gltf.scene;
          let materialIndex = 0;
          const palette = [
            { color: 0x75c044, emissive: 0x193d0c, intensity: 0.62, metalness: 0.28 },
            { color: 0x8a969b, emissive: 0x10191c, intensity: 0.2, metalness: 0.72 },
            { color: 0x24d4d8, emissive: 0x073d40, intensity: 0.46, metalness: 0.42 },
            { color: 0x936dff, emissive: 0x25164c, intensity: 0.4, metalness: 0.5 },
            { color: 0xff9f43, emissive: 0x4d2305, intensity: 0.36, metalness: 0.36 },
          ] as const;
          model.traverse((child) => {
            const mesh = child as Mesh;
            if (!mesh.isMesh) return;
            const usesArray = Array.isArray(mesh.material);
            const source: Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            const branded = source.map(() => {
              const tone = palette[materialIndex++ % palette.length]!;
              const material = new THREE.MeshStandardMaterial({
                color: tone.color,
                emissive: tone.emissive,
                emissiveIntensity: tone.intensity,
                metalness: tone.metalness,
                roughness: 0.26,
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
          model.scale.setScalar(5.8 / Math.max(size.x, size.y * 1.45, size.z));
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
        mount.addEventListener("wheel", onWheel, { passive: false });
        resize();
        render();

        cleanupScene = () => {
          window.cancelAnimationFrame(frame);
          motionQuery.removeEventListener("change", syncMotionPreference);
          window.removeEventListener("insepti:motion-change", syncMotionPreference);
          mount.removeEventListener("pointerdown", onPointerDown);
          mount.removeEventListener("pointermove", onPointerMove);
          mount.removeEventListener("pointerup", endDrag);
          mount.removeEventListener("pointercancel", endDrag);
          mount.removeEventListener("pointerleave", onPointerLeave);
          mount.removeEventListener("wheel", onWheel);
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
      <div className="home-network-controls" role="group" aria-label={fr ? "Contrôles du logo 3D" : "3D logo controls"}>
        <button type="button" className={interactionMode === "move" ? "is-active" : ""} onClick={() => setInteractionMode("move")}>{fr ? "Déplacer" : "Move"}</button>
        <button type="button" className={interactionMode === "rotate" ? "is-active" : ""} onClick={() => setInteractionMode("rotate")}>{fr ? "Tourner" : "Rotate"}</button>
        <button type="button" className="is-icon" aria-label={fr ? "Réduire le logo" : "Zoom out"} title={fr ? "Réduire" : "Zoom out"} onClick={() => zoomSceneRef.current(-0.18)}>−</button>
        <button type="button" className="is-icon" aria-label={fr ? "Agrandir le logo" : "Zoom in"} title={fr ? "Agrandir" : "Zoom in"} onClick={() => zoomSceneRef.current(0.18)}>+</button>
        <button type="button" onClick={() => resetSceneRef.current()}>{fr ? "Recentrer" : "Reset"}</button>
      </div>
      <figcaption>
        <span><i /> INSEPTI Neural Grid</span>
        <b>{fr ? "Glisser · Ctrl + molette · 360°" : "Drag · Ctrl + wheel · 360°"}</b>
      </figcaption>
    </figure>
  );
}
