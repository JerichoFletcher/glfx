import { GlProgram, GlShader, UniformType } from "../gl/gl-shader-program";
import { GlWrapper } from "../gl/gl-wrapper";
import * as E from "../gl/gl-enum";
import { DependsOnDisposedState, Disposable } from "../intfs/disposable";
import { GlTexture } from "../gl/gl-texture";
import { GlVAO } from "../gl/gl-vao";

type FilterParam = {
  alternateName?: string;
} & ({
  type: "field";
  default: number;
  min?: number;
  max?: number;
  step?: number;
} | {
  type: "slider";
  default: number;
  min: number;
  max: number;
  step: number;
} | {
  type: "check";
  default: boolean;
} | ({
  type: "vector";
} & ({
  elementType: "float" | "int";
  default: [number, number] | [number, number, number] | [number, number, number, number];
} | {
  elementType: "bool";
  default: [boolean, boolean] | [boolean, boolean, boolean] | [boolean, boolean, boolean, boolean];
})) | {
  type: "matrix";
  default: number[];
  normalizeTo: number;
} | {
  type: "prov";
  default: UniformType;
});

export interface FilterParams{
  readonly [key: string]: Readonly<FilterParam>;
}

export interface FilterArgs{
  [key: string]: {
    value: UniformType;
    normalizeTo?: number;
  };
}

export interface FilterInstance{
  filter: Filter;
  enabled: boolean;
  args: FilterArgs;
}

export class Filter implements Disposable{
  protected static readonly filterProvidedUniforms = ["u_texture", "u_resolution"];

  #disposed: boolean;
  #glWrapper: GlWrapper;
  #name: string;
  #prog: DependsOnDisposedState<GlProgram>;
  #params: FilterParams;
  #next: Filter | undefined;

  constructor(glWrapper: GlWrapper, name: string, vertSrc: string, fragSrc: string, params: FilterParams, next?: Filter){
    this.#glWrapper = glWrapper;
    this.#name = name;

    const vert = GlShader.create(glWrapper, E.ShaderType.Vertex, vertSrc);
    const frag = GlShader.create(glWrapper, E.ShaderType.Fragment, fragSrc);
    const prog = GlProgram.create(glWrapper, vert, frag);

    this.#prog = DependsOnDisposedState.validBeforeDisposed(this, prog);
    vert.dispose();
    frag.dispose();

    if(!prog.uniforms.has("u_texture"))throw new Error("Invalid filter: input texture uniform 'u_texture' required");
    for(const uniform of this.#prog.value.uniforms.values()){
      if(Filter.filterProvidedUniforms.includes(uniform.name))continue;

      const param = params[uniform.name];
      if(!param)throw new Error(`Invalid filter: no parameter found for uniform '${uniform.name}'`);
      
      let valid = true;
      if(param.type !== "prov"){
        switch(uniform.type){
          case E.DType.Byte:
          case E.DType.UByte:
          case E.DType.Short:
          case E.DType.UShort:
          case E.DType.Int:
          case E.DType.UInt:
            valid = (
              uniform.size === 1
              && (param.type === "field" || param.type === "slider")
              && param.step === 1
              && Number.isInteger(param.min)
              && Number.isInteger(param.max)
              && Number.isInteger(param.default)
            ) || (
              uniform.size !== 1
              && param.type === "matrix"
              && !param.default.some(v => !Number.isInteger(v))
            );
            break;
          case E.DType.Float:
            valid = (
              uniform.size === 1
              && (param.type === "field" || param.type === "slider")
            ) || (
              uniform.size !== 1
              && param.type === "matrix"
            );
            break;
          case E.DType.Bool:
            valid = param.type === "check";
            break;
          case E.DTypeVec.Float2:
          case E.DTypeVec.Float3:
          case E.DTypeVec.Float4:
            valid = param.type === "vector"
              && param.elementType === "float"
              && param.default.length === uniform.elementSize;
            break;
          case E.DTypeVec.Int2:
          case E.DTypeVec.Int3:
          case E.DTypeVec.Int4:
            valid = param.type === "vector"
              && param.elementType === "int"
              && param.default.length === uniform.elementSize
              && param.default.every(v => Number.isInteger(v));
            break;
          case E.DTypeVec.Bool2:
          case E.DTypeVec.Bool3:
          case E.DTypeVec.Bool4:
            valid = param.type === "vector"
              && param.elementType === "bool"
              && param.default.length === uniform.elementSize;
            break;
          case E.DTypeMat.FloatM2:
          case E.DTypeMat.FloatM3:
          case E.DTypeMat.FloatM4:
            valid = param.type === "matrix" && param.default.length === uniform.elementSize;
            break;
          case E.DTypeSampler.Sampler2D:
          case E.DTypeSampler.SamplerCube:
            throw new Error("Not supported");
        }
      }

      if(!valid)throw new Error(`Invalid filter: incompatible parameter for '${uniform.name}'`);
    }

    this.#params = params;
    this.#next = next;
    this.#disposed = false;
  }

  apply(
    args: FilterArgs,
    vao: GlVAO,
    inTex: GlTexture,
    mode: E.DrawMode,
    count: GLsizei,
    type: E.DType,
    offset: GLintptr,
  ): void{
    this.#prog.value.setUniform("u_texture", inTex);
    this.#prog.value.setUniformIfExists("u_resolution", [inTex.width, inTex.height]);

    for(const uniformName of this.#prog.value.uniforms.keys()){
      if(Filter.filterProvidedUniforms.includes(uniformName))continue;
      
      const uniformArg = args[uniformName];
      let uniformVal = uniformArg.value;
      if(this.#params[uniformName].type === "matrix" && uniformArg.normalizeTo !== undefined){
        const uniformValM = uniformVal as number[];
        const sum = uniformValM.reduce((s, v) => s + v);

        if(sum !== 0)uniformVal = uniformValM.map(v => v * uniformArg.normalizeTo! / sum);
      }

      this.#prog.value.setUniform(uniformName, uniformVal);
    }
    vao.drawElements(this.#prog.value, mode, count, type, offset);
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

  get params(): FilterParams{
    return this.#params;
  }

  get next(): Filter | null{
    return this.#next ?? null;
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

export const GaussianFilter = (
  glWrapper: GlWrapper,
  name: string,
  vertSrcX: string,
  vertSrcY: string,
  fragSrcX: string,
  fragSrcY: string,
  params: FilterParams
) =>
  new Filter(glWrapper, name, vertSrcX, fragSrcX, params,
  new Filter(glWrapper, name, vertSrcY, fragSrcY, params,
  ));
