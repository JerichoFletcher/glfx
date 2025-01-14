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
      <div className="flex-row">
        <p>{value}</p>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(e.target.valueAsNumber)}
        />
      </div>
    </div>
  );
}

interface FilterMatrixProps extends FilterArgProps{
  value: number[];
  normalizeTo: number;
  onChange: (value: number[], normalizeTo: number) => void;
}

const FilterMatrix: React.FC<FilterMatrixProps> = ({
  name,
  value,
  normalizeTo,
  onChange,
}) => {
  const dimension = Math.round(Math.sqrt(value.length));
  return (
    <div className="flex-row space-between">
      <p>{name}</p>
      <div className="flex-column">
        <table>
          <tbody>
            {[...Array(dimension).keys()].map(row => (
              <tr key={row}>
                {[...Array(dimension).keys()].map(col => (
                  <td key={col}>
                    <input
                      type="number"
                      value={value[row * dimension + col]}
                      className="filter-args-matrix-cell"
                      onChange={e => {
                        const newValue = [...value];
                        newValue[row * dimension + col] = e.target.valueAsNumber;
                        onChange(newValue, normalizeTo);
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex-row space-between">
          <p>Normalize to</p>
          <input
            type="number"
            value={normalizeTo}
            className="filter-args-matrix-cell"
            onChange={e => onChange(value, e.target.valueAsNumber)}
          />
        </div>
      </div>
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
  onSetFilterEnabled: (enabled: boolean) => void;
  onUpdateArg: (key: string, value: UniformType, normalizeTo?: number) => void;
}

const FilterStackItem: React.FC<FilterStackItemProps> = ({
  filterInstance,
  index,
  listLength,
  onRemove,
  onReorderUp,
  onReorderDown,
  onSetFilterEnabled,
  onUpdateArg,
}) => {
  const enabledToggleId = `filter-item-${index}-enabled`;
  return (
    <li className="flex-column width-full filter-stack-item g-8">
      <div className="flex-row space-between">
        <div className="flex-row filter-stack-button-group g-8">
          <button type="button" onClick={() => onRemove()}>
            <img src={trashIcon}/>
          </button>
          <div className="flex-column filter-stack-button-group g-8">
            <button type="button" className="small" disabled={index === 0} onClick={() => onReorderUp()}>
              <img src={arrowIcon}/>
            </button>
            <button type="button" className="small" disabled={index === listLength - 1} onClick={() => onReorderDown()}>
              <img src={arrowIcon} style={{ transform: "rotate(180deg)" }}/>
            </button>
          </div>
        </div>
        <h3 style={{ padding: "0 8px" }}>{filterInstance.filter.name}</h3>
      </div>
      <div className="flex-row">
        <input
          id={enabledToggleId}
          type="checkbox"
          checked={filterInstance.enabled}
          onChange={() => onSetFilterEnabled(!filterInstance.enabled)}
        />
        <label htmlFor={enabledToggleId}>Enabled</label>
      </div>
      {Object.keys(filterInstance.filter.params).length > 0 && (
        <div className="flex-column filter-stack-args">
          {Object.entries(filterInstance.filter.params).map(([k, v], i) => {
            const name = v.alternateName ?? getReadableName(k);
            switch(v.type){
              case "field":
                return <FilterField
                  key={i}
                  name={name}
                  value={filterInstance.args[k].value as number}
                  min={v.min}
                  max={v.max}
                  step={v.step}
                  onChange={x => onUpdateArg(k, x)}
                />
              case "slider":
                return <FilterSlider
                  key={i}
                  name={name}
                  value={filterInstance.args[k].value as number}
                  min={v.min}
                  max={v.max}
                  step={v.step}
                  onChange={x => onUpdateArg(k, x)}
                />
              case "matrix":
                return <FilterMatrix
                  key={i}
                  name={name}
                  value={filterInstance.args[k].value as number[]}
                  normalizeTo={filterInstance.args[k].normalizeTo!}
                  onChange={(m, n) => onUpdateArg(k, m, n)}
                />
              case "check":
              case "vector":
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
