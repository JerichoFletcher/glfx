import "./FilterStackItem.css";
import trashIcon from "../assets/trash.svg";
import arrowIcon from "../assets/arrow.svg";

import React from "react";
import { FilterInstance } from "../impl/filter";
import { getReadableName } from "../utils/names";
import { UniformType } from "../gl/gl-shader-program";

interface FilterArgProps{
  name: string;
}

interface FilterFieldProps extends FilterArgProps{
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

const FilterField: React.FC<FilterFieldProps> = ({
  name,
  value,
  min,
  max,
  step,
  onChange
}) => {
  return (
    <div className="flex-row space-between">
      <p>{name}</p>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(e.target.valueAsNumber)}
      />
    </div>
  )
}

interface FilterSliderProps extends FilterArgProps{
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

const FilterSlider: React.FC<FilterSliderProps> = ({
  name,
  value,
  min,
  max,
  step,
  onChange,
}) => {
  return (
    <div className="flex-row space-between">
      <p>{name}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(e.target.valueAsNumber)}
      />
    </div>
  );
}

interface FilterStackItemProps{
  filterInstance: FilterInstance;
  index: number;
  listLength: number;
  onRemove: () => void;
  onReorderUp: () => void;
  onReorderDown: () => void;
  onUpdateArg: (key: string, value: UniformType) => void;
}

const FilterStackItem: React.FC<FilterStackItemProps> = ({
  filterInstance,
  index,
  listLength,
  onRemove,
  onReorderUp,
  onReorderDown,
  onUpdateArg,
}) => {
  return (
    <li className="flex-column width-full filter-stack-item">
      <div className="flex-row space-between">
        <div className="flex-row filter-stack-button-group">
          <button type="button" onClick={() => onRemove()}>
            <img src={trashIcon}/>
          </button>
          <div className="flex-column filter-stack-button-group">
            <button type="button" className="small" disabled={index === 0} onClick={() => onReorderUp()}>
              <img src={arrowIcon}/>
            </button>
            <button type="button" className="small" disabled={index === listLength - 1} onClick={() => onReorderDown()}>
              <img src={arrowIcon} style={{ transform: "rotate(180deg)" }}/>
            </button>
          </div>
        </div>
        <h3>{filterInstance.filter.name}</h3>
      </div>
      {Object.keys(filterInstance.filter.params).length > 0 && (
        <div className="flex-column filter-stack-args">
          {Object.entries(filterInstance.filter.params).map(([k, v], i) => {
            const name = getReadableName(k);
            switch(v.type){
              case "field":
                return <FilterField
                  key={i}
                  name={name}
                  value={filterInstance.args[k] as number}
                  min={v.min}
                  max={v.max}
                  step={v.step}
                  onChange={x => onUpdateArg(k, x)}
                />
              case "slider":
                return <FilterSlider
                  key={i}
                  name={name}
                  value={filterInstance.args[k] as number}
                  min={v.min}
                  max={v.max}
                  step={v.step}
                  onChange={x => onUpdateArg(k, x)}
                />
              case "check":
              case "vector":
              case "matrix":
              case "prov":
                return <p key={i}>{name}</p>;
            }
          })}
        </div>
      )}
    </li>
  );
}

export default FilterStackItem;
