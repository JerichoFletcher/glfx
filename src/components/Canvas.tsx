import React, { useEffect, useRef } from "react";
import { GlWrapper } from "../gl/gl-wrapper";

interface CanvasProps{
  onInit: (glw: GlWrapper) => void;
}

const Canvas: React.FC<CanvasProps> = React.memo(({
  onInit,
}) => {
  const cnvRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cnv = cnvRef.current;
    if(!cnv)return;

    const glw = GlWrapper.latest(cnv);
    console.log("Loaded GL version:", glw.version);
    console.log("Loaded GL extension:", [...glw.funcs.loadedExtensions.keys()]);
    onInit(glw);

    return () => {
      glw.dispose();
    }
  }, [onInit]);

  return <canvas id="video-canvas" ref={cnvRef} className="full"/>;
});

export default Canvas;
