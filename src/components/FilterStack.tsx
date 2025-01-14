import { GlWrapper } from "../gl/gl-wrapper";
import { Filter, FilterArgs, FilterInstance } from "../impl/filter";
import Dropdown from "./Dropdown";
import "./FilterStack.css";
import React, { useRef } from "react";
import FilterStackItem from "./FilterStackItem";
import { UniformType } from "../gl/gl-shader-program";

interface FilterStackJson{
  stack: {
    filter: string;
    enabled: boolean;
    args: FilterArgs;
  }[];
}

interface FilterStackProps{
  glw: GlWrapper;
  filters: FilterInstance[];
  filterOptions: Filter[];
  onSetFilterStack: (filters: FilterInstance[]) => void;
  onAddFilter: (filter: FilterInstance) => void;
  onRemoveFilter: (index: number) => void;
  onReorderFilter: (indexFrom: number, indexTo: number) => void;
  onSetFilterEnabled: (index: number, enabled: boolean) => void;
  onUpdateArg: (index: number, key: string, value: UniformType, normalizeTo?: number) => void;
}

const FilterStack: React.FC<FilterStackProps> = ({
  filters,
  filterOptions,
  onSetFilterStack,
  onAddFilter,
  onRemoveFilter,
  onReorderFilter,
  onSetFilterEnabled,
  onUpdateArg,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const createFilterInstance = (filter: Filter): FilterInstance => {
    return {
      filter,
      enabled: true,
      args: Object.fromEntries(
        Object.entries(filter.params).map(([k, v]) => [k, {
          value: v.default,
          normalizeTo: v.type === "matrix" ? v.normalizeTo : undefined,
        }])
      ),
    }
  }

  const onFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target.files || e.target.files.length === 0)return;

    const file = e.target.files.item(0);
    if(!file)return;

    if(file){
      const content = await file.text();
      const json = JSON.parse(content);

      const stack = jsonToStack(json);
      if(stack !== null)onSetFilterStack(stack);
    }
  }

  const stackToJson = (stack: FilterInstance[]): FilterStackJson => ({
    stack: stack.map(({ filter, enabled, args }) => ({
      filter: filter.name,
      enabled, args,
    })),
  });

  const jsonToStack = (json: FilterStackJson): FilterInstance[] | null => {
    const stack: FilterInstance[] = [];
    for(const fi of json.stack){
      const associatedFilter = filterOptions.find(f => f.name === fi.filter);
      if(!associatedFilter){
        alert(`Unknown filter: ${fi.filter}`);
        return null;
      }

      stack.push({
        filter: associatedFilter,
        enabled: fi.enabled,
        args: fi.args,
      });
    }

    return stack;
  }

  const exportStack = (stack: FilterInstance[]) => {
    const json = stackToJson(stack);
    const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "glfx_stack.json";
    link.click();
    link.remove();
  }

  const importStack = () => {
    inputRef.current?.click();
  }

  return (
    <>
      <div id="filter-stack" className="flex-column g-8">
        <div className="flex-row width-full g-8">
          <button type="button" className="width-full" onClick={() => exportStack(filters)}>Export Stack</button>
          <button type="button" className="width-full" onClick={() => importStack()}>Import Stack</button>
        </div>
        <Dropdown
          id="filter-dropdown"
          name="Add filter..."
          className="width-full"
          options={filterOptions.map(f => f.name)}
          onClickItem={(_, i) => onAddFilter(createFilterInstance(filterOptions[i]))}
        />
        <ol id="filter-stack-list" className="flex-column m-0 p-0 g-8">{filters.map((f, i) => (
          <FilterStackItem
            key={i}
            filterInstance={f}
            index={i}
            listLength={filters.length}
            onRemove={() => onRemoveFilter(i)}
            onReorderUp={() => onReorderFilter(i, i - 1)}
            onReorderDown={() => onReorderFilter(i, i + 1)}
            onSetFilterEnabled={b => onSetFilterEnabled(i, b)}
            onUpdateArg={(k, v, n) => onUpdateArg(i, k, v, n)}
          />
        ))}</ol>
      </div>
      <input ref={inputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={onFileInput}/>
    </>
  );
}

export default FilterStack;
