import { ChatroomConnection } from "./ChatroomConnection.js";

const urlParams = new URLSearchParams(window.location.search);

// Open connection
const connection = new ChatroomConnection(urlParams.get("u"), Number(urlParams.get("c")));

// Prepare event handlers
document.getElementsByTagName("body")[0].onunload = function() { connection.disconnect() };
document.getElementById("send-button").onclick = function() { connection.sendChatroomMessage() };
