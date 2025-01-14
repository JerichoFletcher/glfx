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
  onSetFilterEnabled: (index: number, enabled: boolean) => void;
  onUpdateArg: (index: number, key: string, value: UniformType, normalizeTo?: number) => void;
}

const FilterStack: React.FC<FilterStackProps> = ({
  filters,
  filterOptions,
  onAddFilter,
  onRemoveFilter,
  onReorderFilter,
  onSetFilterEnabled,
  onUpdateArg,
}) => {
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
          onSetFilterEnabled={b => onSetFilterEnabled(i, b)}
          onUpdateArg={(k, v, n) => onUpdateArg(i, k, v, n)}
        />
      ))}</ol>
    </div>
  );
}

export default FilterStack;
