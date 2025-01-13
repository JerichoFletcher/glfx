import commonVert from "../shaders/filters/common.vert.glsl";
import negativeFrag from "../shaders/filters/negative.frag.glsl";
import bnwFrag from "../shaders/filters/black-and-white.glsl";
import brightnessFrag from "../shaders/filters/brightness-contrast.frag.glsl";
import gammaFrag from "../shaders/filters/gamma.frag.glsl";

import convolve3Vert from "../shaders/filters/convolve-3.vert.glsl";
import convolve3Frag from "../shaders/filters/convolve-3.frag.glsl";

import { GlWrapper } from "../gl/gl-wrapper";
import { Filter } from "./filter";

export default function getPresetFilterSet(glw: GlWrapper): Filter[]{
  return [
    new Filter(glw, "Invert", commonVert, negativeFrag, {}),
    new Filter(glw, "Black and White", commonVert, bnwFrag, {}),
    new Filter(glw, "Brightness/Contrast", commonVert, brightnessFrag, {
      "u_brightness": {
        type: "slider",
        default: 0,
        min: -128,
        max: 128,
        step: 1,
      },
      "u_contrast": {
        type: "slider",
        default: 0,
        min: -255,
        max: 255,
        step: 1,
      },
    }),
    new Filter(glw, "Gamma Correction", commonVert, gammaFrag, {
      "u_gamma": {
        type: "slider",
        default: 1,
        min: 0.01,
        max: 7.99,
        step: 0.01,
      },
    }),
    new Filter(glw, "Convolution 3x3", convolve3Vert, convolve3Frag, {
      "u_kernel[0]": {
        type: "matrix",
        alternateName: "Kernel",
        default: [
          1/9, 1/9, 1/9,
          1/9, 1/9, 1/9,
          1/9, 1/9, 1/9,
        ],
      },
    }),
  ]
}