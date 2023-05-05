/**
 * Function that append a message to the div of the chat
 * @param senderName is the name of the sender, if the sender is the user it is
 *                      substituted by the YOU word
 * @param message is the text of the message
 * @param isMyMessage is a boolean, in order to understand if the sender is the user
 *                    or another student
 */
export function appendMessageToChat(senderName: string, message: string, isMyMessage: boolean) {

    const chatContainer = document.getElementById("chatroom-chat");
    if (chatContainer == null) {
        console.error("chatroom-chat element does not exist");
        return;
    }

    const divMessageContainer = document.createElement("div");

    const divStudentProfile = document.createElement("div");
    divStudentProfile.setAttribute("class", "student-profile-image");

    const divMessage = document.createElement("div");
    divMessage.setAttribute("class", "message");

    const divMessageHeader = document.createElement("div");
    divMessageHeader.setAttribute("class", "message-header");

    const divMessageHeaderUsername = document.createElement("div");
    divMessageHeaderUsername.setAttribute("class", "message-header-username");
    divMessageHeaderUsername.textContent = senderName;

    const divMessageContent = document.createElement("div");
    divMessageContent.setAttribute("class", "message-content");
    divMessageContent.textContent = message;

    if (isMyMessage) {
        divMessageContainer.setAttribute("class", "message-container sent-message");
    }
    else {
        divMessageContainer.setAttribute("class", "message-container received-message");
    }

    chatContainer.appendChild(divMessageContainer);
    divMessageContainer.appendChild(divStudentProfile);
    divMessageContainer.appendChild(divMessage);
    divMessage.appendChild(divMessageHeader);
    divMessageHeader.appendChild(divMessageHeaderUsername);
    divMessage.appendChild(divMessageContent);

    // Scroll chat to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}




/**
 * Function which updates the list of the online students
 * @param studentList is the list of the current online students
 */
export function updateOnlineStudentsList(studentList: string[]) {
    const ulOnlineStudents = document.getElementById("online-student-list");
    if (ulOnlineStudents == null) {
        console.error("online-student-list element does not exist");
        return;
    }
    // Flush old list from HTML page
    ulOnlineStudents.innerHTML = "";
    // Remove duplicates from new list

    let student_list = [...new Set(studentList)];
    // Add of the user to the html list of the online user
    student_list.forEach(student => {
        const li = document.createElement("li");
        if (li != null) {
            li.textContent = student;
            ulOnlineStudents.appendChild(li);
        }
    });
}
