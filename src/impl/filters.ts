import commonVert from "../shaders/filters/common.vert.glsl";
import invertFrag from "../shaders/filters/negative.frag.glsl";
import bnwFrag from "../shaders/filters/black-and-white.glsl";
import brightnessFrag from "../shaders/filters/brightness-contrast.frag.glsl";
import gammaFrag from "../shaders/filters/gamma.frag.glsl";
import hslFrag from "../shaders/filters/hsl.frag.glsl";
import binarizeFrag from "../shaders/filters/binarize.frag.glsl";
import quantizeFrag from "../shaders/filters/quantize.frag.glsl";

import convolve3Vert from "../shaders/filters/convolve-3.vert.glsl";
import convolve3Frag from "../shaders/filters/convolve-3.frag.glsl";
import convolve5Vert from "../shaders/filters/convolve-5.vert.glsl";
import convolve5Frag from "../shaders/filters/convolve-5.frag.glsl";

import { GlWrapper } from "../gl/gl-wrapper";
import { Filter } from "./filter";

export default function getPresetFilterSet(glw: GlWrapper): Filter[]{
  return [
    new Filter(glw, "Invert", commonVert, invertFrag, {}),
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
    new Filter(glw, "HSL", commonVert, hslFrag, {
      "u_hue": {
        type: "slider",
        default: 0,
        min: -180,
        max: 180,
        step: 0.1,
      },
      "u_saturation": {
        type: "slider",
        default: 0,
        min: -1,
        max: 1,
        step: 0.1,
      },
      "u_lightness": {
        type: "slider",
        default: 0,
        min: -1,
        max: 1,
        step: 0.1,
      },
    }),
    new Filter(glw, "Binarize", commonVert, binarizeFrag, {
      "u_threshold": {
        type: "slider",
        default: 127,
        min: 0,
        max: 255,
        step: 1,
      },
    }),
    new Filter(glw, "Quantize", commonVert, quantizeFrag, {
      "u_rLevels": {
        type: "field",
        default: 16,
        min: 2,
        max: 64,
        step: 1,
      },
      "u_gLevels": {
        type: "field",
        default: 16,
        min: 2,
        max: 64,
        step: 1,
      },
      "u_bLevels": {
        type: "field",
        default: 16,
        min: 2,
        max: 64,
        step: 1,
      },
    }),
    new Filter(glw, "Convolution 3x3", convolve3Vert, convolve3Frag, {
      "u_kernel[0]": {
        type: "matrix",
        alternateName: "Kernel",
        default: [
          1, 1, 1,
          1, 1, 1,
          1, 1, 1,
        ],
        normalizeTo: 1,
      },
    }),
    new Filter(glw, "Convolution 5x5", convolve5Vert, convolve5Frag, {
      "u_kernel[0]": {
        type: "matrix",
        alternateName: "Kernel",
        default: [
          1, 4, 7, 4, 1,
          4, 16, 26, 16, 4,
          7, 26, 41, 26, 7,
          4, 16, 26, 16, 4,
          1, 4, 7, 4, 1,
        ],
        normalizeTo: 1,
      },
    }),
  ]
}
