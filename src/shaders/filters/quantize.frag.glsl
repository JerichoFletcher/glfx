#version 100
precision mediump float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform int u_rLevels;
uniform int u_gLevels;
uniform int u_bLevels;

float toBin(float val, int level){
  return floor(val * 255.0 / 256.0 * float(level)) / float(level - 1);
}

void main(){
  vec4 color = texture2D(u_texture, v_uv);
  gl_FragColor = vec4(
    toBin(color.r, u_rLevels),
    toBin(color.g, u_gLevels),
    toBin(color.b, u_bLevels),
    1.0
  );
}
