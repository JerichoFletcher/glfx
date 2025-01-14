#version 100
precision mediump float;

varying vec2 v_uv00;
varying vec2 v_uv01;
varying vec2 v_uv02;
varying vec2 v_uv03;
varying vec2 v_uv04;

varying vec2 v_uv10;
varying vec2 v_uv11;
varying vec2 v_uv12;
varying vec2 v_uv13;
varying vec2 v_uv14;

varying vec2 v_uv20;
varying vec2 v_uv21;
varying vec2 v_uv22;
varying vec2 v_uv23;
varying vec2 v_uv24;

varying vec2 v_uv30;
varying vec2 v_uv31;
varying vec2 v_uv32;
varying vec2 v_uv33;
varying vec2 v_uv34;

varying vec2 v_uv40;
varying vec2 v_uv41;
varying vec2 v_uv42;
varying vec2 v_uv43;
varying vec2 v_uv44;

uniform sampler2D u_texture;
uniform float u_kernel[25];

void main(){
  vec4 color00 = texture2D(u_texture, v_uv00);
  vec4 color01 = texture2D(u_texture, v_uv01);
  vec4 color02 = texture2D(u_texture, v_uv02);
  vec4 color03 = texture2D(u_texture, v_uv03);
  vec4 color04 = texture2D(u_texture, v_uv04);

  vec4 color10 = texture2D(u_texture, v_uv10);
  vec4 color11 = texture2D(u_texture, v_uv11);
  vec4 color12 = texture2D(u_texture, v_uv12);
  vec4 color13 = texture2D(u_texture, v_uv13);
  vec4 color14 = texture2D(u_texture, v_uv14);

  vec4 color20 = texture2D(u_texture, v_uv20);
  vec4 color21 = texture2D(u_texture, v_uv21);
  vec4 color22 = texture2D(u_texture, v_uv22);
  vec4 color23 = texture2D(u_texture, v_uv23);
  vec4 color24 = texture2D(u_texture, v_uv24);

  vec4 color30 = texture2D(u_texture, v_uv30);
  vec4 color31 = texture2D(u_texture, v_uv31);
  vec4 color32 = texture2D(u_texture, v_uv32);
  vec4 color33 = texture2D(u_texture, v_uv33);
  vec4 color34 = texture2D(u_texture, v_uv34);

  vec4 color40 = texture2D(u_texture, v_uv40);
  vec4 color41 = texture2D(u_texture, v_uv41);
  vec4 color42 = texture2D(u_texture, v_uv42);
  vec4 color43 = texture2D(u_texture, v_uv43);
  vec4 color44 = texture2D(u_texture, v_uv44);

  vec4 color =
    color00 * u_kernel[0] + color01 * u_kernel[1] + color02 * u_kernel[2] + color03 * u_kernel[3] + color04 * u_kernel[4] +
    color10 * u_kernel[5] + color11 * u_kernel[6] + color12 * u_kernel[7] + color13 * u_kernel[8] + color14 * u_kernel[9] +
    color20 * u_kernel[10] + color21 * u_kernel[11] + color22 * u_kernel[12] + color23 * u_kernel[13] + color24 * u_kernel[14] +
    color30 * u_kernel[15] + color31 * u_kernel[16] + color32 * u_kernel[17] + color33 * u_kernel[18] + color34 * u_kernel[19] +
    color40 * u_kernel[20] + color41 * u_kernel[21] + color42 * u_kernel[22] + color43 * u_kernel[23] + color44 * u_kernel[24];

  gl_FragColor = color;
}
