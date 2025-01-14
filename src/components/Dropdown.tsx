import "./Dropdown.css";
import React, { useEffect, useRef } from "react";

interface DropdownItemProps{
  name: string;
  index: number;
  onClickItem: (item: string, index: number) => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  name,
  index,
  onClickItem,
}) => {
  return <p className="dropdown-item" onClick={() => onClickItem(name, index)}>{name}</p>
}

interface DropdownProps{
  id?: string;
  name: string;
  className?: string;
  options: string[];
  onClickItem: (item: string, index: number) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  id,
  name,
  className,
  options,
  onClickItem,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onClick = () => {
    contentRef.current?.classList.toggle("hide");
  }

  const onClickOutside = (e: MouseEvent) => {
    if(!(e.target instanceof HTMLElement))return;

    if(e.target !== buttonRef.current){
      contentRef.current?.classList.add("hide");
    }
  }

  useEffect(() => {
    window.addEventListener("click", onClickOutside);

    return () => {
      window.removeEventListener("click", onClickOutside);
    }
  });

  return (
    <div id={id} className={`dropdown ${className}`}>
      <button ref={buttonRef} className="width-full" onClick={onClick}>{name}</button>
      <div ref={contentRef} className="dropdown-content flex-column hide">
        {options.map((opt, i) => <DropdownItem name={opt} key={i} index={i} onClickItem={onClickItem}/>)}
      </div>
    </div>
  )
}

export default Dropdown;
