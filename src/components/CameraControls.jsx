import React from "react";
import { CameraControls as CameraControlsImpl } from "@react-three/drei";

import { isDebugMode } from "../utils/debug";
import { useControls } from "leva";

export default function CameraControls() {
  const isDebug = isDebugMode();

  const { enabled } = useControls(
    "Debug.Camera",
    {
      enabled: { value: true, label: "Enable Camera" },
    },
    { hidden: !isDebug, collapsed: true }
  );

  if (!enabled) return null;

  return (
    <CameraControlsImpl
      makeDefault
      // Restrictions are removed in debug mode
      maxPolarAngle={isDebug ? Math.PI : Math.PI / 2}
      minPolarAngle={isDebug ? 0 : Math.PI / 2.5}
      minDistance={isDebug ? 0 : 50}
      maxDistance={isDebug ? Infinity : 100}
      truckSpeed={isDebug ? 1 : 0}
      dollySpeed={isDebug ? 1 : 0.4}
      minAzimuthAngle={isDebug ? -Infinity : -0.7}
      maxAzimuthAngle={isDebug ? Infinity : 0.7}
    />
  );
}
