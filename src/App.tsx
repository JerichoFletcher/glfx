import { useState } from "react";
import "./App.css";
import VideoPlayer from "./components/VideoPlayer";
import FilterStack from "./components/FilterStack";

function App(){
  const [filters, setFilters] = useState<string[]>([]);

  const addFilter = (filter: string) => {
    setFilters([filter, ...filters]);
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  }

  return (
    <>
      <VideoPlayer filters={filters}/>
      <FilterStack filters={filters} onAddFilter={addFilter} onRemoveFilter={removeFilter}/>
    </>
  );
}

export default App;
