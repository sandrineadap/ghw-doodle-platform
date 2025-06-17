const PREDEFINED_COLOURS = [
  "#1e1e1e",
  "#b10909",
  "#10b310",
  "#1010c3",
  "#d0b60a",
  "#e8e8e8",
];

const BRUSH_SIZES = [
  { size: 2, label: "S" },
  { size: 5, label: "M" },
  { size: 10, label: "L" },
  { size: 20, label: "XL" },
];

// type ToolbarProps = {
//   selectedColour: string;
// }

interface ToolbarProps {
  selectedColour: string;
  onColourChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
}

const ToolbarComponent: React.FC<ToolbarProps> = ({
  selectedColour,
  onColourChange,
  brushSize,
  onBrushSizeChange,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px",
        padding: "10px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        margin: "0 auto",
        maxWidth: "1000px",
        alignItems: "center",
      }}
    >
      {/* Custom Color Picker */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <label
          htmlFor="colourPicker"
          style={{ fontWeight: "bold", alignSelf: "center" }}
        >
          Custom Colour:
        </label>
        <input
          type="color"
          id="colourPicker"
          value={selectedColour}
          onChange={(e) => onColourChange(e.target.value)}
          style={{
            width: "50px",
            height: "40px",
            border: `3px solid ${selectedColour}`,
            borderRadius: "2px",
            cursor: "pointer",
          }}
          title="Choose custom colour"
        />
      </div>

      {/* Separator */}
      <div
        style={{
          width: "2px",
          height: "40px",
          backgroundColor: "#ccc",
          borderRadius: "4px",
        }}
      />

      {/* Predefined Colours */}
      <label style={{ fontWeight: "bold", alignSelf: "center" }}>
        Colours:
      </label>
      {PREDEFINED_COLOURS.map((colour) => (
        <button
          key={colour}
          title={`Select colour ${colour}`}
          aria-label={`Select colour ${colour}`}
          onClick={() => onColourChange(colour)}
          style={{
            width: "30px",
            height: "30px",
            backgroundColor: colour,
            borderRadius: "50%",
            cursor: "pointer",
            border:
              selectedColour == colour ? "3px solid #6262fc" : "2px solid #ccc",
          }}
        />
      ))}

      {/* Separator */}
      <div
        style={{
          width: "2px",
          height: "40px",
          backgroundColor: "#ccc",
          borderRadius: "4px",
        }}
      />

      {/* Brush Size Selector */}
      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        <label style={{ fontWeight: "bold", alignSelf: "center" }}>
          Brush Size:
        </label>
        {BRUSH_SIZES.map(({ size, label }) => (
          <button
            key={size}
            style={{
              padding: "8px 12px",
              color: brushSize === size ? "#fff" : "#333",
              borderRadius: "4px",
              border: "2px solid #6262fc",
              backgroundColor: brushSize === size ? "#6262fc" : "#fff",
            }}
            onClick={() => onBrushSizeChange(size)}
            title={`${label} - ${size}px`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Brush Size Slider */}
      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
          style={{ width: "100px", cursor: "pointer" }}
        />
        <span
          style={{ fontSize: "12px", fontWeight: "bold", minWidth: "30px" }}
        >
          {brushSize}px
        </span>
      </div>
    </div>
  );
};

export default ToolbarComponent;
