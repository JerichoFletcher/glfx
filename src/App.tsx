import "./App.css";

import { useCallback, useEffect, useState } from "react";
import ImageDisplay from "./components/ImageDisplay";
import FilterStack from "./components/FilterStack";
import { GlWrapper } from "./gl/gl-wrapper";
import { Filter, FilterInstance } from "./impl/filter";
import { FilterPipeline } from "./impl/filter-pipeline";
import getPresetFilterSet from "./impl/filters";
import { UniformType } from "./gl/gl-shader-program";

function App(){
  const [filters, setFilters] = useState<FilterInstance[]>([]);
  const [filterOptions, setFilterOptions] = useState<Filter[]>([]);
  const [pipeline, setPipeline] = useState<FilterPipeline | null>(null);
  const [glw, setGlw] = useState<GlWrapper | null>(null);

  const setFilterStack = (newFilters: FilterInstance[]) => {
    setFilters([...newFilters]);
  }

  const addFilter = (filter: FilterInstance) => {
    setFilters([...filters, filter]);
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  }

  const reorderFilter = (indexFrom: number, indexTo: number) => {
    if(
      0 <= indexFrom && indexFrom < filters.length
      && 0 <= indexTo && indexTo < filters.length
    ){
      const tgtFilter = filters[indexFrom];
      const newFilters = filters.filter((_, i) => i !== indexFrom);
      newFilters.splice(indexTo, 0, tgtFilter);

      setFilters(newFilters);
    }
  }

  const setFilterEnabled = (index: number, enabled: boolean) => {
    const tgtFilter = filters[index];
    
    if(tgtFilter.enabled !== enabled){
      tgtFilter.enabled = enabled;
      setFilters([...filters]);
    }
  }

  const updateArg = (index: number, key: string, value: UniformType, normalizeTo?: number) => {
    const tgtFilter = filters[index];
    tgtFilter.args[key] = { value, normalizeTo };
    
    setFilters([...filters]);
  }

  const onCanvasInit = useCallback((glw: GlWrapper) => {
    setGlw(glw);
    setPipeline(new FilterPipeline(glw, 1));
  }, []);

  useEffect(() => {
    if(!glw){
      setFilterOptions([]);
      return;
    }

    const filterSet = getPresetFilterSet(glw);
    setFilterOptions(filterSet);
  }, [glw]);

  return (
    <>
      <ImageDisplay filters={filters} pipeline={pipeline} onCanvasInit={onCanvasInit}/>
      {
        glw ? <FilterStack
          filters={filters}
          filterOptions={filterOptions}
          glw={glw}
          onSetFilterStack={setFilterStack}
          onAddFilter={addFilter}
          onRemoveFilter={removeFilter}
          onReorderFilter={reorderFilter}
          onSetFilterEnabled={setFilterEnabled}
          onUpdateArg={updateArg}
        /> : <h1 style={{ width: "30vw", padding: "10px" }}>WebGL not supported!</h1>
      }
    </>
  );
}

export default App;
