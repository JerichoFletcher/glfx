import "./FilterStackItem.css";
import trashIcon from "../assets/trash.svg";
import arrowIcon from "../assets/arrow.svg";

import { FilterInstance } from "../impl/filter";

import React from "react";

interface FilterStackItemProps{
  filterInstance: FilterInstance;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onRemove: () => void;
  onReorderUp: () => void;
  onReorderDown: () => void;
}

const FilterStackItem: React.FC<FilterStackItemProps> = ({
  filterInstance,
  canMoveUp,
  canMoveDown,
  onRemove,
  onReorderUp,
  onReorderDown,
}) => {
  return (
    <li className="flex-column width-full filter-stack-item">
      <div className="flex-row space-between">
        <div className="flex-row filter-stack-button-group">
          <button type="button" onClick={() => onRemove()}>
            <img src={trashIcon}/>
          </button>
          <div className="flex-column filter-stack-button-group">
            <button type="button" className="small" disabled={!canMoveUp} onClick={() => onReorderUp()}>
              <img src={arrowIcon}/>
            </button>
            <button type="button" className="small" disabled={!canMoveDown} onClick={() => onReorderDown()}>
              <img src={arrowIcon} style={{ transform: "rotate(180deg)" }}/>
            </button>
          </div>
        </div>
        <h3>{filterInstance.filter.name}</h3>
      </div>
      <div className="flex-column width-full">

      </div>
    </li>
  );
}

export default FilterStackItem;
