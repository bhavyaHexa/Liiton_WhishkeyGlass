import { Suspense, useMemo, useEffect } from "react";
import { useGLTF, Decal, Center, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import * as makerjs from "makerjs";
import opentype from "opentype.js";
import { svgToTexture } from "../utils/svgToTexture";
import Loader from "./Loader";

function GlassModel({ url, text = "Hello CAD", fontBuffer, onUpdateOffset }) {
  const { nodes } = useGLTF(url);
  const scene = nodes.Scene || nodes;

  // ✅ Extract mesh data properly for Decal positioning
  const meshData = useMemo(() => {
    const mainMesh = nodes.Glass_Main || Object.values(nodes).find(n => n.isMesh);
    if (!mainMesh) return null;

    return {
      geometry: mainMesh.geometry,
      position: mainMesh.position.clone(),
      rotation: mainMesh.rotation.clone(),
      scale: mainMesh.scale.clone(),
    };
  }, [nodes]);

  // ✅ Generate SVG texture
  const { texture, aspect, svgWidth, svgHeight } = useMemo(() => {
    if (!fontBuffer || text.length === 0) return { texture: null, aspect: 1, svgWidth: 0, svgHeight: 0 };

    const font = opentype.parse(fontBuffer);
    const path = font.getPath(text, 0, 0, 88.5); // Calibrated to ~39.1mm width for "Test Order"
    const svgPath = path.toPathData(2);

    const model = makerjs.importer.fromSVGPathData(svgPath);
    const m = makerjs.measure.modelExtents(model);

    const width = m.high[0] - m.low[0];
    const height = m.high[1] - m.low[1];

    makerjs.model.move(model, [-m.low[0] - width / 2, -m.low[1] - height / 2]);

    const svg = makerjs.exporter.toSVG(model, {
      fill: "#6e6e6e",
      stroke: "none",
      useSvgPathOnly: true,
    });

    return {
      texture: svgToTexture(svg),
      aspect: width / height,
      svgWidth: width,
      svgHeight: height
    };
  }, [text, fontBuffer]);

  // ✅ Calculate decal position & scale
  const { position, scale, offset } = useMemo(() => {
    if (!meshData) return { position: [0, 0, 0], scale: [1, 1, 1], offset: { x: 0, y: 0 } };

    const tempMesh = new THREE.Mesh(meshData.geometry);
    tempMesh.rotation.copy(meshData.rotation);
    tempMesh.scale.copy(meshData.scale);
    tempMesh.position.set(0, 0, 0);

    const box = new THREE.Box3().setFromObject(tempMesh);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    const meshWidth = size.x;
    
    // Target size in THREE.js units (1 unit = 10mm)
    let targetWidth = svgWidth / 100;
    let targetHeight = svgHeight / 100;

    // Safety check: Don't exceed 85% of glass width
    const maxWidth = meshWidth * 0.85;
    if (targetWidth > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = targetWidth / aspect;
    }

    const decalPos = [center.x, center.y - 2, box.max.z + 0.01];
    const startX = decalPos[0] - (targetWidth / 2);

    // ✅ OFFSET CALCULATION (Relative to Top-Left)
    // x is the start point (left edge) of the decal
    const relOffset = {
      x: (startX - box.min.x) * 10,
      y: (decalPos[1] - box.max.y) * 10 
    };

    return {
      position: decalPos,
      scale: [
        targetWidth,
        targetHeight,
        targetHeight + 0.5
      ],
      offset: relOffset
    };
  }, [meshData, aspect, svgWidth, svgHeight]);

  // ✅ Send offset back to parent for DXF sync
  useEffect(() => {
    if (onUpdateOffset) {
      onUpdateOffset(offset);
    }
  }, [offset, onUpdateOffset]);


  if (!meshData) return null;

  return (
    <Center>
      <group>

        {/* Glass Base */}
        {nodes.Glass_Base && (
          <mesh
            geometry={nodes.Glass_Base.geometry}
            position={nodes.Glass_Base.position}
            rotation={nodes.Glass_Base.rotation}
            scale={nodes.Glass_Base.scale}
          >

            <meshPhysicalMaterial
              color="#ffffff"
              // metalness={0.05}
              roughness={0.0}
              transmission={1}
              ior={1.5}
              thickness={0.2}
              transparent
              opacity={1.0}
              side={THREE.DoubleSide}
            // reflectivity={0.5}
            // depthWrite={false}
            />

            {/* <MeshTransmissionMaterial
              thickness={0.5}
              ior={1.5}
              roughness={0.0}
              distortion={0.0}
              distortionScale={0.3}
              temporalDistortion={0.5}
              clearcoat={1}
              color="#ffffff"
            /> */}
          </mesh>
        )}

        {/* Glass Main */}
        {nodes.Glass_Main && (
          <mesh
            geometry={nodes.Glass_Main.geometry}
            position={nodes.Glass_Main.position}
            rotation={nodes.Glass_Main.rotation}
            scale={nodes.Glass_Main.scale}
          >
            {/* <meshPhysicalMaterial
              color="#ffffff"
              // metalness={0.05}
              roughness={0.0}
              transmission={1}
              ior={1.5}
              thickness={0.4}
              transparent
              opacity={1.0}
              side={THREE.DoubleSide}
            // reflectivity={0.5}
            // depthWrite={false}
            /> */}
            <MeshTransmissionMaterial
              thickness={0.1}
              ior={1.5}
              roughness={0.0}
              // distortion={0.0}
              // distortionScale={0.3}
              // temporalDistortion={0.5}
              // clearcoat={1}
              color="#ffffff"
            />
            {texture && (
              <Decal
                key={text}
                position={position}
                rotation={[0, 0, 0]}
                scale={scale}
                map={texture}
                transparent
                depthTest={false}
                depthWrite={false}
                polygonOffset
                polygonOffsetFactor={-10}

                renderOrder={10}
              />
            )}
          </mesh>
        )}

        {/* Fallback Mesh */}
        {!nodes.Glass_Base && !nodes.Glass_Main && meshData && (
          <mesh
            geometry={meshData.geometry}
            rotation={meshData.rotation}
            scale={meshData.scale}
          >
            <meshPhysicalMaterial
              color="#ffffff"
              metalness={0.05}
              roughness={0.0}
              transmission={1}
              ior={1.5}
              thickness={0.5}
              transparent
              opacity={1.0}
              side={THREE.DoubleSide}
            />
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
        )}

      </group>
    </Center>
  );
}

export default function Model({ url, text, fontBuffer, onUpdateOffset }) {
  return (
    <Suspense fallback={<Loader />}>
      <GlassModel url={url} text={text} fontBuffer={fontBuffer} onUpdateOffset={onUpdateOffset} />
    </Suspense>
  );
}
