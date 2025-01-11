#version 100

attribute vec2 a_position;
attribute vec2 a_uv;

varying vec2 v_uv;

uniform vec2 u_scale;

void main(){
  v_uv = a_uv;
  gl_Position = vec4(u_scale * a_position, 0.0, 1.0);
}
