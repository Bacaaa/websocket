const socket = io();

//elemtns
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#siderbad-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const autoscroll = () => {
    //new msg elem
    const $newMessage = $messages.lastElementChild;

    //height of the new msg
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //visible height
    const visibleHeight = $messages.offsetHeight;

    //hieght of msg container
    const containerHeight = $messages.scrollHeight;

    //how far have i scroll
    const scrollOffset = $messages.scrollTop + visibleHeight;


    console.log(containerHeight - newMessageHeight ,'newMessageHeightnewMessageHeight')
    console.log(scrollOffset ,'scrollOffsetscrollOffset')

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }


};

socket.on("message", message => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("HH:mm DD-MM")
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

socket.on("locationMessage", message => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.text,
        createdAt: moment(message.createdAt).format("HH:mm DD-MM")
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoscroll();
});

$messageForm.addEventListener("submit", e => {
    e.preventDefault();

    $messageFormButton.setAttribute("disabled", "disabled");

    const message = e.target.elements.message.value;

    socket.emit("sendMessage", message, message => {
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();
        console.log("The message was delivered!", message);
    });
});

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });

    document.querySelector("#user-list").innerHTML = html;
});

$sendLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by youe browser.");
    }

    $sendLocationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition(position => {
        socket.emit(
            "sendLocation",
            {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            },
            () => {
                console.log("Location shared!");
                $sendLocationButton.removeAttribute("disabled");
            }
        );
    });
});

socket.emit("join", { username, room }, error => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});
