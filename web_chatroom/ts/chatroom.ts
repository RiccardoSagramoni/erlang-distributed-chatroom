import { ChatroomConnection } from "./ChatroomConnection.js";

function start () {
	// Get username and course id from the GET params of url (only for demo purposes!)
	const urlParams = new URLSearchParams(window.location.search);

	if (urlParams.get("u") == null) {
		alert("Username not specified");
		return;
	}
	if (urlParams.get("c") == null) {
		alert("Course not specified");
		return;
	}
	const username: string = urlParams.get("u");
	const course: number = Number(urlParams.get("c"))

	// Open connection
	const connection = new ChatroomConnection(username, course);

	// Prepare event handlers
	document.getElementsByTagName("body")[0].onunload = () => connection.disconnect();
	document.getElementById("send-button").onclick = () => connection.sendChatroomMessage();
}

start();
