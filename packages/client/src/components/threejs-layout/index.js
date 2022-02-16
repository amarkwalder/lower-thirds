import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";

import Model from "./Model";

import "./threejs-layout.css";

export const ThreeJSLayout = () => {
  return (
    <div className="threejs-layout">
      <Canvas>
        <Suspense fallback={null}>
          <Model />
          <OrbitControls />
          <Environment preset="forest" background />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeJSLayout;
