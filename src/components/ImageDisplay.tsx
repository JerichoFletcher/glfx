import vertSrc from "../shaders/base.vert.glsl";
import fragSrc from "../shaders/base.frag.glsl";

import "./ImageDisplay.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";
import { BufferDataUsage, BufferType, DrawMode, DType, ShaderType } from "../gl/gl-enum";
import { GlProgram, GlShader } from "../gl/gl-shader-program";
import { GlWrapper } from "../gl/gl-wrapper";
import { GlBuffer } from "../gl/gl-buffer";
import { GlBufferLayout } from "../gl/gl-layout";
import { GlVAO } from "../gl/gl-vao";
import { FilterInstance } from "../impl/filter";
import { FilterPipeline } from "../impl/filter-pipeline";

const vData = new Float32Array([
  -1, -1, 0, 0,
  +1, -1, 1, 0,
  +1, +1, 1, 1,
  -1, +1, 0, 1,
]);
const eData = new Uint8Array([0, 1, 2, 3]);

interface VideoPlayerProps{
  filters: FilterInstance[];
  pipeline: FilterPipeline | null;
  onCanvasInit: (glw: GlWrapper) => void;
}

const ImageDisplay: React.FC<VideoPlayerProps> = React.memo(({
  filters,
  pipeline,
  onCanvasInit,
}) => {
  const inpRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const glwRef = useRef<GlWrapper | null>(null);

  const [imgSrc, setImgSrc] = useState("");

  const onInit = useCallback((glwVal: GlWrapper) => {
    onCanvasInit(glwVal);
    glwRef.current = glwVal;
  }, [onCanvasInit]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files || e.target.files.length === 0)return;

    const file = e.target.files.item(0);
    if(!file)return;
    
    if(file && imgRef.current){
      const url = URL.createObjectURL(file);
      
      const oldUrl = imgRef.current.src;
      if(oldUrl)URL.revokeObjectURL(oldUrl);

      imgRef.current.src = url;
    }
  }

  useEffect(() => {
    if(!glwRef.current)return;
    if(!pipeline)return;
    const cnv = glwRef.current.canvas;

    const glw = glwRef.current;
    if(!glw)return;

    const vert = GlShader.create(glw, ShaderType.Vertex, vertSrc);
    const frag = GlShader.create(glw, ShaderType.Fragment, fragSrc);
    const program = GlProgram.create(glw, vert, frag);

    const vbo = GlBuffer.create(glw, BufferType.Array, BufferDataUsage.Static, vData);
    const ebo = GlBuffer.create(glw, BufferType.Element, BufferDataUsage.Static, eData);
    const layout = new GlBufferLayout(glw);
    layout.setAttribute({
      attribName: "a_position",
      targetBuffer: vbo,
      stride: 4 * vData.BYTES_PER_ELEMENT,
      offset: 0 * vData.BYTES_PER_ELEMENT,
    }, {
      attribName: "a_uv",
      targetBuffer: vbo,
      stride: 4 * vData.BYTES_PER_ELEMENT,
      offset: 2 * vData.BYTES_PER_ELEMENT,
    });

    const vao = GlVAO.create(glw);
    layout.configure(vao, program);
    vao.bindElementBuffer(ebo);

    const render = () => {
      const gl = glw.context.gl;
      gl.clear(gl.COLOR_BUFFER_BIT);
  
      if(imgSrc && imgRef.current){
        pipeline?.consume(filters, imgRef.current, vao, program, DrawMode.TriangleFan, eData.length, DType.UByte, 0);
      }
    }

    const resizeCanvas = () => {
      const dispW = cnv.clientWidth;
      const dispH = cnv.clientHeight;
      
      if(cnv.width !== dispW || cnv.height !== dispH){
        cnv.width = dispW;
        cnv.height = dispH;

        glwRef.current?.resizeViewport();
        render();
      }
    }
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    }
  }, [glwRef, imgSrc, filters, pipeline]);

  return (
    <>
      <div id="video-player" className="flex-column full">
        <div id="video-canvas-wrapper" className="full">
          <Canvas onInit={onInit}/>
        </div>
        <div id="video-controls" className="flex-row">
          <button type="button" onClick={() => inpRef.current?.click()}>Select file...</button>
        </div>
      </div>
      <>
        <input ref={inpRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileInput}/>
        <img ref={imgRef} style={{ display: "none" }} onLoad={e => setImgSrc(e.currentTarget.src)}/>
      </>
    </>
  );
});

export default ImageDisplay;
