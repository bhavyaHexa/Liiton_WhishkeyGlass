import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Lights from "./components/Lights";
import Model from "./components/Model";
import CameraControls from "./components/CameraControls";
import TextCadPanel from "./components/TextCadPanel";

export default function App() {
  // ✅ GLOBAL STATE
  const [text, setText] = useState("Liiton Glass");
  const [fontBuffer, setFontBuffer] = useState(null);

  return (
    <div className="app-container" style={{ position: "relative" }}>
      {/* ✅ PANEL (controlled by App) */}
      <TextCadPanel
        text={text}
        setText={setText}
        setFontBuffer={setFontBuffer}
      />

      <div
        className="canvas-container"
        style={{ width: "calc(100% - 300px)", height: "100%" }}
      >
        <Canvas camera={{ position: [0, 0, 100], fov: 10 }} shadows>
          <color attach="background" args={["#000000"]} />

          <Lights />

          {/* ✅ PASS DATA TO MODEL */}
          <Model url="/1.glb" text={text} fontBuffer={fontBuffer} />

          <CameraControls />
        </Canvas>
      </div>
    </div>
  );
}
