import React from "react";
import "./Chat.css";

export default class Chat extends React.Component {
  constructor(props) {
    super();
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
        case "someone-is-online":
          this.setState({ chatEnabled: true });
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
    this.network.send("is-someone-online");
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

  render() {
    return (
      <>
        <div id="messages" ref={this.messagesRef}>
          {this.state.messages.map((message, index) => (
            <div className={"message " + (message.fromMe ? "from-me" : "")} key={index}>
              {message.text}
            </div>
          ))}
        </div>
        <div id="retranslation">
          {this.state.retranslation || "[Retranslated message]"}
          <img
            src="fullscreen.png"
            alt="fullscreen"
            onClick={() => document.documentElement.requestFullscreen({ navigationUI: "show" })}
          />
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
