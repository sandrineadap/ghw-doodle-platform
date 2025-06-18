import { useState, useRef } from "react";
import CanvasComponent, { type CanvasRef } from "./CanvasComponent";
import ToolbarComponent from "./ToolbarComponent";

const App = () => {
  const [selectedColour, setSelectedColour] = useState("#1e1e1e");
  const [brushSize, setBrushSize] = useState(5);
  const [isErasing, setIsErasing] = useState(false);
  const [canUndoState, setCanUndoState] = useState(false);

  const canvasRef = useRef<CanvasRef>(null);

  const handleColourChange = (colour: string) => {
    setSelectedColour(colour);
  };

  const handleBrushSizeChange = (size: number) => {
    setBrushSize(size);
  };

  const handleEraserToggle = (erasing: boolean) => {
    setIsErasing(erasing);
  };

  const handleClearCanvas = () => {
    if(canvasRef.current) {
      canvasRef.current.clearCanvas();
      setCanUndoState(canvasRef.current.canUndo());
    }
  }

  // determines whether we're allowed to undo or not
  const handleUndo = () => {
    if(canvasRef.current) {
      canvasRef.current.undo();
      setCanUndoState(canvasRef.current.canUndo());
    }
  }

  // where the undo happens
  const handleUpdateUndoState = () => {
    if(canvasRef.current) {
      setCanUndoState(canvasRef.current.canUndo());
    }
  }

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
        isErasing={isErasing}
        onEraserToggle={handleEraserToggle}
        onClearCanvas={handleClearCanvas}
        onUndo={handleUndo}
        canUndo={canUndoState}
      />
      <CanvasComponent
        ref={canvasRef}
        selectedColour={selectedColour}
        brushSize={brushSize}
        isErasing={isErasing}
        onUpdateUndoState={handleUpdateUndoState}
      />
    </main>
  );
};

export default App;
