import * as E from "../gl/gl-enum";
import { GlFBO } from "../gl/gl-fbo";
import { GlProgram } from "../gl/gl-shader-program";
import { GlTexture } from "../gl/gl-texture";
import { GlVAO } from "../gl/gl-vao";
import { GlWrapper } from "../gl/gl-wrapper";
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
      tex.setFilter(E.TextureMinFilter.Linear, E.TextureMagFilter.Linear);
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
    offset: GLintptr
  ): void{
    const gl = this.#glWrapper.context.gl;

    if(!inputImage.complete || inputImage.naturalWidth === 0)return;

    if(stack.length > 0){
      console.log(stack);
    }

    this.#textures[0].setData(inputImage, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE);
    mainProgram.setUniform("u_texture", this.#textures[0]);
    mainProgram.setUniform("u_scale", this.computeQuadScale(inputImage, this.#glWrapper.canvas));

    vao.drawElements(mainProgram, mode, count, type, offset);
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
