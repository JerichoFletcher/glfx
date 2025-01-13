#version 100
precision mediump float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform int u_offset;

void main(){
  vec4 color = texture2D(u_texture, v_uv);
  gl_FragColor = clamp(color + float(u_offset) / 256.0, 0.0, 1.0);
}
