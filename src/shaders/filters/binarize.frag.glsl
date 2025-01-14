#version 100
precision mediump float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform float u_threshold;

vec4 threshold(vec4 x, float threshold){
  return vec4(
    x.r < threshold ? 0.0 : 1.0,
    x.g < threshold ? 0.0 : 1.0,
    x.b < threshold ? 0.0 : 1.0,
    1.0
  );
}

void main(){
  vec4 color = texture2D(u_texture, v_uv);
  gl_FragColor = threshold(color, u_threshold / 255.0);
}
