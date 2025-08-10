const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const player = { x: 200, y: 350, r: 15, vx: 0, vy: 0, color: '#4285f4' };
const enemies = [
    { x: 100, y: 80, r: 15, color: '#e84545' },
    { x: 200, y: 120, r: 15, color: '#e84545' },
    { x: 300, y: 80, r: 15, color: '#e84545' }
];
scoreEl.textContent = enemies.length;

let dragging = false;
let dragStart = { x: 0, y: 0 };
let dragEnd = { x: 0, y: 0 };

function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePos(e);
    const dx = pos.x - player.x;
    const dy = pos.y - player.y;
    if (Math.sqrt(dx * dx + dy * dy) <= player.r) {
        dragging = true;
        dragStart = pos;
        dragEnd = pos;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (dragging) {
        dragEnd = getMousePos(e);
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (dragging) {
        const pos = getMousePos(e);
        player.vx = (dragStart.x - pos.x) / 10;
        player.vy = (dragStart.y - pos.y) / 10;
        dragging = false;
    }
});

function update() {
    player.x += player.vx;
    player.y += player.vy;
    player.vx *= 0.99;
    player.vy *= 0.99;

    // bounds
    if (player.x - player.r < 0) {
        player.x = player.r;
        player.vx *= -1;
    }
    if (player.x + player.r > canvas.width) {
        player.x = canvas.width - player.r;
        player.vx *= -1;
    }
    if (player.y - player.r < 0) {
        player.y = player.r;
        player.vy *= -1;
    }
    if (player.y + player.r > canvas.height) {
        player.y = canvas.height - player.r;
        player.vy *= -1;
    }

    // enemy collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < e.r + player.r) {
            enemies.splice(i, 1);
            scoreEl.textContent = enemies.length;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw enemies
    enemies.forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.fill();
    });

    // draw player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();

    // draw drag line
    if (dragging) {
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(dragEnd.x, dragEnd.y);
        ctx.strokeStyle = '#333';
        ctx.stroke();
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
