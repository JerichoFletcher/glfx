import commonVert from "../shaders/filters/common.vert.glsl";
import brightnessFrag from "../shaders/filters/brightness.frag.glsl";
import negativeFrag from "../shaders/filters/negative.frag.glsl";

import { GlWrapper } from "../gl/gl-wrapper";
import { Filter } from "./filter";

export default function getPresetFilterSet(glw: GlWrapper): Filter[]{
  return [
    new Filter(glw, "Negative", commonVert, negativeFrag, {}),
    new Filter(glw, "Brightness", commonVert, brightnessFrag, {
      "u_offset": {
        type: "slider",
        default: 0,
        min: -128,
        max: 128,
        step: 1,
      },
    }),
  ]
}
