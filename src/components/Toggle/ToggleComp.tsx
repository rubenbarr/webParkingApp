import React from "react";
import "./Toggle.scss";

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  leftLabel?: string;   // e.g. "ON"
  rightLabel?: string;  // e.g. "OFF"
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  leftLabel = "ON",
  rightLabel = "OFF",
}) => {
  return (
    <div className="toggle-row">

    <div className="toggle-wrapper">
      <div className="toggle-wrapper__labels">
        <span className={!checked ? "active" : ""}>{leftLabel}</span>
        <span className={checked ? "active" : ""}>{rightLabel}</span>
      </div>
      <div className="toggle-container">
      <div
        className={`toggle ${checked ? "toggle--active" : ""}`}
        onClick={() => onChange(!checked)}
        >
        <div className="toggle__knob" />
          </div>
      </div>
    </div>
            </div>
  );
};

export default Toggle;