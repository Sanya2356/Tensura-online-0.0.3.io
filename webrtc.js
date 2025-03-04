let peerConnection;
let dataChannel;

// 🔹 Создаём соединение (автоматически)
function createConnection() {
    peerConnection = new RTCPeerConnection();
    
    // ✅ Создаём DataChannel (канал передачи данных)
    dataChannel = peerConnection.createDataChannel("gameChannel");

    dataChannel.onopen = () => console.log("📡 DataChannel открыт!");
    dataChannel.onmessage = (event) => {
        let { x, y, nickname } = JSON.parse(event.data);
        updateOtherPlayer(nickname, x, y);
    };

    // ✅ Создаём офер и сохраняем его в LocalStorage
    peerConnection.createOffer().then((offer) => {
        return peerConnection.setLocalDescription(offer).then(() => {
            console.log("🔗 Офер создан, сохраняем...");
            localStorage.setItem("webrtcOffer", peerConnection.localDescription.sdp);
        });
    });

    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
    };
}

// 🔹 Автоматическое подключение (если офер уже есть)
function checkAndConnect() {
    let savedOffer = localStorage.getItem("webrtcOffer");
    if (savedOffer) {
        acceptOffer(savedOffer);
    } else {
        createConnection();
    }
}

// 🔹 Принятие офера
function acceptOffer(offerSDP) {
    peerConnection = new RTCPeerConnection();

    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        dataChannel.onopen = () => console.log("📡 DataChannel подключен!");
        dataChannel.onmessage = (event) => {
            let { x, y, nickname } = JSON.parse(event.data);
            updateOtherPlayer(nickname, x, y);
        };
    };

    let offer = new RTCSessionDescription({ type: "offer", sdp: offerSDP });
    peerConnection.setRemoteDescription(offer).then(() => {
        return peerConnection.createAnswer();
    }).then((answer) => {
        return peerConnection.setLocalDescription(answer).then(() => {
            console.log("📩 Анвер создан, сохраняем...");
            localStorage.setItem("webrtcAnswer", peerConnection.localDescription.sdp);
        });
    });
}

// 🔹 Принятие анвера (если есть)
function checkAnswer() {
    let savedAnswer = localStorage.getItem("webrtcAnswer");
    if (savedAnswer) {
        let answer = new RTCSessionDescription({ type: "answer", sdp: savedAnswer });
        peerConnection.setRemoteDescription(answer);
    }
}

// 🔹 Отправка позиции
function sendPosition(x, y) {
    if (dataChannel && dataChannel.readyState === "open") {
        dataChannel.send(JSON.stringify({ nickname: "Игрок", x, y }));
    }
}

// 🔹 Обновление позиции другого игрока
function updateOtherPlayer(nickname, x, y) {
    let otherPlayer = document.querySelector(`[data-nick="${nickname}"]`);
    if (!otherPlayer) {
        otherPlayer = document.createElement("div");
        otherPlayer.classList.add("other-player");
        otherPlayer.setAttribute("data-nick", nickname);
        
        let img = document.createElement("img");
        img.src = "img/startchar.png";
        img.classList.add("player-sprite");
        
        let nameTag = document.createElement("div");
        nameTag.classList.add("nickname");  // исправил на класс
        nameTag.textContent = nickname;
        
        otherPlayer.appendChild(img);
        otherPlayer.appendChild(nameTag);
        document.getElementById("main-content").appendChild(otherPlayer);
    }

    otherPlayer.style.left = `${x}px`;
    otherPlayer.style.top = `${y}px`;
}

// 🔹 Автоматический старт
document.addEventListener("DOMContentLoaded", () => {
    checkAndConnect();
    checkAnswer();
});

// 🔹 Обновление координат при клике
document.addEventListener("mousedown", (event) => {
    let x = event.clientX;
    let y = event.clientY;
    sendPosition(x, y);
});
