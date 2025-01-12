import "./FilterStack.css";
import React from "react";

interface FilterStackProps{
  filters: string[];
  onAddFilter: (filter: string) => void;
  onRemoveFilter: (index: number) => void;
}

const FilterStack: React.FC<FilterStackProps> = ({
  filters,
  onAddFilter,
  onRemoveFilter,
}) => {
  return (
    <div id="filter-stack" className="flex-column">
      <button type="button" onClick={() => onAddFilter(`foo-${filters.length}`)}>Add filter</button>
      <ol id="filter-stack-list" className="flex-column">{filters.map((f, i) => (
        <li itemID={`filter-stack-item-${i}`} key={i} className="flex-row width-full">
          <button type="button" onClick={() => onRemoveFilter(i)}>Remove</button>
          <p>{f}</p>
        </li>
      ))}</ol>
    </div>
  );
}

export default FilterStack;
