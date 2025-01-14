#version 100

attribute vec2 a_position;
attribute vec2 a_uv;

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

uniform vec2 u_resolution;

void main(){  
  vec2 stepXY = 1.0 / u_resolution;
  vec2 stepX = vec2(stepXY.x, 0.0);
  vec2 stepY = vec2(0.0, stepXY.y);
  vec2 stepXnY = vec2(stepXY.x, -stepXY.y);
  
  v_uv11 = a_uv - stepXnY;
  v_uv12 = a_uv + stepY;
  v_uv13 = a_uv + stepXY;

  v_uv21 = a_uv - stepX;
  v_uv22 = a_uv;
  v_uv23 = a_uv + stepX;

  v_uv31 = a_uv - stepXY;
  v_uv32 = a_uv - stepY;
  v_uv33 = a_uv + stepXnY;

  v_uv00 = v_uv11 - stepXnY;
  v_uv01 = v_uv11 + stepY;
  v_uv02 = v_uv12 + stepY;
  v_uv03 = v_uv13 + stepY;
  v_uv04 = v_uv13 + stepXY;

  v_uv10 = v_uv11 - stepX;
  v_uv20 = v_uv21 - stepX;
  v_uv30 = v_uv31 - stepX;

  v_uv14 = v_uv13 + stepX;
  v_uv24 = v_uv23 + stepX;
  v_uv34 = v_uv33 + stepX;

  v_uv40 = v_uv31 - stepXY;
  v_uv41 = v_uv31 - stepY;
  v_uv42 = v_uv32 - stepY;
  v_uv43 = v_uv33 - stepY;
  v_uv44 = v_uv33 + stepXnY;
  
  gl_Position = vec4(a_position, 0.0, 1.0);
}
