import { GlWrapper } from "../gl/gl-wrapper";
import { Filter, FilterInstance } from "../impl/filter";
import Dropdown from "./Dropdown";
import "./FilterStack.css";
import React from "react";

interface FilterStackProps{
  glw: GlWrapper;
  filters: FilterInstance[];
  filterOptions: Filter[];
  onAddFilter: (filter: FilterInstance) => void;
  onRemoveFilter: (index: number) => void;
}

const FilterStack: React.FC<FilterStackProps> = ({
  filters,
  filterOptions,
  onAddFilter,
  onRemoveFilter,
}) => {
  return (
    <div id="filter-stack" className="flex-column">
      <Dropdown
        id="filter-dropdown"
        name="Add filter..."
        className="width-full"
        options={filterOptions.map(f => f.name)}
        onClickItem={(_, i) => onAddFilter({ filter: filterOptions[i], params: {}})}
      />
      <ol id="filter-stack-list" className="flex-column">{filters.map((f, i) => (
        <li itemID={`filter-stack-item-${i}`} key={i} className="flex-row width-full">
          <button type="button" onClick={() => onRemoveFilter(i)}>Remove</button>
          <p>{f.filter.name}</p>
        </li>
      ))}</ol>
    </div>
  );
}

export default FilterStack;
