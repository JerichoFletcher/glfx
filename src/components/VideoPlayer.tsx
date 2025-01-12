import vertSrc from "../shaders/base.vert.glsl";
import fragSrc from "../shaders/base.frag.glsl";

import { BufferDataUsage, BufferType, DrawMode, DType, ShaderType, TextureMagFilter, TextureMinFilter, TextureWrap } from "../gl/gl-enum";
import { GlProgram, GlShader } from "../gl/gl-shader-program";
import { GlWrapper } from "../gl/gl-wrapper";
import "./VideoPlayer.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GlBuffer } from "../gl/gl-buffer";
import { GlBufferLayout } from "../gl/gl-layout";
import { GlVAO } from "../gl/gl-vao";
import { GlTexture } from "../gl/gl-texture";
import { usingBindables } from "../intfs/bindable";

const vData = new Float32Array([
  -1, +1, 0, 0,
  +1, +1, 1, 0,
  +1, -1, 1, 1,
  -1, -1, 0, 1,
]);
const eData = new Uint8Array([0, 1, 2, 0, 2, 3]);

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

interface VideoPlayerProps{
  filters: string[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = () => {
  const inpRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // const vidRef = useRef<HTMLVideoElement>(null);

  const [glw, setGlw] = useState<GlWrapper | null>(null);
  const [glTex, setGlTex] = useState<GlTexture | null>(null);

  const onCanvasInit = useCallback((glw: GlWrapper) => {
    setGlw(glw);
  }, []);

  const recomputeQuadScale = (tex: GlTexture, cnv: HTMLCanvasElement) => {
    const [cnvW, cnvH] = [cnv.width, cnv.height];
    if(tex.width === 0 || tex.height === 0)return [0, 0];
    
    const cnvAspect = cnvW / cnvH;
    const imgAspect = tex.width / tex.height;
    
    let [sclW, sclH] = [1, 1];
    if(imgAspect > cnvAspect){
      sclH = cnvAspect / imgAspect;
    }else{
      sclW = imgAspect / cnvAspect;
    }

    return [sclW, sclH];
  };

  const doRender = useCallback(() => {
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

    const uTexture = GlTexture.create(glw, 0);
    uTexture.setFilter(TextureMinFilter.Linear, TextureMagFilter.Linear);
    uTexture.setTextureWrap(TextureWrap.ClampToEdge, TextureWrap.ClampToEdge);

    if(imgRef.current && imgRef.current.src)loadImageData(uTexture, imgRef.current);
    setGlTex(uTexture);
    
    usingBindables([program], () => {
      program.setUniform("u_texture", uTexture);
    });

    const renderLoop = () => {
      if(glw.isDisposed)return;

      const gl = glw.context.gl;
      gl.clear(gl.COLOR_BUFFER_BIT);

      usingBindables([program], () => {
        const quadScale = recomputeQuadScale(uTexture, glw.canvas);
        program.setUniform("u_scale", quadScale);
        vao.drawElements(program, DrawMode.Triangles, eData.length, DType.UByte, 0);
      });

      requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);
  }, [glw]);

  useEffect(() => {
    if(!glw)return;
    const cnv = glw.canvas;

    const resizeCanvas = () => {
      const dispW = cnv.clientWidth;
      const dispH = cnv.clientHeight;
      
      if(cnv.width !== dispW || cnv.height !== dispH){
        cnv.width = dispW;
        cnv.height = dispH;

        glw.resizeViewport();
      }
    }
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    doRender();
  }, [glw, doRender]);

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

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if(glTex){
      loadImageData(glTex, e.currentTarget);
    }else{
      console.error("Failed to upload image data as the main GL texture is uninitialized");
    }
  }

  const loadImageData = (tex: GlTexture, img: HTMLImageElement) => {
    if(glw){
      const gl = glw.context.gl;
      tex.setData(img, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE);
    }
  }

  return (
    <>
      <div id="video-player" className="flex-column full">
        <div id="video-canvas-wrapper" className="full">
          <Canvas onInit={onCanvasInit}/>
        </div>
        <div id="video-controls" className="flex-row">
          <button type="button" onClick={() => inpRef.current?.click()}>Select file...</button>
        </div>
      </div>
      <>
        <input ref={inpRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileInput}/>
        <img ref={imgRef} style={{ display: "none" }} onLoad={onImageLoad}/>
        {/* <video ref={vidRef} style={{ display: "none" }}/> */}
      </>
    </>
  );
}

export default VideoPlayer;
