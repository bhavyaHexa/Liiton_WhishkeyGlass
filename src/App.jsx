import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Lights from "./components/Lights";
import Model from "./components/Model";
import CameraControls from "./components/CameraControls";
import TextCadPanel from "./components/TextCadPanel";

export default function App() {
  // ✅ GLOBAL STATE
  const [text, setText] = useState("Test Order");
  const [fontBuffer, setFontBuffer] = useState(null);
  const [decalOffset, setDecalOffset] = useState({ x: 0, y: 0 });

  return (
    <div className="app-container" style={{ position: "relative" }}>
      {/* ✅ PANEL (controlled by App) */}
      <TextCadPanel
        text={text}
        setText={setText}
        setFontBuffer={setFontBuffer}
        decalOffset={decalOffset}
      />

      <div
        className="canvas-container"
        style={{ width: "calc(100% - 300px)", height: "100%" }}
      >
        <Canvas camera={{ position: [0, 10, 75], fov: 15 }} shadows>
          <color attach="background" args={["#000000"]} />

          <Lights />

          {/* ✅ PASS DATA TO MODEL */}
          <Model
            url="/Grand_Canyon_Glass_02.glb"
            text={text}
            fontBuffer={fontBuffer}
            onUpdateOffset={setDecalOffset}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.5, 8]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#2b2b2b" />
          </mesh>

          <CameraControls />
        </Canvas>
      </div>
    </div>
  );
}
