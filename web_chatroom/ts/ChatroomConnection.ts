import * as ChatroomDOM from "./ChatroomDOM.js"

const SERVER_URL: string = "ws://localhost:8300/";
const REFRESH_TIMEOUT: number = 30 * 1000; // 30s, half of Cowboy timeout

export class ChatroomConnection {

	// User data
	private username: string;
	private course: number;

	// WebSocket connection
	private websocket: WebSocket;
	private keepAliveTimer: number;


	constructor(username: string, course: number) {
		this.username = username;
		this.course = course;
		this.connect();
	}

	connect() {
		// Setup websocket connection with the chatroom server
		this.websocket = new WebSocket(SERVER_URL);
		this.websocket.addEventListener("open", () => this.onOpen());
		this.websocket.addEventListener("close", () => this.onClose());
		this.websocket.addEventListener("message", ev => this.onMessage(ev));
		this.websocket.addEventListener("error", () => this.onError());
	}


	disconnect() {
		// The websocket is closed and the onclose method is invoked
		this.websocket.close();
	}



	private onOpen() {
		console.info("WebSocket connection opened");
		// Send login message
		this.login();
		// Start of the timer for the websocket connection refresh
		this.keepAliveTimer = window.setInterval(this.keepAlive, REFRESH_TIMEOUT);
	}

	private onClose() {
		console.error("WebSocket connection closed");
		// Clear keep alive timer
		window.clearInterval(this.keepAliveTimer);
		// Try to connect again to chatroom servers after 1 second
		window.setTimeout(() => this.connect(), 1000);
	}

	private onMessage(event: MessageEvent) {
		const message = JSON.parse(event.data);
		// Check if it's a chatroom message or the list of online users
		switch (message.opcode) {
			case "MESSAGE":
				ChatroomDOM.appendMessageToChat(message.sender, message.text, false)
				break;
			case "ONLINE_USERS": // TODO Erlang-side
				ChatroomDOM.updateOnlineStudentsList(message.list)
				break;
			default:
				console.error("Wrong message received: " + event.data)
		}
	}

	private onError() {
		console.error("Websocket error");

		if (this.websocket.readyState === 3) {
			// Connection is closed
			alert("Error: cannot connect to chatroom server");
		}
	}


	/**
	 * Periodically keep alive the websocket connection
	 */
	private keepAlive() {
		// If WebSocket connection is up, send a ping
		if (this.websocket.readyState === this.websocket.OPEN) {
			this.ping();
		}
	}


	///////////////////////////////////////////////////
	//           CLIENT-to-SERVER MESSAGES           //
	///////////////////////////////////////////////////

	private login() {
		let loginJson = {
			"opcode": "LOGIN",
			"username": this.username,
			"course": this.course
		};
		this.websocket.send(JSON.stringify(loginJson));
	}

	private ping() {
		this.websocket.send("__ping__");
	}

	sendChatroomMessage() {
		// Check if connection is closed
		if (this.websocket.readyState === 3) {
			alert("Error: the chatroom is offline. Please wait for reconnection");
			return;
		}

		// Retrieve message text
		const inputArea = <HTMLInputElement>document.getElementById("chatroom-submit-area-input");
		if (inputArea == null) {
			console.error("chatroom-submit-area-input does not exist");
			return;
		}
		const messageText = inputArea.value;
		inputArea.value = "";

		// Build and send message
		const messageJson = {
			"opcode": "MESSAGE",
			"text": messageText
		}
		this.websocket.send(JSON.stringify(messageJson));

		// Append message to chat
		ChatroomDOM.appendMessageToChat("You", messageText, true);
	}

}
