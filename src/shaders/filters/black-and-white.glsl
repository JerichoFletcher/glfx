#version 100
precision mediump float;

varying vec2 v_uv;

uniform sampler2D u_texture;

void main(){
  vec4 color = texture2D(u_texture, v_uv);
  float luminance = dot(vec4(0.299, 0.587, 0.144, 0.0), color);
  gl_FragColor = vec4(luminance, luminance, luminance, 1.0);
}
