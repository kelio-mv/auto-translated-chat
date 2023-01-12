import React from "react";
import Message from "./Message";
import "./Chat.css";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.network = props.network;
    this.state = {
      messages: localStorage.messages ? JSON.parse(localStorage.messages) : [],
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
          this.setState({ messages: [...this.state.messages, content] }, () => {
            this.messagesRef.current.scrollTop = this.messagesRef.current.scrollHeight;
            this.storeMessages();
          });
      }
    };
    // Ask server if the mate is online
    this.network.send("is-mate-online");

    // Keep websocket connected by sending a message every 30 seconds.
    this.keepConnection = setInterval(() => this.network.send("keep-connection"), 30000);

    // If the connection is lost, disable input and alert user
    this.network.onclose = () => {
      this.setState({
        chatEnabled: false,
        retranslation: "[Connection lost. Click anywhere to reconnect]",
      });
    };

    // When window is focused or clicked, check if connection is active so that
    // if the user got disconnected, it gets reconnected by user interaction.
    window.onfocus = this.checkConnection;
    window.onclick = this.checkConnection;
  }

  componentWillUnmount() {
    clearInterval(this.keepConnection);
    window.onfocus = () => {};
    window.onclick = () => {};
  }

  storeMessages = () => {
    const minifiedMessages = [...this.state.messages];
    minifiedMessages.forEach((message) => delete message.expanded);
    localStorage.messages = JSON.stringify(minifiedMessages);
  };

  checkConnection = () => {
    if (!this.network.connected && !this.network.connecting) {
      this.setState({ retranslation: "[Trying to reconnect...]" });
      this.network.connect("auto-translated-text");

      this.network.onopen = () => {
        this.network.send("lang", this.props.language);
        this.network.send("is-mate-online");
      };
    }
  };

  handleInput = (e) => {
    this.setState({ input: e.target.value });
    this.lastInputTime = new Date().getTime();
    const value = e.target.value.trim();

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
            <Message
              key={index}
              {...message}
              toggleExpanded={() => {
                const newMessages = [...this.state.messages];
                newMessages[index].expanded = !newMessages[index].expanded;
                this.setState({ messages: newMessages });
              }}
            />
          ))}
        </div>

        <div id="retranslation">{this.state.retranslation || "[Retranslated message]"}</div>

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
