import commonVert from "./shaders/filters/common.vert.glsl";
import brightnessFrag from "./shaders/filters/brightness.frag.glsl";
import negativeFrag from "./shaders/filters/negative.frag.glsl";
import "./App.css";

import { useCallback, useEffect, useState } from "react";
import VideoPlayer from "./components/VideoPlayer";
import FilterStack from "./components/FilterStack";
import { GlWrapper } from "./gl/gl-wrapper";
import { Filter, FilterInstance } from "./impl/filter";

function App(){
  const [filters, setFilters] = useState<FilterInstance[]>([]);
  const [filterOptions, setFilterOptions] = useState<Filter[]>([]);
  const [glw, setGlw] = useState<GlWrapper | null>(null);

  const addFilter = (filter: FilterInstance) => {
    setFilters([filter, ...filters]);
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  }

  const onCanvasInit = useCallback((glw: GlWrapper) => setGlw(glw), []);

  useEffect(() => {
    if(!glw){
      setFilterOptions([]);
      return;
    }

    setFilterOptions([
      new Filter(glw, "Brightness", commonVert, brightnessFrag),
      new Filter(glw, "Negative", commonVert, negativeFrag),
    ]);
  }, [glw]);

  return (
    <>
      <VideoPlayer filters={filters} onCanvasInit={onCanvasInit}/>
      {
        glw ? <FilterStack
          filters={filters}
          filterOptions={filterOptions}
          glw={glw}
          onAddFilter={addFilter}
          onRemoveFilter={removeFilter}
        /> : <h1 style={{ width: "30vw", padding: "10px" }}>WebGL not supported!</h1>
      }
    </>
  );
}

export default App;
