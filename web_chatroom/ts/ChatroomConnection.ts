import * as ChatroomDOM from "./ChatroomDOM.js"

const SERVER_URL: string = "ws://localhost:8300/";
const REFRESH_TIMEOUT = 10 * 1000;

export class ChatroomConnection {

	// User data
	username: string;
	course: number;

	// WebSocket connection
	websocket: WebSocket;
	keepAliveTimer: number;


	constructor(username: string, course: number) {
		this.username = username;
		this.course = course;
		this.connect();
	}

	connect() {
		// Setup websocket connection
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
	
	
	onOpen() {
		// creation json object
		this.login()
		// Start of the timer for the websocket connection refresh
		// this.keepAlive();
	}

	onClose() {
		console.error("WebSocket connection closed");
		// Clear keep alive timer
		window.clearTimeout(this.keepAliveTimer);
		// Try to connect again to chatroom servers
		window.setTimeout(() => this.connect(), 1000);
	}

	onMessage(event: MessageEvent) {
		const message = JSON.parse(event.data);
		switch (message.opcode) {
			case "MESSAGE":
				ChatroomDOM.appendMessageToChat(message.sender, message.text, false)
				break;
			case "ONLINE_USERS":
				ChatroomDOM.updateOnlineStudentsList(message.list)
				break;
			default:
				console.error("Wrong message received: " + event.data)
		}
	}

	onError() {
		if (this.websocket.readyState === 3) {
			// Connection is closed
			alert("Error: cannot connect to chatroom server");
		}
		console.error("Websocket error");
	}


	/**
	 * Periodically keep alive the websocket connection every 10 sec
	 */
	keepAlive() {
		// If WebSocket connection is up, send a ping
		if (this.websocket.readyState === this.websocket.OPEN) {
			// send the refresh message
			this.ping();
			this.keepAliveTimer = window.setTimeout(this.keepAlive, REFRESH_TIMEOUT);
		}
	}


	////////////////////////////////

	login() {
		let loginJson = {
			"opcode": "LOGIN",
			"username": this.username,
			"course": this.course
		};
		this.websocket.send(JSON.stringify(loginJson));
	}

	ping() {
		this.websocket.send("__ping__")
	}

	sendChatroomMessage() {
		if (this.websocket.readyState === 3) {
			// Connection closed
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