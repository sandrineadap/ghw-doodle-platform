import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { ToolTypes } from "./App";

export type CanvasRef = {
  clearCanvas: () => void;
  undo: () => void;
  canUndo: () => boolean;
};

type CanvasProps = {
  selectedColour: string;
  brushSize: number;
  isErasing: boolean;
  currentTool: ToolTypes;
  onUpdateUndoState: () => void;
  ref: React.RefObject<CanvasRef | null>;
};

const CanvasComponent = ({
  selectedColour,
  brushSize,
  isErasing,
  currentTool,
  onUpdateUndoState,
  ref,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [historyState, setHistoryState] = useState<{
    history: string[];
    currentIndex: number;
  }>({
    history: [],
    currentIndex: -1,
  });

  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(
    null
  );

  const maxHistorySize = 20; // Limit history to save

  // sets up the drawing canvas and sets default brush styles on mount
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
        ctx.lineWidth = 5; // default brush size
        setCanvasContext(ctx);
      }

      // Create preview canvas for shapes
      const preview = document.createElement("canvas");
      preview.width = width;
      preview.height = height;
      // Make sure the preview canvas is added to the DOM, even if it's hidden
      preview.style.display = 'none'; // Hide the preview canvas
      document.body.appendChild(preview); // Append to the body or another appropriate container
      setPreviewCanvas(preview);
    }
  }, []);

  // save the initial blank canvas
  useEffect(() => {
    if (canvasContext && canvasRef.current) {
      setTimeout(() => {
        const imageData = canvasRef.current!.toDataURL(); // keeps track of the image
        setHistoryState({
          history: [imageData],
          currentIndex: 0,
        });
      }, 0); // 0 can be changed to however long you want to wait before invoking a save
    }
  }, [canvasContext]);

  // save the canvas (called after stopDrawing())
  const saveCanvasState = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL();

      setHistoryState((prevState) => {
        const newHistory = prevState.history.slice(
          0,
          prevState.currentIndex + 1
        );
        // add a new state
        newHistory.push(imageData);

        // calculate new index of undo
        let newIndex = newHistory.length - 1;
        // handle reached max history
        if (newHistory.length > maxHistorySize) {
          newHistory.shift(); // removes first element in array
          newIndex - newHistory.length - 1;
        }

        return {
          history: newHistory,
          currentIndex: newIndex,
        };
      });

      if (onUpdateUndoState) {
        setTimeout(onUpdateUndoState, 0);
      }
    }
  }, [maxHistorySize, onUpdateUndoState]);

  // the actual undoing
  const restoreCanvasState = useCallback(
    (imageData: string) => {
      if (canvasContext && canvasRef.current) {
        const canvas = canvasRef.current;
        const img = new Image();
        img.onload = () => {
          canvasContext.clearRect(0, 0, canvas.width, canvas.height); // clear canvas so you don't draw on top of previous strokes
          canvasContext.drawImage(img, 0, 0); // draw image (has nothing yet)
        };
        img.src = imageData; // image now has imageData (previous state drawing)
      }
    },
    [canvasContext]
  );

  // update brush styles (colour, size, eraser, etc.)
  useEffect(() => {
    if (canvasContext) {
      if (isErasing) {
        canvasContext.globalCompositeOperation = "destination-out"; // what tells the dom to delete
        canvasContext.strokeStyle = "rgba(0, 0, 0, 1)"; // completely transparent
      } else {
        canvasContext.globalCompositeOperation = "source-over";
        canvasContext.strokeStyle = selectedColour;
      }
      canvasContext.lineWidth = brushSize;
    }
  }, [selectedColour, brushSize, isErasing, canvasContext]); // this effect is dependent on selectedColour and canvasContext

  const drawLine = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.closePath();
  };
  const drawRectangle = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    const width = endX - startX;
    const height = endY - startY;
    ctx.beginPath();
    ctx.rect(startX, startY, width, height);
    ctx.stroke();
    ctx.closePath();
  };
  const drawCircle = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    const radius = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  };

  const getMouseCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // scale factor for x-axis
    const scaleY = canvas.height / rect.height; // scale factor for y-axis

    return {
      x: (event.clientX - rect.left) * scaleX, // subtraction to translate the x & y axis
      y: (event.clientY - rect.top) * scaleY, // subtraction to account for the canvas rectangle
    };
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasContext) return;

    const { x, y } = getMouseCoordinates(event);

    if (currentTool === "brush") {
      canvasContext.beginPath(); // start a new drawing path
      canvasContext.moveTo(x, y);
      setIsDrawing(true);
    } else {
      setStartPoint({ x, y }); // set the starting point for shapes
      setIsDrawing(true);
      if (canvasRef.current && previewCanvas) {
        const canvas = canvasRef.current;
        const currentImageData = canvasContext.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const previewCtx = previewCanvas.getContext("2d");
        if (previewCtx) {
          previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height); // clear the preview canvas
          previewCtx.putImageData(currentImageData, 0, 0); // copy current canvas state to preview
        }
      }
    }
  };
  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasContext) return;

    const { x, y } = getMouseCoordinates(event);

    if (currentTool === "brush") {
      canvasContext.lineTo(x, y);
      canvasContext.stroke(); // draw a line
    } else if (startPoint) {
      if (!canvasRef.current || !previewCanvas) return;

      const canvas = canvasRef.current;
      const previewCtx = previewCanvas.getContext("2d");
      if (!previewCtx) return;

      const originalImageData = previewCtx.getImageData(
        0,
        0,
        previewCanvas.width,
        previewCanvas.height
      ); // take a snapshot of the preview canvas and save it
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      canvasContext.putImageData(originalImageData, 0, 0);

      // save the original brush styles before drawing the preview
      const originalStrokeStyle = canvasContext.strokeStyle;
      const originalLineWidth = canvasContext.lineWidth;
      const originalCompositeOperation = canvasContext.globalCompositeOperation;

      canvasContext.globalAlpha = 0.7; // make the preview drawing semi-transparent

      switch (currentTool) {
        case "line":
          drawLine(canvasContext, startPoint.x, startPoint.y, x, y);
          break;
        case "rectangle":
          drawRectangle(canvasContext, startPoint.x, startPoint.y, x, y);
          break;
        case "circle":
          drawCircle(canvasContext, startPoint.x, startPoint.y, x, y);
          break;
        default:
          break;
      }

      canvasContext.globalAlpha = 1; // reset the alpha to fully opaque
      canvasContext.strokeStyle = originalStrokeStyle;
      canvasContext.lineWidth = originalLineWidth;
      canvasContext.globalCompositeOperation = originalCompositeOperation;
    }
  };
  const stopDrawing = (event?: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasContext) return;

    // only close the path & save state if we were drawing
    // this prevents saving empty paths
    // which would cause the undo to not work properly
    if (isDrawing) {
      if (currentTool === "brush") {
        canvasContext.closePath(); // close the current drawing path
      } else if (startPoint && event) {
        const { x, y } = getMouseCoordinates(event);

        if (canvasRef.current && previewCanvas) {
          const canvas = canvasRef.current;
          const previewCtx = previewCanvas.getContext("2d");
          if (previewCtx) {
            const originalImageData = previewCtx.getImageData(
              0,
              0,
              previewCanvas.width,
              previewCanvas.height
            ); // take a snapshot of the preview canvas and save it
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            canvasContext.putImageData(originalImageData, 0, 0); // put preview canvas drawing into main canvas
          }
        }
        switch (currentTool) {
          case "line":
            drawLine(canvasContext, startPoint.x, startPoint.y, x, y);
            break;
          case "rectangle":
            drawRectangle(canvasContext, startPoint.x, startPoint.y, x, y);
            break;
          case "circle":
            drawCircle(canvasContext, startPoint.x, startPoint.y, x, y);
            break;
          default:
            break;
        }
        setStartPoint(null); // reset the start point for shapes
      }
      setIsDrawing(false);
      saveCanvasState(); // save canvas state when we stop drawing
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      clearCanvas: () => {
        if (canvasContext && canvasRef.current) {
          canvasContext.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          ); // clears that part of the canvas
          saveCanvasState(); // save the cleared canvas so it's undoable
        }
      },
      undo: () => {
        if (historyState.currentIndex > 0) {
          const prevIndex = historyState.currentIndex - 1;
          setHistoryState((prev) => ({
            ...prev, // everything else stays the same
            // only change the current index to the previous index
            currentIndex: prevIndex,
          }));
          restoreCanvasState(historyState.history[prevIndex]);
          if (onUpdateUndoState) {
            setTimeout(onUpdateUndoState, 0);
          }
        }
      },
      canUndo: () => historyState.currentIndex > 0,
    }),
    [
      canvasContext,
      historyState,
      onUpdateUndoState,
      restoreCanvasState,
      saveCanvasState,
    ]
  );

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
          width: "90vw",
          height: "70vh",
          color: "#000",
        }}
      >
        Your browser does not suport HTML5 canvas API!
      </canvas>
    </div>
  );
};

export default CanvasComponent;
