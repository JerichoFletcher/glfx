#version 100
precision mediump float;

varying vec2 v_uvLU;
varying vec2 v_uvMU;
varying vec2 v_uvRU;

varying vec2 v_uvLM;
varying vec2 v_uvMM;
varying vec2 v_uvRM;

varying vec2 v_uvLD;
varying vec2 v_uvMD;
varying vec2 v_uvRD;

uniform sampler2D u_texture;
uniform float u_kernel[9];

void main(){
  vec4 colorLU = texture2D(u_texture, v_uvLU);
  vec4 colorMU = texture2D(u_texture, v_uvMU);
  vec4 colorRU = texture2D(u_texture, v_uvRU);

  vec4 colorLM = texture2D(u_texture, v_uvLM);
  vec4 colorMM = texture2D(u_texture, v_uvMM);
  vec4 colorRM = texture2D(u_texture, v_uvRM);

  vec4 colorLD = texture2D(u_texture, v_uvLD);
  vec4 colorMD = texture2D(u_texture, v_uvMD);
  vec4 colorRD = texture2D(u_texture, v_uvRD);

  vec4 color =
    colorLU * u_kernel[0] + colorMU * u_kernel[1] + colorRU * u_kernel[2] +
    colorLM * u_kernel[3] + colorMM * u_kernel[4] + colorRM * u_kernel[5] +
    colorLD * u_kernel[6] + colorMD * u_kernel[7] + colorRD * u_kernel[8];

  gl_FragColor = color;
}
