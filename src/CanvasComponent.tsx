import { useEffect, useRef } from "react";

const CanvasComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current; // the current value of the ref
    if (canvas) {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 5;
        // TODO: remove this later. just to show that I can draw a rectangle in the canvas
        ctx.fillStyle = "#ffaa00";
        ctx.fillRect(0, 0, 100, 100);
      }
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <canvas
        ref={canvasRef}
        id="DoodleCanvas"
        // TODO: Implement mouse functionalities
        // onMouseDown={}   // when to start drawing
        // onMouseUp={}     // when to stop drawing
        // onMouseMove={}   // the actual drawing part
        // onMouseLeave={}  // stop drawing when it goes out of the canvas
        style={{
          border: "2px solid #333333",
          borderRadius: "8px",
          cursor: "crosshair",
          backgroundColor: "white",
          width: "850px",
          height: "600px",
        }}
      >
        Your browser does not suport HTML5 canvas API!
      </canvas>
    </div>
  );
};

export default CanvasComponent;
