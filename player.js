document.addEventListener("DOMContentLoaded", function () {
    const playerContainer = document.getElementById("player-container");
    const mainContent = document.getElementById("main-content"); // Контейнер игры

    if (!playerContainer || !mainContent) {
        console.error("❌ Ошибка: #player-container или #main-content не найден!");
        return;
    }

    // ✅ Стилизация через JS
    Object.assign(playerContainer.style, {
        position: "absolute",
        transition: "left 0.5s linear, top 0.5s linear",
    });

    // ✅ Загружаем последнюю позицию персонажа
    let playerX = parseFloat(localStorage.getItem("playerX")) || mainContent.clientWidth / 2;
    let playerY = parseFloat(localStorage.getItem("playerY")) || mainContent.clientHeight / 2;

    function setInitialPosition() {
        updatePlayerPosition(playerX, playerY, false);
    }

    function movePlayer(event) {
        event.preventDefault();

        let clickX, clickY;

        // Проверяем, это клик или тач-экран
        if (event.touches && event.touches.length > 0) {
            clickX = event.touches[0].clientX;
            clickY = event.touches[0].clientY;
        } else {
            clickX = event.clientX;
            clickY = event.clientY;
        }

        // ✅ Вычисляем позицию относительно контейнера `main-content`
        const contentRect = mainContent.getBoundingClientRect();
        const playerRect = playerContainer.getBoundingClientRect();

        let newX = clickX - contentRect.left - playerRect.width / 2;
        let newY = clickY - contentRect.top - playerRect.height / 2;

        // Ограничение перемещения внутри `main-content`
        newX = Math.max(0, Math.min(newX, mainContent.clientWidth - playerRect.width));
        newY = Math.max(0, Math.min(newY, mainContent.clientHeight - playerRect.height));

        updatePlayerPosition(newX, newY);
    }

    function updatePlayerPosition(targetX, targetY, animate = true) {
        if (!animate) {
            playerContainer.style.transition = "none";
        } else {
            playerContainer.style.transition = "left 0.5s linear, top 0.5s linear";
        }

        playerContainer.style.left = `${targetX}px`;
        playerContainer.style.top = `${targetY}px`;

        // ✅ Сохраняем координаты
        localStorage.setItem("playerX", targetX);
        localStorage.setItem("playerY", targetY);
    }

    setInitialPosition();

    // ✅ Добавляем обработчики событий
    mainContent.addEventListener("mousedown", movePlayer);
    mainContent.addEventListener("touchstart", movePlayer, { passive: false });

    // ✅ Логирование
    setInterval(() => {
        console.log(`📍 X: ${playerContainer.style.left}, Y: ${playerContainer.style.top}`);
    }, 1000);

    // ✅ При изменении экрана — персонаж остается на месте
    window.addEventListener("resize", setInitialPosition);
});
