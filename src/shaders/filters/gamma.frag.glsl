#version 100
precision mediump float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform float u_gamma;

void main(){
  vec4 color = texture2D(u_texture, v_uv);
  gl_FragColor = pow(color, vec4(1.0 / u_gamma));
}
