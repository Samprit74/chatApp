$(document).ready(function(){

    loadRooms()

    $("#create-room").click(()=> createRoom())
    $("#create-room-sidebar").click(()=> createRoom())

    $("#join-room").click(()=> joinRoomManual())

    $("#rooms-dropdown").change(function(){

        let chatId = $(this).val()
        if(!chatId) return

        let name = localStorage.getItem("name")

        if(!name){
            alert("Enter your name first")
            return
        }

        localStorage.setItem("chatId", chatId)

        startChat()
    })

    $("#send-btn").click(()=> sendMessage())

    $("#logout, #logout-sidebar").click(()=>{
        localStorage.clear()
        location.reload()
    })

})

var stompClient = null



function createRoom(){

    let name = localStorage.getItem("name")

    if(!name){
        name = $("#name-value").val().trim()

        if(!name){
            alert("Enter your name")
            return
        }

        localStorage.setItem("name", name)
    }

    fetch("/chat/create", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name: "Room" })
    })
    .then(res => res.json())
    .then(data => {

        if(!data || !data.id){
            alert("Room creation failed")
            return
        }

        localStorage.setItem("chatId", data.id.toString())
        startChat()
    })
}



function joinRoomManual(){

    let name = localStorage.getItem("name") || $("#name-value").val().trim()
    let chatId = $("#room-id-input").val().trim()

    if(!name){
        alert("Enter your name")
        return
    }

    if(!chatId){
        alert("Enter room ID")
        return
    }

    localStorage.setItem("name", name)

    fetch(`/chat/${chatId}`)
    .then(res => res.json())
    .then(data => {

        if(data && data.id){
            localStorage.setItem("chatId", data.id.toString())
            startChat()
        } else {
            alert("Room not found")
        }
    })
}



function loadRooms(){

    fetch("/chat/all")
    .then(res => res.json())
    .then(rooms => {

        let dropdown = $("#rooms-dropdown")
        dropdown.html('<option value="">Select a room...</option>')

        rooms.forEach(room => {
            dropdown.append(
                `<option value="${room.id}">Room ${room.id}</option>`
            )
        })

        $("#room-count-badge").text(rooms.length)
    })
}



function startChat(){

    let name = localStorage.getItem("name")
    let chatId = localStorage.getItem("chatId")

    if(!chatId){
        alert("Chat not initialized")
        return
    }

    if(stompClient !== null){
        stompClient.disconnect()
    }

    $("#entry-screen").addClass("d-none")
    $("#chat-room").removeClass("d-none")

    $("#name-title").html(`User: <b>${name}</b>`)
    $("#sidebar-username").text(name)
    $("#current-room-id").text(chatId)
    $("#room-badge-display").text("Room: " + chatId)

    loadOldMessages(chatId)
    connect(chatId)
}



function loadOldMessages(chatId){

    fetch(`/messages/${chatId}`)
    .then(res => res.json())
    .then(messages => {

        $("#message-container-table").html("")

        messages.forEach(msg => showMessage(msg))
    })
}



function connect(chatId){

    let socket = new SockJS("/server1")
    stompClient = Stomp.over(socket)

    stompClient.connect({}, function(){

        stompClient.subscribe(`/topic/chat/${chatId}`, function(response){

            let message = JSON.parse(response.body)
            showMessage(message)

        })
    })
}



function showMessage(message){

    let currentUser = localStorage.getItem("name")

    let alignment = message.name === currentUser ? "right-msg" : "left-msg"

    $("#message-container-table").prepend(
    `<tr class="${alignment}">
        <td>
            <div class="msg-box">
                <b>${message.name}</b><br>
                ${message.content}
            </div>
        </td>
    </tr>`
    )
}



function sendMessage(){

    let chatId = localStorage.getItem("chatId")
    let content = $("#message-value").val().trim()

    if(!content) return

    let jsonOb = {
        name: localStorage.getItem("name"),
        content: content,
        chatId: chatId
    }

    stompClient.send(`/app/message/${chatId}`, {}, JSON.stringify(jsonOb))

    $("#message-value").val("")
}