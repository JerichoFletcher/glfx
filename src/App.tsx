import { useState } from "react";
import "./App.css";
import VideoPlayer from "./components/VideoPlayer";

function App(){
  const [filters, _] = useState<string[]>([]);

  return (
    <>
      <VideoPlayer filters={filters}/>
    </>
  );
}

export default App;
