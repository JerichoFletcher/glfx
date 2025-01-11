import { Disposable } from "../intfs/disposable";
import * as Gl from "./gl-functions";

export class GlWrapper implements Disposable{
  #disposed: boolean;
  #canvas: HTMLCanvasElement;
  #context: Gl.GlVersionedContext;
  #funcs: Gl.GlFunctions;
  #resources: Disposable[];

  private constructor(canvas: HTMLCanvasElement, context: Gl.GlContext){
    this.#canvas = canvas;
    this.#context = context as Gl.GlVersionedContext;
    this.#funcs = new Gl.GlFunctions(context as Gl.GlVersionedContext);

    this.#disposed = false;
    this.#resources = [];
  }

  static latest(canvas: HTMLCanvasElement): GlWrapper{
    const gl2ctx = canvas.getContext("webgl2");
    if(gl2ctx){
      return new GlWrapper(canvas, { version: Gl.GlVersion.WebGL2, gl: gl2ctx });
    }

    const gl1ctx = canvas.getContext("webgl");
    if(gl1ctx){
      return new GlWrapper(canvas, { version: Gl.GlVersion.WebGL1, gl: gl1ctx });
    }

    throw new Error("Failed to create WebGL wrapper: WebGL not supported");
  }

  static ofVersion(canvas: HTMLCanvasElement, version: Gl.GlVersion): GlWrapper{
    let gl: Gl.GlRenderingContextObj | null;
    switch(version){
      case Gl.GlVersion.WebGL1: gl = canvas.getContext("webgl"); break;
      case Gl.GlVersion.WebGL2: gl = canvas.getContext("webgl2"); break;
    }

    if(!gl)throw new Error("Failed to create WebGL wrapper: Version not supported");
    return new GlWrapper(canvas, { version, gl });
  }

  get canvas(): HTMLCanvasElement{
    return this.#canvas;
  }

  get context(): Gl.GlVersionedContext{
    return this.#context;
  }

  get funcs(): Gl.GlFunctions{
    return this.#funcs;
  }

  get version(): string{
    return this.#context.gl.getParameter(this.#context.gl.VERSION);
  }

  get isDisposed(): boolean{
    return this.#disposed;
  }

  resizeViewport(): void;
  resizeViewport(x: GLint, y: GLint, width: GLsizei, height: GLsizei): void;
  resizeViewport(x?: GLint, y?: GLint, width?: GLsizei, height?: GLsizei): void{
    if(x === undefined){
      this.#context.gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
    }else{
      this.#context.gl.viewport(x!, y!, width!, height!);
    }
  }

  registerResource<T extends Disposable>(res: T): void{
    this.#resources.push(res);
  }

  dispose(): void{
    if(!this.#disposed){
      for(let i = this.#resources.length - 1; i >= 0; i--){
        const res = this.#resources[i];
        if(!res.isDisposed)res.dispose();
      }
      this.#resources.length = 0;
      this.#disposed = true;
    }
  }
}
