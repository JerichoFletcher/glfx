import { Bindable, usingBindables } from "../intfs/bindable";
import { DependsOnDisposedState, Disposable } from "../intfs/disposable";
import { FramebufferStatus } from "./gl-enum";
import { GlTexture } from "./gl-texture";
import { GlWrapper } from "./gl-wrapper";

type GlFBOAttachment = GlTexture;

export class GlFBO implements Disposable, Bindable{
  #disposed: boolean;
  #glWrapper: GlWrapper;
  #fboHandle: DependsOnDisposedState<WebGLFramebuffer>;
  #attachments: GlFBOAttachment[];

  private constructor(glWrapper: GlWrapper){
    this.#glWrapper = glWrapper;

    const fboHandle = glWrapper.context.gl.createFramebuffer();
    if(!fboHandle){
      const err = glWrapper.context.gl.getError();
      throw new Error(`Failed to create FBO (error code: ${err})`);
    }
    this.#fboHandle = DependsOnDisposedState.validBeforeDisposed(this, fboHandle);
    this.#attachments = [];
    this.#disposed = false;
    this.#glWrapper.registerResource(this);
  }

  static create(glWrapper: GlWrapper, ...attachments: GlFBOAttachment[]): GlFBO{
    const fbo = new GlFBO(glWrapper);

    for(const attachment of attachments){
      if(attachment instanceof GlTexture){
        fbo.attachTexture(attachment);
      }
    }

    return fbo;
  }

  bind(): void{
    this.#glWrapper.context.gl.bindFramebuffer(this.#glWrapper.context.gl.FRAMEBUFFER, this.#fboHandle.value);
  }
  
  unbind(): void{
    this.#glWrapper.context.gl.bindFramebuffer(this.#glWrapper.context.gl.FRAMEBUFFER, null);
  }

  read<T extends ArrayBufferView>(x: GLint, y: GLint, w: GLsizei, h: GLsizei, format: GLenum, type: GLenum, buffer: T): T{
    usingBindables([this], () => {
      this.#glWrapper.context.gl.readPixels(x, y, w, h, format, type, buffer);
    });
    return buffer;
  }

  attachTexture(tex: GlTexture | null): void{
    usingBindables([this], () => {
      const gl = this.#glWrapper.context.gl;

      tex?.bind();
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex?.texture ?? null, 0);

      if(tex)this.#attachments.push(tex);
    });
  }

  get contextWrapper(): GlWrapper{
    return this.#glWrapper;
  }

  get fbo(): WebGLFramebuffer{
    return this.#fboHandle.value;
  }

  get attachments(): ReadonlyArray<GlFBOAttachment>{
    return this.#attachments;
  }

  get status(): FramebufferStatus{
    return usingBindables([this], () => {
      const gl = this.#glWrapper.context.gl;
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

      if(status === 0){
        const err = gl.getError();
        throw new Error(`Failed to retrieve FBO status (error code: ${err})`);
      }

      return status as FramebufferStatus;
    });
  }

  get isDisposed(): boolean{
    return this.#disposed;
  }

  dispose(): void{
    if(!this.#disposed){
      this.#glWrapper.context.gl.deleteFramebuffer(this.#fboHandle.value);
      this.#disposed = true;
    }
  }
}
