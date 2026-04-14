import React from "react";
import { CameraControls as CameraControlsImpl } from "@react-three/drei";

export default function CameraControls() {
  return (
    <CameraControlsImpl
      makeDefault
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={Math.PI / 3}
      minDistance={0}
      maxDistance={150}
      truckSpeed={0}
    />
  );
}
