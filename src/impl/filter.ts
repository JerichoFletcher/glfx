import { GlProgram, GlShader } from "../gl/gl-shader-program";
import { GlWrapper } from "../gl/gl-wrapper";
import * as E from "../gl/gl-enum";
import { DependsOnDisposedState, Disposable } from "../intfs/disposable";

export class Filter implements Disposable{
  #disposed: boolean;
  #glWrapper: GlWrapper;
  #name: string;
  #prog: DependsOnDisposedState<GlProgram>;

  constructor(glWrapper: GlWrapper, name: string, vertShader: string, fragShader: string){
    this.#glWrapper = glWrapper;
    this.#name = name;

    const vert = GlShader.create(glWrapper, E.ShaderType.Vertex, vertShader);
    const frag = GlShader.create(glWrapper, E.ShaderType.Fragment, fragShader);

    this.#prog = DependsOnDisposedState.validBeforeDisposed(this, GlProgram.create(glWrapper, vert, frag));
    vert.dispose();
    frag.dispose();

    this.#disposed = false;
  }

  get contextWrapper(): GlWrapper{
    return this.#glWrapper;
  }

  get name(): string{
    return this.#name;
  }

  get program(): GlProgram{
    return this.#prog.value;
  }

  get isDisposed(): boolean{
    return this.#disposed;
  }

  dispose(): void{
    if(!this.#disposed){
      this.#prog.value.dispose();
      this.#disposed = true;
    }
  }
}

export interface FilterInstance{
  filter: Filter;
  params: Record<string, boolean | boolean[] | number | number[]>;
}
