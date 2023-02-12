import "./Message.css";

export default function Message(props) {
  const showOriginal = props.fromMe || props.expanded;
  const showTranslated = !props.fromMe || props.expanded;

  return (
    <div
      className={"message " + (props.fromMe ? "from-me " : "") + (props.expanded ? "expanded" : "")}
      onClick={props.toggleExpanded}
    >
      {showOriginal && (
        <div className="original-message">
          <div className="content">
            <p>{props.original}</p>
            {props.fromMe && <img src="arrow-down.png" alt="arrow down" />}
          </div>
        </div>
      )}
      {showTranslated && (
        <div className="translated-message">
          <div className="content">
            {!props.fromMe && <img src="arrow-up.png" alt="arrow up" />}
            <p>{props.translated}</p>
          </div>
          <div className="footer">
            <p>Translated</p>
          </div>
        </div>
      )}
    </div>
  );
}
