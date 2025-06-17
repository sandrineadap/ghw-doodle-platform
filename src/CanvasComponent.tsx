import { useEffect, useRef, useState } from "react";

type CanvasProps = {
  selectedColour: string;
}

const CanvasComponent = ({ selectedColour }: CanvasProps ) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current; // the current value of the ref
    if (canvas) {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000000"; // default stroke colour
        ctx.lineWidth = 5;
        setCanvasContext(ctx);
      }
    }
  }, []);

  useEffect(() => {
    // update stroke colour from default to selected colour
    if(canvasContext) {
      canvasContext.strokeStyle = selectedColour;
    }
  }, [selectedColour, canvasContext]); // this effect is dependent on selectedColour and canvasContext

  const getMouseCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    // console.log("event::", event.clientX, event.clientY)
    return {
      x: event.clientX - rect.left, // subtraction to translate the x & y axis
      y: event.clientY - rect.top,  // subtraction to account for the canvas rectangle
    }
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasContext) return;

    const { x, y } = getMouseCoordinates(event);

    console.log({ x, y })

    canvasContext.beginPath(); // start a new drawing path
    canvasContext.moveTo(x, y);
    setIsDrawing(true);
  };
  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasContext) return;

    const { x, y } = getMouseCoordinates(event);

    canvasContext.lineTo(x, y);
    canvasContext.stroke(); // draw a line
  };
  const stopDrawing = () => {
    if (!canvasContext) return;

    canvasContext.closePath(); // close the current drawing path
    setIsDrawing(false);
  };

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
        onMouseDown={startDrawing} // when to start drawing
        onMouseUp={stopDrawing} // when to stop drawing
        onMouseMove={draw} // the actual drawing part
        onMouseLeave={stopDrawing} // stop drawing when it goes out of the canvas
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
