#version 100
precision mediump float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform float u_brightness;
uniform float u_contrast;

void main(){
  float contrastFactor = 259.0 * (u_contrast + 255.0) / (255.0 * (259.0 - u_contrast));
  vec4 color = texture2D(u_texture, v_uv);
  gl_FragColor = clamp(contrastFactor * (color - 0.5) + 0.5 + u_brightness / 256.0, 0.0, 1.0);
}
