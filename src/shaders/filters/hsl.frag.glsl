#version 100
precision mediump float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform float u_hue;
uniform float u_saturation;
uniform float u_lightness;

vec3 rgbToHsl(vec3 color){
  float cMax = max(max(color.r, color.g), color.b);
  float cMin = min(min(color.r, color.g), color.b);
  float c = cMax - cMin;

  float l = (cMax + cMin) / 2.0;
  float s = c / (1.0 - abs(2.0 * l - 1.0));
  float h = 0.0;

  if(cMax == color.r){
    h = mod((color.g - color.b) / c + 6.0, 6.0);
  }else if(cMax == color.g){
    h = (color.b - color.r) / c + 2.0;
  }else if(cMax == color.b){
    h = (color.r - color.g) / c + 4.0;
  }

  return vec3(60.0 * h, s, l);
}

vec3 hslToRgb(vec3 hsl){
  float h = hsl.x, s = hsl.y, l = hsl.z;

  if(s == 0.0)return vec3(l, l, l);

  float c = s * (1.0 - abs(2.0 * l - 1.0));
  float hP = h / 60.0;
  float x = c * (1.0 - abs(mod(hP, 2.0) - 1.0));

  vec2 cx = vec2(c, x);
  vec3 col = vec3(0.0, 0.0, 0.0);
  if(hP <= 1.0){
    col.rg = cx;
  }else if(hP <= 2.0){
    col.gr = cx;
  }else if(hP <= 3.0){
    col.gb = cx;
  }else if(hP <= 4.0){
    col.bg = cx;
  }else if(hP <= 5.0){
    col.br = cx;
  }else{
    col.rb = cx;
  }

  float m = l - c / 2.0;
  return col + vec3(m);
}

vec3 shiftHsl(vec3 hsl, vec3 shift){
  return vec3(
    mod(hsl.x + shift.x, 360.0),
    clamp(hsl.y + shift.y, 0.0, 1.0),
    clamp(hsl.z + shift.z, 0.0, 1.0)
  );
}

void main(){
  vec4 color = texture2D(u_texture, v_uv);
  vec3 hsl0 = rgbToHsl(color.rgb);
  vec3 hsl1 = shiftHsl(hsl0, vec3(u_hue, u_saturation, u_lightness));
  gl_FragColor = vec4(hslToRgb(hsl1), 1.0);
}
