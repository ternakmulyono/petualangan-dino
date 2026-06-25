/* ============================================================
 * js/learning/menulis.js
 * Logika Menulis — Canvas Tracing & Bridge Assembly Game
 * ============================================================ */

// --- LOAD FASE MENULIS (ROUTING BERDASARKAN LEVEL RANGE) ---
function loadWriteChallenge() {
    if (typeof updateMascotDino === 'function') updateMascotDino('waving'); // Awal masuk, Dino memakai aksesoris
    
    const letter = gameState.currentTargetLetter;
    const range = gameState.currentLevelRange;

    document.getElementById('game-speak-view').classList.add('hidden');
    document.getElementById('game-write-view').classList.remove('hidden');

    document.getElementById('bridge-assembly-slots').innerHTML = '';
    document.getElementById('bridge-assembly-wood').innerHTML = '';
    document.getElementById('write-bg-visual').innerHTML = '';

    const canvas = document.getElementById('write-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    allStrokes = [];
    currentStroke = [];

    // Tentukan tipe mini-game berdasarkan level
    let gameType = 'trace-magic';
    if (range === 'vowels') {
        gameType = 'perbaiki-telur';
    } else if (range === 'n-s') {
        gameType = 'tanam-huruf';
    }

    const instructionEl = document.getElementById('write-instruction');
    const bgVisualEl = document.getElementById('write-bg-visual');

    if (gameType === 'perbaiki-telur') {
        instructionEl.textContent = `Ketuk dan telusuri retakan telur Dino agar kembali sehat! 🥚`;
        bgVisualEl.innerHTML = `
            <div style="position: absolute; top: 10px; left: 10px;">
                <svg viewBox="0 0 100 120" width="70" height="85" style="opacity: 0.85; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));">
                    <path d="M50 10 C20 40, 10 80, 10 90 C10 105, 28 115, 50 115 C72 115, 90 105, 90 90 C90 80, 80 40, 50 10 Z" fill="#FFFDE7" stroke="#8D6E63" stroke-width="3.5" />
                    <path d="M50 20 L45 35 L55 50 L40 65 L60 80 L50 95" fill="none" stroke="#D7CCC8" stroke-width="2" stroke-dasharray="3,3" />
                </svg>
            </div>
        `;
        canvas.style.display = 'block';
        initCanvasTracing(letter);

    } else if (gameType === 'tanam-huruf') {
        instructionEl.textContent = `Tebalkan pola di tanah ajaib agar tanaman buah Dino tumbuh! 🌱`;
        bgVisualEl.innerHTML = `
            <div style="position: absolute; top: 10px; left: 10px;">
                <svg viewBox="0 0 100 100" width="80" height="80" style="opacity: 0.85;">
                    <ellipse cx="50" cy="65" rx="45" ry="25" fill="#8D6E63" stroke="#5D4037" stroke-width="3.5" />
                    <text x="35" y="50" font-size="28">🌱</text>
                </svg>
            </div>
        `;
        canvas.style.display = 'block';
        initCanvasTracing(letter);

    } else if (gameType === 'bangun-jembatan') {
        instructionEl.textContent = `Susun jembatan kayu agar Dino bisa menyeberang sungai! 🪵`;
        bgVisualEl.innerHTML = `
            <svg viewBox="0 0 100 100" width="100%" height="100%" style="opacity: 0.5;">
                <rect x="0" y="10" width="100" height="80" fill="#80DEEA" />
                <rect x="0" y="0" width="100" height="15" fill="#81C784" />
                <rect x="0" y="85" width="100" height="15" fill="#81C784" />
                <path d="M10 30 Q30 25 50 30 T90 30" fill="none" stroke="#4DD0E1" stroke-width="2" />
                <path d="M5 60 Q25 55 45 60 T85 60" fill="none" stroke="#4DD0E1" stroke-width="2" />
            </svg>
        `;
        canvas.style.display = 'none';
        initBridgeAssembly(letter);

    } else {
        // default: trace-magic
        instructionEl.textContent = `Tebalkan simbol sihir kuno agar pintu batu terbuka! 🔮`;
        bgVisualEl.innerHTML = `
            <div style="position: absolute; top: 10px; left: 10px;">
                <svg viewBox="0 0 100 100" width="80" height="80" style="opacity: 0.85; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));">
                    <rect x="15" y="25" width="12" height="70" rx="3" fill="#B0BEC5" stroke="#37474F" stroke-width="2.5" />
                    <rect x="73" y="25" width="12" height="70" rx="3" fill="#B0BEC5" stroke="#37474F" stroke-width="2.5" />
                    <path d="M10 25 C10 5, 90 5, 90 25 Z" fill="none" stroke="#37474F" stroke-width="8" stroke-linecap="round" />
                    <path d="M10 25 C10 5, 90 5, 90 25 Z" fill="none" stroke="#78909C" stroke-width="5" stroke-linecap="round" />
                </svg>
            </div>
        `;
        canvas.style.display = 'block';
        initCanvasTracing(letter);
    }
}

// --- INISIALISASI CANVAS TRACING ---
function initCanvasTracing(letter) {
    const canvas = document.getElementById('write-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth || 300;
    canvas.height = canvas.offsetHeight || 290;

    const w = canvas.width;
    const h = canvas.height;

    const checkpoints = getCheckpointsForLetter(letter, w, h);
    redrawCanvas(canvas, ctx, letter, checkpoints);

    let isDrawing = false;

    const handleStart = (x, y) => {
        isDrawing = true;
        currentStroke = [{ x, y }];
        checkCheckpoints(x, y, checkpoints);
        redrawCanvas(canvas, ctx, letter, checkpoints);
    };

    const handleMove = (x, y) => {
        if (!isDrawing) return;
        currentStroke.push({ x, y });
        checkCheckpoints(x, y, checkpoints);
        redrawCanvas(canvas, ctx, letter, checkpoints);
    };

    const handleEnd = () => {
        if (!isDrawing) return;
        isDrawing = false;
        if (currentStroke.length > 1) {
            allStrokes.push(currentStroke);
        }
        currentStroke = [];
        redrawCanvas(canvas, ctx, letter, checkpoints);
    };

    const getCoordinates = (e) => {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerDown = (e) => {
        e.preventDefault();
        canvas.setPointerCapture(e.pointerId);
        const coords = getCoordinates(e);
        handleStart(coords.x, coords.y);
    };

    const onPointerMove = (e) => {
        if (!isDrawing) return;
        const coords = getCoordinates(e);
        handleMove(coords.x, coords.y);
    };

    const onPointerUp = (e) => {
        if (!isDrawing) return;
        canvas.releasePointerCapture(e.pointerId);
        handleEnd();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);

    canvas.onReset = () => {
        allStrokes = [];
        currentStroke = [];
        checkpoints.forEach(cp => cp.visited = false);
        redrawCanvas(canvas, ctx, letter, checkpoints);

        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);

        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
    };
}

// --- GENERATE CHECKPOINT UNTUK HURUF ---
function getCheckpointsForLetter(letter, canvasWidth, canvasHeight) {
    return []; // Target-free, no checkpoints needed
}

// --- GAMBAR PANDUAN HURUF DI CANVAS ---
function drawGuidePath(ctx, letter, canvasWidth, canvasHeight) {
    LETTER_LAYOUT_CENTERS.forEach(center => {
        const cx = (center.cx / 100) * canvasWidth;
        const cy = (center.cy / 100) * canvasHeight;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 90px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter.toLowerCase(), cx, cy);
    });
}

// --- REDRAW CANVAS (PANDUAN + CORETAN USER) ---
function redrawCanvas(canvas, ctx, letter, checkpoints) {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    drawGuidePath(ctx, letter, w, h);

    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';

    allStrokes.concat([currentStroke]).forEach(stroke => {
        if (stroke.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        ctx.stroke();
    });
}

// --- CEK CHECKPOINT TRACING ---
function checkCheckpoints(x, y, checkpoints, tolerance = 35) {
    let progressUpdated = false;
    checkpoints.forEach(cp => {
        if (!cp.visited) {
            const dist = Math.hypot(x - cp.x, y - cp.y);
            if (dist <= tolerance) {
                cp.visited = true;
                progressUpdated = true;
            }
        }
    });
    return progressUpdated;
}

// --- MINI-GAME: BANGUN JEMBATAN (RANGE h-m) ---
function initBridgeAssembly(letter) {
    const slotsContainer = document.getElementById('bridge-assembly-slots');
    const woodContainer = document.getElementById('bridge-assembly-wood');
    const playground = document.getElementById('forest-write-playground');

    slotsContainer.innerHTML = '';
    woodContainer.innerHTML = '';

    const components = BRIDGE_LETTER_COMPONENTS[letter.toLowerCase()];
    if (!components) {
        loadWriteChallenge();
        return;
    }

    let matchedCount = 0;

    components.forEach((comp, idx) => {
        // Buat slot
        const slot = document.createElement('div');
        slot.className = 'bridge-wood-slot';
        slot.style.left = `${comp.x}%`;
        slot.style.top = `${comp.y}%`;
        slot.style.width = `${comp.w}%`;
        slot.style.height = `${comp.h}%`;
        if (comp.r) slot.style.transform = `rotate(${comp.r}deg)`;
        slotsContainer.appendChild(slot);

        // Buat kayu yang bisa di-drag
        const plank = document.createElement('div');
        plank.className = `bridge-wood-plank wood-plank-${comp.type}`;
        plank.style.width = `${comp.w}%`;
        plank.style.height = `${comp.h}%`;
        plank.style.left = `${10 + idx * 25}%`;
        plank.style.top = `75%`;
        plank.innerHTML = comp.label;
        if (comp.r) plank.style.transform = `rotate(${comp.r}deg)`;

        woodContainer.appendChild(plank);

        initPointerDrag(plank, playground,
            (dragEl) => {
                const dragRect = dragEl.getBoundingClientRect();
                const slotRect = slot.getBoundingClientRect();
                if (isOverlapping(dragRect, slotRect, 0.2)) {
                    slot.classList.add('matched');
                } else {
                    slot.classList.remove('matched');
                }
            },
            (dragEl) => {
                const dragRect = dragEl.getBoundingClientRect();
                const slotRect = slot.getBoundingClientRect();

                if (isOverlapping(dragRect, slotRect, 0.25)) {
                    slot.classList.add('matched');
                    slot.style.background = '#8D6E63';
                    slot.style.borderStyle = 'solid';
                    slot.style.borderColor = 'var(--earth-dark)';
                    slot.innerHTML = `<span style="font-size: 16px; line-height: 1;">🪵</span>`;

                    dragEl.remove();
                    playSuccessSFX();
                    matchedCount++;

                    if (matchedCount === components.length) {
                        setTimeout(() => { completeWriteChallenge(); }, 500);
                    }
                } else {
                    slot.classList.remove('matched');
                    playErrorSFX();

                    dragEl.style.transition = 'left 0.4s ease, top 0.4s ease';
                    dragEl.style.left = `${10 + idx * 25}%`;
                    dragEl.style.top = `75%`;
                    setTimeout(() => { dragEl.style.transition = ''; }, 400);
                }
            }
        );
    });
}

// --- SELESAIKAN FASE MENULIS ---
function completeWriteChallenge() {
    const letter = gameState.currentTargetLetter;
    const range = gameState.currentLevelRange;

    spawnConfetti();
    if (typeof updateMascotDino === 'function') updateMascotDino('merayakan'); // Dino senang
    const mascot = document.getElementById('game-mascot-dino');
    if (mascot) {
        mascot.classList.add('jump');
        setTimeout(() => mascot.classList.remove('jump'), 600);
    }

    playSuccessSFX();

    const bgVisualEl = document.getElementById('write-bg-visual');
    if (range === 'vowels') {
        showNotification("Hebat!"); // MP3: 0010_HEBAT_.mp3
        bgVisualEl.innerHTML = `
            <div style="position: absolute; top: 10px; left: 10px;">
                <svg viewBox="0 0 100 120" width="70" height="85" style="opacity: 0.95; filter: drop-shadow(0 4px 10px rgba(129, 199, 132, 0.5)); transform: scale(1.05); transition: transform 0.5s;">
                    <path d="M50 10 C20 40, 10 80, 10 90 C10 105, 28 115, 50 115 C72 115, 90 105, 90 90 C90 80, 80 40, 50 10 Z" fill="#E8F5E9" stroke="#2E7D32" stroke-width="4" />
                    <text x="35" y="70" font-size="30">🦖</text>
                </svg>
            </div>
        `;
    } else if (range === 'n-s') {
        showNotification("Luar biasa!"); // MP3: 0012_LUAR_BIASA_.mp3
        bgVisualEl.innerHTML = `
            <div style="position: absolute; top: 10px; left: 10px;">
                <svg viewBox="0 0 100 100" width="80" height="80" style="opacity: 0.95;">
                    <ellipse cx="50" cy="65" rx="45" ry="25" fill="#8D6E63" stroke="#5D4037" stroke-width="3.5" />
                    <text x="35" y="45" font-size="32">🌸</text>
                </svg>
            </div>
        `;
    } else {
        showNotification("Bagus sekali!"); // MP3: 0011_BAGUS_SEKALI_.mp3
        bgVisualEl.innerHTML = `
            <div style="position: absolute; top: 10px; left: 10px;">
                <svg viewBox="0 0 100 100" width="80" height="80" style="opacity: 0.95; filter: drop-shadow(0 4px 10px rgba(129, 199, 132, 0.5));">
                    <rect x="15" y="25" width="12" height="70" rx="3" fill="#B0BEC5" stroke="#37474F" stroke-width="2.5" />
                    <rect x="73" y="25" width="12" height="70" rx="3" fill="#B0BEC5" stroke="#37474F" stroke-width="2.5" />
                    <path d="M10 25 C10 5, 90 5, 90 25 Z" fill="none" stroke="#2E7D32" stroke-width="8" stroke-linecap="round" />
                    <path d="M28 26 L72 26 L72 95 L28 95 Z" fill="#E8F5E9" opacity="0.8" />
                    <text x="35" y="65" font-size="28">🦖</text>
                </svg>
            </div>
        `;
    }

    if (!gameState.masteredLetters.includes(letter)) {
        gameState.masteredLetters.push(letter);
    }

    gameState.xp += 15;
    gameState.coins += 2;

    // Set status fase letters selesai untuk tingkat ini
    if (!gameState.phaseStatus) gameState.phaseStatus = {};
    if (!gameState.phaseStatus[range]) gameState.phaseStatus[range] = {};
    gameState.phaseStatus[range].letters = true;

    saveGameState();

    // Jeda 2 detik agar suara feedback selesai, lalu cek apakah masih ada huruf berikutnya
    setTimeout(() => {
        const letters = LEVEL_GROUPS[gameState.currentLevelRange];
        if (gameState.currentLetterIndex < letters.length - 1) {
            // Masih ada huruf berikutnya — lanjut ke huruf berikutnya
            gameState.currentLetterIndex++;
            loadLetterChallenge();
        } else {
            // Semua huruf di level ini sudah selesai — tampilkan notifikasi misi selesai lalu kembali ke map
            showNotification("Selamat! Misi selesai! Hadiah XP dan koin disimpan."); // MP3: 0018_SELAMAT__MISI_SELESAI__HADIAH_XP_DAN_KOIN_DISIMPAN_.mp3
            setTimeout(() => {
                changeScreen('map');
            }, 4500); // Naikkan dari 3500ms ke 4500ms agar audio "Selamat! Misi selesai!" selesai diucapkan dan tidak terpotong
        }
    }, 2000);
}

// --- LATIHAN MENULIS TAHAP 2 (SYLLABLES / WORDS TRACING) ---
let currentReadWriteText = "";
let readWriteStrokes = [];
let currentReadWriteStroke = [];

function selectReadWriteItem(text, playSound = true) {
    currentReadWriteText = text;
    
    // Highlight item yang aktif di UI
    document.querySelectorAll('.clickable-read-item').forEach(el => {
        if (el.getAttribute('data-text') === text) {
            el.style.background = '#81C784';
            el.style.color = '#FFFFFF';
            el.style.borderColor = '#2E7D32';
            el.style.boxShadow = '0 0 8px rgba(46, 125, 50, 0.6)';
            el.style.transform = 'scale(1.08)';
        } else {
            el.style.transform = 'scale(1)';
            const isWord = el.getAttribute('data-text').includes('-');
            if (isWord) {
                el.style.background = '#E8F5E9';
                el.style.color = 'var(--text-dark)';
                el.style.borderColor = '#C8E6C9';
                el.style.boxShadow = 'none';
            } else {
                el.style.background = '#FFF9C4';
                el.style.color = 'var(--text-dark)';
                el.style.borderColor = '#FFF59D';
                el.style.boxShadow = 'none';
            }
        }
    });

    // Mainkan suara pelafalan suku kata/kata yang diklik
    if (playSound) {
        playLetterSound(text);
    }

    // Muat canvas tracing
    initReadWriteCanvas(text);
}

function initReadWriteCanvas(text) {
    const canvas = document.getElementById('read-write-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Sinkronisasi ukuran canvas
    canvas.width = canvas.offsetWidth || 300;
    canvas.height = canvas.offsetHeight || 180;

    readWriteStrokes = [];
    currentReadWriteStroke = [];

    redrawReadWriteCanvas(canvas, ctx, text);

    // Bind event mouse/touch
    canvas.onmousedown = (e) => handleReadWriteStart(e.offsetX, e.offsetY, canvas, ctx, text);
    canvas.onmousemove = (e) => handleReadWriteMove(e.offsetX, e.offsetY, canvas, ctx, text);
    canvas.onmouseup = () => handleReadWriteEnd();

    canvas.ontouchstart = (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        handleReadWriteStart(touch.clientX - rect.left, touch.clientY - rect.top, canvas, ctx, text);
    };
    canvas.ontouchmove = (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        handleReadWriteMove(touch.clientX - rect.left, touch.clientY - rect.top, canvas, ctx, text);
    };
    canvas.ontouchend = () => handleReadWriteEnd();
}

function handleReadWriteStart(x, y, canvas, ctx, text) {
    currentReadWriteStroke = [{ x, y }];
    redrawReadWriteCanvas(canvas, ctx, text);
}

function handleReadWriteMove(x, y, canvas, ctx, text) {
    if (currentReadWriteStroke.length === 0) return;
    currentReadWriteStroke.push({ x, y });
    redrawReadWriteCanvas(canvas, ctx, text);
}

function handleReadWriteEnd() {
    if (currentReadWriteStroke.length > 0) {
        readWriteStrokes.push(currentReadWriteStroke);
        currentReadWriteStroke = [];
    }
}

function redrawReadWriteCanvas(canvas, ctx, text) {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Gambar panduan tulisan (dotted text guide)
    const displayText = text.replace(/-/g, ' ').toLowerCase();
    ctx.fillStyle = 'rgba(46, 125, 50, 0.55)'; // warna hijau tua semi-transparan untuk kontras yang lebih baik
    const fontSize = displayText.length > 8 ? 32 : (displayText.length > 5 ? 44 : 64);
    ctx.font = `bold ${fontSize}px "Fredoka", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, w / 2, h / 2);

    // 2. Gambar coretan tangan user
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2E7D32'; // Hijau tua tema dino

    readWriteStrokes.concat([currentReadWriteStroke]).forEach(stroke => {
        if (stroke.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        ctx.stroke();
    });
}
