import vertSrc from "../shaders/base.vert.glsl";
import fragSrc from "../shaders/base.frag.glsl";

import "./VideoPlayer.css";
import React, { useCallback, useEffect, useRef } from "react";
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
  -1, +1, 0, 0,
  +1, +1, 1, 0,
  +1, -1, 1, 1,
  -1, -1, 0, 1,
]);
const eData = new Uint8Array([0, 1, 2, 3]);

interface VideoPlayerProps{
  filters: FilterInstance[];
  pipeline: FilterPipeline | null;
  onCanvasInit: (glw: GlWrapper) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(({
  filters,
  pipeline,
  onCanvasInit,
}) => {
  const inpRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const glwRef = useRef<GlWrapper | null>(null);

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

  // const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
  //   if(glTexRef.current){
  //     loadImageData(glTexRef.current, e.currentTarget);
  //   }else{
  //     console.error("Failed to upload image data as the main GL texture is uninitialized");
  //   }
  // }

  // const loadImageData = useCallback((tex: GlTexture, img: HTMLImageElement) => {
  //   if(glwRef.current){
  //     const gl = glwRef.current.context.gl;
  //     tex.setData(img, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE);
  //   }
  // }, [glwRef]);

  // const recomputeQuadScale = (img: HTMLImageElement | null, cnv: HTMLCanvasElement) => {
  //   const [cnvW, cnvH] = [cnv.width, cnv.height];
  //   if(!img || img.naturalWidth === 0 || img.naturalHeight === 0)return [0, 0];
    
  //   const cnvAspect = cnvW / cnvH;
  //   const imgAspect = img.naturalWidth / img.naturalHeight;
    
  //   let [sclW, sclH] = [1, 1];
  //   if(imgAspect > cnvAspect){
  //     sclH = cnvAspect / imgAspect;
  //   }else{
  //     sclW = imgAspect / cnvAspect;
  //   }

  //   return [sclW, sclH];
  // };

  useEffect(() => {
    if(!glwRef.current)return;
    if(!pipeline)return;
    const cnv = glwRef.current.canvas;

    const resizeCanvas = () => {
      const dispW = cnv.clientWidth;
      const dispH = cnv.clientHeight;
      
      if(cnv.width !== dispW || cnv.height !== dispH){
        cnv.width = dispW;
        cnv.height = dispH;

        glwRef.current?.resizeViewport();
      }
    }
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

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

    const renderLoop = () => {
      if(glw.isDisposed)return;

      const gl = glw.context.gl;
      gl.clear(gl.COLOR_BUFFER_BIT);

      if(imgRef.current){
        pipeline?.consume(filters, imgRef.current, vao, program, DrawMode.TriangleFan, eData.length, DType.UByte, 0);
      }

      requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);
  }, [glwRef, filters, pipeline]);

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
        <img ref={imgRef} style={{ display: "none" }}/>
        {/* <video ref={vidRef} style={{ display: "none" }}/> */}
      </>
    </>
  );
});

export default VideoPlayer;
