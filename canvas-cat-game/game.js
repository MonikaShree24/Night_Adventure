window.onload = function () {

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const bgMusic = document.getElementById("bgMusic");
    // ======================
// MUSIC CONTROL BUTTON
// ======================

const musicBtn = document.getElementById("musicBtn");

bgMusic.volume = 0.3;
let musicPlaying = false;

musicBtn.addEventListener("click", function () {

    if (!musicPlaying) {
        bgMusic.play().then(() => {
            musicPlaying = true;
            musicBtn.innerText = "🔇 Music OFF";
        }).catch(() => {});
    } else {
        bgMusic.pause();
        musicPlaying = false;
        musicBtn.innerText = "🔊 Music ON";
    }

});

    // Start music on first click
    bgMusic.volume = 0.3;
    function startMusic() {
        bgMusic.play().catch(() => {});
        document.removeEventListener("click", startMusic);
    }
    document.addEventListener("click", startMusic);

    // ======================
    // CAT
    // ======================

    const catImage = new Image();
    catImage.src = "cat.png";

    let cat = {
        x: 220,
        y: 520,
        width: 100,
        height: 100,
        shield: false
    };

    // ======================
    // GAME DATA
    // ======================

    let items = [];
    let explosions = [];
    let score = 0;
    let highScore = localStorage.getItem("catHighScore") || 0;
    let level = 1;
    let timeLeft = 20;
    let gameOver = false;

    // ======================
    // STARS (Night Effect)
    // ======================

    let stars = [];
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * 500,
            y: Math.random() * 600,
            size: Math.random() * 2,
            speed: Math.random() * 0.5
        });
    }

    // ======================
    // BOSS
    // ======================

    let boss = {
        active: false,
        x: 180,
        y: 80,
        width: 120,
        height: 120,
        health: 15
    };

    // ======================
    // CONTROLS
    // ======================

    document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft" && cat.x > 0) cat.x -= 25;
        if (e.key === "ArrowRight" && cat.x < 400) cat.x += 25;
    });
    // ======================
// TOUCH + MOUSE DRAG
// ======================

let isDragging = false;

function getTouchX(event) {
    const rect = canvas.getBoundingClientRect();
    return (event.touches[0].clientX - rect.left);
}

canvas.addEventListener("touchstart", function (e) {
    isDragging = true;
});

canvas.addEventListener("touchmove", function (e) {
    if (isDragging) {
        e.preventDefault(); // stop scrolling
        let touchX = getTouchX(e);

       cat.x += (mouseX - cat.width / 2 - cat.x) * 0.2;

        // Keep inside canvas
        if (cat.x < 0) cat.x = 0;
        if (cat.x > canvas.width - cat.width)
            cat.x = canvas.width - cat.width;
    }
}, { passive: false });

canvas.addEventListener("touchend", function () {
    isDragging = false;
});

// ======================
// MOUSE DRAG (Desktop)
// ======================

canvas.addEventListener("mousedown", function () {
    isDragging = true;
});

canvas.addEventListener("mousemove", function (e) {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;

        cat.x = mouseX - cat.width / 2;

        if (cat.x < 0) cat.x = 0;
        if (cat.x > canvas.width - cat.width)
            cat.x = canvas.width - cat.width;
    }
});

canvas.addEventListener("mouseup", function () {
    isDragging = false;
});

    // ======================
    // SPAWN ITEMS
    // ======================

    function spawnItem() {
        const rand = Math.random();
        let type = "fish";
        if (rand < 0.3) type = "candy";
        if (rand < 0.1) type = "shield";

        items.push({
            x: Math.random() * 460,
            y: 0,
            type: type
        });
    }

    setInterval(spawnItem, 1200);

    // ======================
    // TIMER SYSTEM
    // ======================

    setInterval(() => {
        if (!gameOver) {
            timeLeft--;
            if (timeLeft <= 0) {
                level++;
                timeLeft = 20;
                if (level === 3) boss.active = true;
            }
        }
    }, 1000);

    // ======================
    // EXPLOSION
    // ======================

    function createExplosion(x, y) {
        explosions.push({ x: x, y: y, size: 10 });
    }

    // ======================
    // GAME LOOP
    // ======================

    function gameLoop() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 🌙 Night Gradient Background
        let gradient = ctx.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(0, "#0f2027");
        gradient.addColorStop(0.5, "#203a43");
        gradient.addColorStop(1, "#2c5364");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 500, 600);

        // ⭐ Stars
        ctx.fillStyle = "white";
        for (let star of stars) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();

            star.y += star.speed;
            if (star.y > 600) {
                star.y = 0;
                star.x = Math.random() * 500;
            }
        }

        // 🌕 Moon
        ctx.fillStyle = "#f5f3ce";
        ctx.beginPath();
        ctx.arc(420, 100, 40, 0, Math.PI * 2);
        ctx.fill();

        if (!gameOver) {

            // 🐱 Cat glow
            ctx.shadowColor = "cyan";
            ctx.shadowBlur = 20;
            if (catImage.complete) {
                ctx.drawImage(catImage, cat.x, cat.y, cat.width, cat.height);
            }
            ctx.shadowBlur = 0;

            // ======================
            // ITEMS
            // ======================

            for (let i = 0; i < items.length; i++) {

                let item = items[i];
                item.y += 2 + level;

                ctx.font = "25px Arial";

                if (item.type === "fish") ctx.fillText("🐟", item.x, item.y);
                if (item.type === "candy") ctx.fillText("🍬", item.x, item.y);
                if (item.type === "shield") ctx.fillText("⭐", item.x, item.y);

                // Collision
                if (
                    item.y > cat.y &&
                    item.x > cat.x &&
                    item.x < cat.x + cat.width
                ) {

                    if (item.type === "fish") {
                        if (boss.active) {
                            boss.health--;
                            createExplosion(boss.x + 60, boss.y + 60);
                            if (boss.health <= 0) {
                                boss.active = false;
                                level++;
                            }
                        } else {
                            score++;
                        }
                    }

                    if (item.type === "candy") {
                        if (!cat.shield) gameOver = true;
                    }

                    if (item.type === "shield") {
                        cat.shield = true;
                        setTimeout(() => cat.shield = false, 5000);
                    }

                    items.splice(i, 1);
                    i--;
                }

                if (item.y > 600) {
                    items.splice(i, 1);
                    i--;
                }
            }

            // ======================
            // BOSS AI
            // ======================

            if (boss.active) {

                if (boss.x < cat.x) boss.x += 2;
                else boss.x -= 2;

                ctx.fillStyle = "purple";
                ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

                ctx.fillStyle = "red";
                ctx.fillRect(150, 50, boss.health * 10, 12);
            }

            // ======================
            // EXPLOSIONS
            // ======================

            for (let i = 0; i < explosions.length; i++) {
                let exp = explosions[i];

                ctx.fillStyle = "orange";
                ctx.beginPath();
                ctx.arc(exp.x, exp.y, exp.size, 0, Math.PI * 2);
                ctx.fill();

                exp.size += 2;

                if (exp.size > 40) {
                    explosions.splice(i, 1);
                    i--;
                }
            }

            // ======================
            // UI
            // ======================

            ctx.fillStyle = "white";
            ctx.font = "18px Arial";
            ctx.fillText("Score: " + score, 20, 30);
            ctx.fillText("Level: " + level, 200, 30);
            ctx.fillText("Time: " + timeLeft, 400, 30);
            ctx.fillText("High Score: " + highScore, 20, 60);

        } else {

            if (score > highScore) {
                localStorage.setItem("catHighScore", score);
            }

            ctx.fillStyle = "white";
            ctx.font = "40px Arial";
            ctx.fillText("GAME OVER", 130, 280);
            ctx.font = "20px Arial";
            ctx.fillText("Refresh to Restart", 160, 320);
        }

        requestAnimationFrame(gameLoop);
    }

    gameLoop();
};