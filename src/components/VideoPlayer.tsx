import vertSrc from "../shaders/base.vert.glsl";
import fragSrc from "../shaders/base.frag.glsl";

import { BufferDataUsage, BufferType, DrawMode, DType, ShaderType, TextureMagFilter, TextureMinFilter, TextureWrap } from "../gl/gl-enum";
import { GlProgram, GlShader } from "../gl/gl-shader-program";
import { GlWrapper } from "../gl/gl-wrapper";
import "./VideoPlayer.css";
import React, { createContext, useEffect, useRef, useState } from "react";
import { GlBuffer } from "../gl/gl-buffer";
import { GlBufferLayout } from "../gl/gl-layout";
import { GlVAO } from "../gl/gl-vao";
import { GlTexture } from "../gl/gl-texture";
import { usingBindables } from "../intfs/bindable";
import usePrevious from "../utils/use-previous";

const GLWContext = createContext<GlWrapper | null>(null);
const vData = new Float32Array([
  -1, +1, 0, 0,
  +1, +1, 1, 0,
  +1, -1, 1, 1,
  -1, -1, 0, 1,
]);
const eData = new Uint8Array([0, 1, 2, 0, 2, 3]);

interface CanvasProps{
  filters: string[];
}

const VideoPlayer: React.FC<CanvasProps> = () => {
  const glwRef = useRef<GlWrapper | null>(null);
  const glTexRef = useRef<GlTexture | null>(null);

  const cnvRef = useRef<HTMLCanvasElement>(null);
  const inpRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // const vidRef = useRef<HTMLVideoElement>(null);

  const [imgUrl , setImgUrl] = useState<string>("");
  const prevImgUrl = usePrevious(imgUrl);

  const quadScale = [0, 0];
  const imgSize = [0, 0];
  let doUpdateScale = true;

  const recomputeQuadScale = () => {
    const cnv = cnvRef.current;
    if(!cnv)return;

    const [cnvW, cnvH] = [cnv.width, cnv.height];
    const [imgW, imgH] = imgSize;
    if(imgW === 0 || imgH === 0)return;
    
    const cnvAspect = cnvW / cnvH;
    const imgAspect = imgW / imgH;
    
    quadScale[0] = 1;
    quadScale[1] = 1;
    if(imgAspect > cnvAspect){
      quadScale[1] = cnvAspect / imgAspect;
    }else{
      quadScale[0] = imgAspect / cnvAspect;
    }

    doUpdateScale = true;
  }

  const loadImageData = (img: HTMLImageElement) => {
    const glTex = glTexRef.current;
    if(!glTex)return;

    const cnv = cnvRef.current;
    if(cnv){
      imgSize[0] = img.naturalWidth;
      imgSize[1] = img.naturalHeight;
      recomputeQuadScale();
    }

    const gl = glTex.contextWrapper.context.gl;
    glTex.setData(img, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE);
  }

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files || e.target.files.length === 0)return;

    const file = e.target.files.item(0);
    if(!file)return;
    
    if(file && imgRef.current){
      const url = URL.createObjectURL(file);
      setImgUrl(url);
    }
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const glTex = glTexRef.current;
    if(glTex)loadImageData(e.currentTarget);
  }

  const doRender = () => {
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

    const uTexture = GlTexture.create(glw, 0);
    uTexture.setFilter(TextureMinFilter.Linear, TextureMagFilter.Linear);
    uTexture.setTextureWrap(TextureWrap.ClampToEdge, TextureWrap.ClampToEdge);
    glTexRef.current = uTexture;
    
    usingBindables([program], () => {
      program.setUniform("u_texture", uTexture);
    });

    const renderLoop = () => {
      if(glw.isDisposed)return;

      const gl = glw.context.gl;
      gl.clear(gl.COLOR_BUFFER_BIT);

      usingBindables([program], () => {
        if(doUpdateScale){
          program.setUniform("u_scale", quadScale);
          doUpdateScale = false;
        }
        vao.drawElements(program, DrawMode.Triangles, eData.length, DType.UByte, 0);
      });

      requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);
  }

  useEffect(() => {
    const cnv = cnvRef.current;
    if(!cnv)return;

    const glw = GlWrapper.latest(cnv);
    console.log("Loaded GL version:", glw.version);
    console.log("Loaded GL extension:", [...glw.funcs.loadedExtensions.keys()]);

    const resizeCanvas = () => {
      const dispW = cnv.clientWidth;
      const dispH = cnv.clientHeight;
      
      if(cnv.width !== dispW || cnv.height !== dispH){
        cnv.width = dispW;
        cnv.height = dispH;

        glw.resizeViewport();
        recomputeQuadScale();
      }
    }
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    glwRef.current = glw;
    doRender();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      glwRef.current?.dispose();
      glwRef.current = null;
    }
  });

  useEffect(() => {
    if(!prevImgUrl || prevImgUrl === imgUrl)return;
    URL.revokeObjectURL(prevImgUrl);
  }, [imgUrl, prevImgUrl]);

  return (
    <GLWContext.Provider value={glwRef.current}>
      <div id="video-player">
        <div id="video-canvas-wrapper">
          <canvas id="video-canvas" ref={cnvRef}/>
        </div>
        <div id="video-controls">
          <button type="button" onClick={() => inpRef.current?.click()}>Select file...</button>
        </div>
      </div>
      <>
        <input ref={inpRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileInput}/>
        <img ref={imgRef} src={imgUrl} style={{ display: "none" }} onLoad={onImageLoad}/>
        {/* <video ref={vidRef} style={{ display: "none" }}/> */}
      </>
    </GLWContext.Provider>
  );
}

export default VideoPlayer;
