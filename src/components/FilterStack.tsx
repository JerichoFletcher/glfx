import { GlWrapper } from "../gl/gl-wrapper";
import { Filter, FilterInstance } from "../impl/filter";
import Dropdown from "./Dropdown";
import "./FilterStack.css";
import React from "react";
import FilterStackItem from "./FilterStackItem";
import { UniformType } from "../gl/gl-shader-program";

interface FilterStackProps{
  glw: GlWrapper;
  filters: FilterInstance[];
  filterOptions: Filter[];
  onAddFilter: (filter: FilterInstance) => void;
  onRemoveFilter: (index: number) => void;
  onReorderFilter: (indexFrom: number, indexTo: number) => void;
  onUpdateArg: (index: number, key: string, value: UniformType) => void;
}

const FilterStack: React.FC<FilterStackProps> = ({
  filters,
  filterOptions,
  onAddFilter,
  onRemoveFilter,
  onReorderFilter,
  onUpdateArg,
}) => {
  const createFilterInstance = (filter: Filter): FilterInstance => {
    return {
      filter,
      args: Object.fromEntries(Object.entries(filter.params).map(([k, v]) => [k, v.default])),
    }
  }

  return (
    <div id="filter-stack" className="flex-column">
      <Dropdown
        id="filter-dropdown"
        name="Add filter..."
        className="width-full"
        options={filterOptions.map(f => f.name)}
        onClickItem={(_, i) => onAddFilter(createFilterInstance(filterOptions[i]))}
      />
      <ol id="filter-stack-list" className="flex-column">{filters.map((f, i) => (
        <FilterStackItem
          key={i}
          filterInstance={f}
          index={i}
          listLength={filters.length}
          onRemove={() => onRemoveFilter(i)}
          onReorderUp={() => onReorderFilter(i, i - 1)}
          onReorderDown={() => onReorderFilter(i, i + 1)}
          onUpdateArg={(k, v) => onUpdateArg(i, k, v)}
        />
      ))}</ol>
    </div>
  );
}

export default FilterStack;
