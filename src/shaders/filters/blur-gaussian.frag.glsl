#version 100
precision mediump float;
precision mediump int;

#define MAX_RADIUS 24

varying vec2 v_uv[MAX_RADIUS];
varying float v_weights[MAX_RADIUS];

uniform sampler2D u_texture;
uniform int u_radius;

void main(){
  vec4 color = vec4(0.0);
  float weightSum = 0.0;

  for(int i = 0; i < MAX_RADIUS; i++){
    if(i >= u_radius)break;

    color += texture2D(u_texture, v_uv[i]) * v_weights[i];
    weightSum += v_weights[i];
  }

  gl_FragColor = color / weightSum;
}
