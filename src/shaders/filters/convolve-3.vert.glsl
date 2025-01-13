#version 100

attribute vec2 a_position;
attribute vec2 a_uv;

varying vec2 v_uvLU;
varying vec2 v_uvMU;
varying vec2 v_uvRU;

varying vec2 v_uvLM;
varying vec2 v_uvMM;
varying vec2 v_uvRM;

varying vec2 v_uvLD;
varying vec2 v_uvMD;
varying vec2 v_uvRD;

uniform vec2 u_resolution;

void main(){  
  vec2 stepXY = 1.0 / u_resolution;
  vec2 stepX = vec2(stepXY.x, 0.0);
  vec2 stepY = vec2(0.0, stepXY.y);
  vec2 stepXnY = vec2(stepXY.x, -stepXY.y);
  
  v_uvLU = a_uv - stepXnY;
  v_uvMU = a_uv + stepY;
  v_uvRU = a_uv + stepXY;

  v_uvLM = a_uv - stepX;
  v_uvMM = a_uv;
  v_uvRM = a_uv + stepX;

  v_uvLD = a_uv - stepXY;
  v_uvMD = a_uv - stepY;
  v_uvRD = a_uv + stepXnY;
  
  gl_Position = vec4(a_position, 0.0, 1.0);
}
