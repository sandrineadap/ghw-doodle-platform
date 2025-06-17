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

const ToolbarComponent: React.FC<ToolbarProps> = ({ selectedColour, onColourChange }) => {
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
        maxWidth: "800px"
      }}
    >
      {/* loop over colours with map and display them */}
      <label
        style={{
          fontWeight: "bold",
          alignSelf: "center", // vertically center
        }}
      >
        Colors:
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
