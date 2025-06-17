import { useState } from "react";
import CanvasComponent from "./CanvasComponent";
import ToolbarComponent from "./ToolbarComponent";

const App = () => {
  const [selectedColour, setSelectedColour] = useState("#1e1e1e");
  const [brushSize, setBrushSize] = useState(5);

  const handleColourChange = (colour: string) => {
    setSelectedColour(colour);
  };

  const handleBrushSizeChange = (size: number) => {
    setBrushSize(size);
  };

  return (
    <main>
      <h1
        style={{
          textAlign: "center",
          color: "#333333",
          marginBottom: "20px",
          padding: "4px 0", // padding 4px on top & bottom; none for left and right
        }}
      >
        Doodle Canvas
      </h1>
      <ToolbarComponent
        selectedColour={selectedColour}
        onColourChange={handleColourChange}
        brushSize={brushSize}
        onBrushSizeChange={handleBrushSizeChange}
      />
      <CanvasComponent selectedColour={selectedColour} brushSize={brushSize}/>
    </main>
  );
};

export default App;
