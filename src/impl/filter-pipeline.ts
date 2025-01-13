import * as E from "../gl/gl-enum";
import { GlFBO } from "../gl/gl-fbo";
import { GlProgram } from "../gl/gl-shader-program";
import { GlTexture } from "../gl/gl-texture";
import { GlVAO } from "../gl/gl-vao";
import { GlWrapper } from "../gl/gl-wrapper";
import { usingBindables } from "../intfs/bindable";
import { Disposable } from "../intfs/disposable";
import { FilterInstance } from "./filter";

export class FilterPipeline implements Disposable{
  #disposed: boolean;
  #glWrapper: GlWrapper;
  #textures: [GlTexture, GlTexture];
  #framebuffers: [GlFBO, GlFBO];

  constructor(glWrapper: GlWrapper, texUnit: number){
    this.#glWrapper = glWrapper;
    
    const textures: GlTexture[] = [];
    const framebuffers: GlFBO[] = [];
    for(let i = 0; i < 2; i++){
      const tex = GlTexture.create(glWrapper, texUnit);
      tex.setFilter(E.TextureMinFilter.Nearest, E.TextureMagFilter.Nearest);
      tex.setTextureWrap(E.TextureWrap.ClampToEdge, E.TextureWrap.ClampToEdge);
      textures.push(tex);

      const fbo = GlFBO.create(glWrapper, tex);
      framebuffers.push(fbo);
    }

    this.#textures = [textures[0], textures[1]];
    this.#framebuffers = [framebuffers[0], framebuffers[1]];
    this.#disposed = false;
  }

  consume(
    stack: FilterInstance[],
    inputImage: HTMLImageElement,
    vao: GlVAO,
    mainProgram: GlProgram,
    mode: E.DrawMode,
    count: GLsizei,
    type: E.DType,
    offset: GLintptr,
  ): void{
    if(!inputImage.complete || inputImage.naturalWidth === 0)return;
    
    const gl = this.#glWrapper.context.gl;
    this.#textures[0].setData(inputImage, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE);
    this.#textures[1].setData(null, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, inputImage.naturalWidth, inputImage.naturalHeight);
    this.#glWrapper.resizeViewport(0, 0, inputImage.naturalWidth, inputImage.naturalHeight);

    for(let i = 0; i < stack.length; i++){
      const inTex = this.#textures[i % 2];
      const outFBO = this.#framebuffers[(i + 1) % 2];

      this.applyFilter(stack[i], vao, inTex, outFBO, mode, count, type, offset);
    }

    mainProgram.setUniform("u_texture", this.#textures[stack.length % 2]);
    mainProgram.setUniform("u_scale", this.computeQuadScale(inputImage, this.#glWrapper.canvas));
    this.#glWrapper.resizeViewport();

    vao.drawElements(mainProgram, mode, count, type, offset);
  }

  private applyFilter(
    filterInstance: FilterInstance,
    vao: GlVAO,
    inTex: GlTexture,
    outFBO: GlFBO,
    mode: E.DrawMode,
    count: GLsizei,
    type: E.DType,
    offset: GLintptr,
  ): void{
    const prog = filterInstance.filter.program;
    prog.setUniform("u_texture", inTex);
    
    usingBindables([outFBO], () => {
      vao.drawElements(filterInstance.filter.program, mode, count, type, offset);
    });
  }

  private computeQuadScale(img: HTMLImageElement | null, cnv: HTMLCanvasElement){
    const [cnvW, cnvH] = [cnv.width, cnv.height];
    if(!img || img.naturalWidth === 0 || img.naturalHeight === 0)return [0, 0];
    
    const cnvAspect = cnvW / cnvH;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    
    let [sclW, sclH] = [1, 1];
    if(imgAspect > cnvAspect){
      sclH = cnvAspect / imgAspect;
    }else{
      sclW = imgAspect / cnvAspect;
    }

    return [sclW, sclH];
  };

  get contextWrapper(): GlWrapper{
    return this.#glWrapper;
  }

  get isDisposed(): boolean{
    return this.#disposed;
  }

  dispose(): void{
    if(!this.#disposed){
      for(const tex of this.#textures)tex.dispose();
      for(const fbo of this.#framebuffers)fbo.dispose();
      this.#disposed = true;
    }
  }
}
