import React from "react";
import { CameraControls as CameraControlsImpl } from "@react-three/drei";

export default function CameraControls() {
  return (
    <CameraControlsImpl
      makeDefault
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={Math.PI / 2.5}
      minDistance={60}
      maxDistance={100}
      truckSpeed={0}
      dollySpeed={0.2}
      minAzimuthAngle={-1}
      maxAzimuthAngle={1}
    />
  );
}
