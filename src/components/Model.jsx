import { Suspense, useMemo } from "react";
import { useGLTF, Decal } from "@react-three/drei";
import * as THREE from "three";
import * as makerjs from "makerjs";
import opentype from "opentype.js";
import { svgToTexture } from "../utils/svgToTexture";
import Loader from "./Loader";

function GlassModel({ url, text = "Hello CAD", fontBuffer }) {
  const { scene } = useGLTF(url);

  // ✅ Extract mesh data properly
  const meshData = useMemo(() => {
    let found = null;

    scene.traverse((child) => {
      if (child.isMesh && !found) {
        found = {
          geometry: child.geometry,
          position: child.position.clone(),
          rotation: child.rotation.clone(),
          scale: child.scale.clone(),
        };
      }
    });

    return found;
  }, [scene]);

  // ✅ Generate SVG texture
  const { texture, aspect } = useMemo(() => {
    if (!fontBuffer) return { texture: null, aspect: 1 };
    if (text.length === 0) return { texture: null, aspect: 1 };
    const font = opentype.parse(fontBuffer);
    const path = font.getPath(text, 0, 0, 100);

    const svgPath = path.toPathData(2);
    const model = makerjs.importer.fromSVGPathData(svgPath);

    const m = makerjs.measure.modelExtents(model);
    const width = m.high[0] - m.low[0];
    const height = m.high[1] - m.low[1];

    // center text
    makerjs.model.move(model, [-m.low[0] - width / 2, -m.low[1] - height / 2]);

    const svg = makerjs.exporter.toSVG(model, {
      fill: "#6e6e6e",
      stroke: "none",
      useSvgPathOnly: true,
    });

    return {
      texture: svgToTexture(svg),
      aspect: width / height,
    };
  }, [text, fontBuffer]);

  const { position, scale } = useMemo(() => {
    if (!meshData) return { position: [0, 0, 0], scale: [1, 1, 1] };

    const tempMesh = new THREE.Mesh(meshData.geometry);
    tempMesh.position.copy(meshData.position);
    tempMesh.rotation.copy(meshData.rotation);
    tempMesh.scale.copy(meshData.scale);

    const box = new THREE.Box3().setFromObject(tempMesh);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    const meshWidth = size.x;

    // 🎯 RULE: max height = 10% of mesh width
    const maxHeight = meshWidth * 0.2;

    // compute width from aspect
    let width = maxHeight * aspect;
    let height = maxHeight;

    const maxWidth = meshWidth * 0.9;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspect;
    }

    const shrinkFactor = 0.35; // 40% of current (i.e. 60% smaller)

    return {
      position: [center.x, center.y - 1, box.max.z + 0.01],
      scale: [
        width * shrinkFactor,
        height * shrinkFactor,
        height * 3 * shrinkFactor,
      ],
    };
  }, [meshData, aspect]);

  if (!meshData) return null;

  return (
    <mesh
      geometry={meshData.geometry}
      position={meshData.position}
      rotation={meshData.rotation}
      scale={meshData.scale}
    >
      {/* Glass material */}
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={0.05}
        roughness={0.0}
        transmission={1}
        ior={2.086}
        thickness={0.5}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />

      {/* ✅ Decal safely inside mesh */}
      {texture && (
        <Decal
          key={text}
          position={position}
          rotation={[0, 0, 0]}
          scale={scale}
          map={texture}
          transparent
          polygonOffset
          polygonOffsetFactor={-1}
        />
      )}
    </mesh>
  );
}

export default function Model({ url, text, fontBuffer }) {
  return (
    <Suspense fallback={<Loader />}>
      <GlassModel url={url} text={text} fontBuffer={fontBuffer} />
    </Suspense>
  );
}
