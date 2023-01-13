import React from "react";
import Message from "./Message";
import "./Chat.css";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: this.getMessages(),
      chatEnabled: false,
      input: "",
      retranslation: null,
    };
    this.network = props.network;
    this.lastInputTime = null;
    // React refs
    this.messagesRef = React.createRef();
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.network.onmessage = (tag, content) => {
      switch (tag) {
        case "mate-online":
          if (content) {
            this.setState({ chatEnabled: true });
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
        retranslation: "[Connection lost... click anywhere to reconnect]",
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

  getMessages = () => {
    const key = `room_${localStorage.room}`;
    return localStorage[key] ? JSON.parse(localStorage[key]) : [];
  };

  storeMessages = () => {
    const key = `room_${localStorage.room}`;
    const minifiedMessages = [...this.state.messages];
    minifiedMessages.forEach((message) => delete message.expanded);
    localStorage[key] = JSON.stringify(minifiedMessages);
  };

  checkConnection = () => {
    if (!this.network.connected && !this.network.connecting) {
      this.setState({ retranslation: "[Trying to reconnect...]" });
      this.network.connect("auto-translated-text");

      this.network.onopen = () => {
        const { language, room } = localStorage;
        this.network.send("join", { language, room });
        this.network.send("is-mate-online");
      };
    }
  };

  handleInput = (e) => {
    // Stop the retranslation timeout to save resources and log the new input time
    clearTimeout(this.retranslationTimeout);
    this.lastInputTime = new Date().getTime();

    // Update DOM and get the trimmed string
    this.setState({ input: e.target.value });
    const value = e.target.value.trim();

    // If the trimmed string is empty, reset retranslation and stop the function
    if (!value) {
      this.setState({ retranslation: null });
      return;
    }

    // Else, start the retranslation timeout so that when the user stop editing
    // it sends the input to the server
    this.retranslationTimeout = setTimeout(() => {
      if (new Date().getTime() - this.lastInputTime > 1000) {
        this.network.send("input", value);
        this.setState({ retranslation: "[Loading retranslation...]" });
      }
    }, 1000);
  };

  deleteMessages = () => {
    const key = `room_${localStorage.room}`;
    localStorage.removeItem(key);
    this.setState({ messages: [] });
  };

  sendMessage = () => {
    // Stop the retranslation timeout to prevent the retranslation from being shown after
    // sending the message.
    clearTimeout(this.retranslationTimeout);

    const message = this.state.input.trim();

    if (message) {
      this.network.send("message", message);
      this.setState({ input: "", retranslation: null });
    }
    // Focus the message input so that the user doesn't need to click on it again
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
        <div id="retranslation">
          {this.state.retranslation || "[Retranslated message]"}
        </div>
        <div id="input-area">
          <div className="input-area-btn" onClick={this.deleteMessages}>
            <img src="trash.png" alt="del message" />
          </div>
          <input
            ref={this.inputRef}
            id="message-input"
            className="input"
            type="text"
            placeholder={
              this.state.chatEnabled
                ? "Message..."
                : "Waiting for someone to join the chat..."
            }
            value={this.state.input}
            onInput={this.handleInput}
            onKeyDown={(e) => e.key === "Enter" && this.sendMessage()}
            disabled={!this.state.chatEnabled}
          ></input>
          <div className="input-area-btn" onClick={this.sendMessage}>
            <img src="send.png" alt="send message" />
          </div>
        </div>
      </>
    );
  }
}
