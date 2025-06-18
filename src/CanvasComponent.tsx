import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type CanvasRef = {
  clearCanvas: () => void;
  undo: () => void;
  canUndo: () => boolean;
};

type CanvasProps = {
  selectedColour: string;
  brushSize: number;
  isErasing: boolean;
  onUpdateUndoState: () => void;
  ref: React.RefObject<CanvasRef | null>;
};

const CanvasComponent = ({
  selectedColour,
  brushSize,
  isErasing,
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

    console.log({ x, y });

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

    // only close the path & save state if we were drawing
    // this prevents saving empty paths
    // which would cause the undo to not work properly
    if (isDrawing) {
      canvasContext.closePath(); // close the current drawing path
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
