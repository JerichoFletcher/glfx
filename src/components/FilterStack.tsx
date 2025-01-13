import { GlWrapper } from "../gl/gl-wrapper";
import { Filter, FilterInstance } from "../impl/filter";
import Dropdown from "./Dropdown";
import "./FilterStack.css";
import React from "react";
import FilterStackItem from "./FilterStackItem";

interface FilterStackProps{
  glw: GlWrapper;
  filters: FilterInstance[];
  filterOptions: Filter[];
  onAddFilter: (filter: FilterInstance) => void;
  onRemoveFilter: (index: number) => void;
  onReorderFilter: (indexFrom: number, indexTo: number) => void;
}

const FilterStack: React.FC<FilterStackProps> = ({
  filters,
  filterOptions,
  onAddFilter,
  onRemoveFilter,
  onReorderFilter,
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
          canMoveUp={i > 0}
          canMoveDown={i < filters.length - 1}
          onRemove={() => onRemoveFilter(i)}
          onReorderUp={() => onReorderFilter(i, i - 1)}
          onReorderDown={() => onReorderFilter(i, i + 1)}
        />
      ))}</ol>
    </div>
  );
}

export default FilterStack;
