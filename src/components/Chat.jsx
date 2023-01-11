import React from "react";
import "./Chat.css";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.network = props.network;
    this.state = {
      messages: [],
      chatEnabled: false,
      input: "",
      retranslation: null,
    };
    this.lastInputTime = null;
    this.messagesRef = React.createRef();
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.network.onmessage = (tag, content) => {
      switch (tag) {
        case "mate-online":
          if (content) {
            this.setState({ chatEnabled: true, retranslation: null });
          } else {
            this.setState({ chatEnabled: false, input: "", retranslation: null });
          }
          break;

        case "input-retranslated":
          if (this.state.input.trim()) {
            this.setState({ retranslation: content });
          }
          break;

        case "message":
          this.setState(
            { messages: [...this.state.messages, content] },
            () => (this.messagesRef.current.scrollTop = this.messagesRef.current.scrollHeight)
          );
      }
    };
    this.network.send("is-mate-online");
    // If a Safari user lefts the app then try to reconnect (Experimental feature)
    // Is it triggered immediately when the user lefts, when the app is focused,
    // or only when they try to send a message ?
    this.network.onclose = () => {
      this.setState({ chatEnabled: false, retranslation: "[Trying to reconnect...]" });
      this.network.connect("auto-translated-text");

      this.network.onopen = () => {
        this.network.send("lang", this.props.language);
        this.network.send("is-mate-online");
      };
    };
    // Keep websocket connected by sending a message every 30 seconds.
    this.keepConnection = setInterval(() => {
      this.network.send("keep-connection");
    }, 30000);
  }

  componentWillUnmount() {
    clearInterval(this.keepConnection);
  }

  handleInput = (e) => {
    this.setState({ input: e.target.value });
    const value = e.target.value.trim();
    this.lastInputTime = new Date().getTime();

    if (!value) {
      this.setState({ retranslation: null });
      return;
    }

    this.retranslationTimeout = setTimeout(() => {
      if (new Date().getTime() - this.lastInputTime > 1000) {
        this.network.send("input", value);
        this.setState({ retranslation: "[Loading retranslation...]" });
      }
    }, 1000);
  };

  sendMessage = () => {
    clearTimeout(this.retranslationTimeout);

    const message = this.state.input.trim();
    if (message) {
      this.network.send("message", message);
      this.setState({ input: "", retranslation: null });
    }
    this.inputRef.current.focus();
  };

  requestFullscreen = () => {
    const root = document.getElementById("root");
    if (root.requestFullscreen) {
      root.requestFullscreen({ navigationUI: "show" });
    } else if (root.webkitRequestFullscreen) {
      /* Safari (Experimental feature) */
      root.webkitRequestFullscreen({ navigationUI: "show" });
    }
  };

  render() {
    return (
      <>
        <div id="messages" ref={this.messagesRef}>
          {this.state.messages.map((message, index) => (
            // <div className={"message " + (message.fromMe ? "from-me" : "")} key={index}>
            //   {message.text}
            // </div>
            <div className={"message " + (message.fromMe ? "from-me" : "")} key={index}>
              <div className="original-message">{message.original}</div>
              <div className="translated-message">{message.translated}</div>
            </div>
          ))}
        </div>
        <div id="retranslation">
          {this.state.retranslation || "[Retranslated message]"}
          <img src="fullscreen.png" alt="fullscreen" onClick={this.requestFullscreen} />
        </div>
        <div id="input-area">
          <input
            id="message-input"
            ref={this.inputRef}
            type="text"
            placeholder={
              this.state.chatEnabled ? "Message..." : "Waiting for someone to join the chat..."
            }
            value={this.state.input}
            onInput={this.handleInput}
            onKeyDown={(e) => e.key === "Enter" && this.sendMessage()}
            disabled={!this.state.chatEnabled}
          ></input>
          <div id="send-message-btn" onClick={this.sendMessage}>
            <img src="send.png" alt="send message" />
          </div>
        </div>
      </>
    );
  }
}
