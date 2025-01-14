#version 100
precision mediump float;
precision mediump int;

#define MAX_RADIUS 24
#define PI 3.1415928

attribute vec2 a_position;
attribute vec2 a_uv;

varying vec2 v_uv[MAX_RADIUS];
varying float v_weights[MAX_RADIUS];

uniform vec2 u_resolution;
uniform int u_radius;

void main(){
  vec2 stepXY = 1.0 / u_resolution;
  vec2 stepY = vec2(0.0, stepXY.y);
  float r = float(u_radius);

  for(int i = 0; i < MAX_RADIUS; i++){
    if(i >= u_radius)break;

    float idx = float(i);
    float offset = idx - floor(r / 2.0);
    v_uv[i] = a_uv + offset * stepY;

    float s = float(u_radius - 1) / 6.0;
    v_weights[i] = exp(-float(offset * offset) / (2.0 * s * s));
  }

  gl_Position = vec4(a_position, 0.0, 1.0);
}
