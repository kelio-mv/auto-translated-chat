import "./Select.css";

export function Select(props) {
  return <div className={"select " + (props.disabled ? "disabled" : "")}>{props.children}</div>;
}

export function Option(props) {
  return (
    <div
      className={"option " + (props.selected ? "selected" : "")}
      onClick={() => props.onClick(props.selected)}
    >
      {props.text}
    </div>
  );
}
