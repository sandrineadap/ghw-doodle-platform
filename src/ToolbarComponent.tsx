const PREDEFINED_COLOURS = [
  "#1e1e1e",
  "#b10909",
  "#10b310",
  "#1010c3",
  "#d0b60a",
  "#e8e8e8",
];

// type ToolbarProps = {
//   selectedColour: string;
// }

interface ToolbarProps {
  selectedColour: string;
  onColourChange: (color: string) => void;
}

const ToolbarComponent: React.FC<ToolbarProps> = ({
  selectedColour,
  onColourChange,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        padding: "10px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        margin: "0 auto",
        maxWidth: "800px",
      }}
    >
      {/* Custom Color Picker */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <label
          htmlFor="colourPicker"
          style={{
            fontWeight: "bold",
            alignSelf: "center", // vertically center
          }}
        >
          Custom Colour:{" "}
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
      <label
        style={{
          fontWeight: "bold",
          alignSelf: "center", // vertically center
        }}
      >
        Colours:
      </label>
      {PREDEFINED_COLOURS.map((colour) => (
        <button
          key={colour}
          title={`Select colour ${colour}`}
          aria-label={`Select colour ${colour}`}
          onClick={() => onColourChange(colour)}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: colour,
            borderRadius: "50%",
            cursor: "pointer",
            border:
              selectedColour == colour ? "3px solid #6262fc" : "2px solid #ccc",
          }}
        />
      ))}
    </div>
  );
};

export default ToolbarComponent;
