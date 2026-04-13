import React from "react";
import { Canvas } from "@react-three/fiber";
import Lights from "./components/Lights";
import Model from "./components/Model";
import CameraControls from "./components/CameraControls";
import {
  SceneEnvController,
  ToneMappingController,
} from "./components/SceneControllers";
import TextCadPanel from "./components/TextCadPanel";

export default function App() {
  return (
    <div className="app-container" style={{ position: "relative" }}>
      {/* ✅ RIGHT PANEL */}
      <TextCadPanel />

      <Canvas camera={{ position: [0, 0, 1], fov: 10 }} shadows>
        <SceneEnvController />
        <ToneMappingController />
        <color attach="background" args={["#000000"]} />

        <Lights />
        <Model url="/01.glb" />
        <CameraControls />
      </Canvas>
    </div>
  );
}
