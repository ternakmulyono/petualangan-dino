/* ============================================================
 * js/progress/progress.js
 * Progress Tracking & Parent Dashboard
 * ============================================================ */

// --- STATE PARENT GATE ---
let gateCorrectAnswer = 0;

// --- BUKA PARENT GATE (SOAL MATEMATIKA) ---
function openParentGate() {
    const num1 = Math.floor(Math.random() * 8) + 2;
    const num2 = Math.floor(Math.random() * 8) + 2;
    gateCorrectAnswer = num1 + num2;

    document.getElementById('gate-question').textContent = `${num1} + ${num2} = ?`;
    document.getElementById('gate-answer').value = '';
    document.getElementById('gate-error').classList.add('hidden');
    document.getElementById('parent-gate-modal').classList.remove('hidden');
}

// --- TUTUP PARENT GATE ---
function closeParentGate() {
    document.getElementById('parent-gate-modal').classList.add('hidden');
}

// --- VALIDASI JAWABAN PARENT GATE ---
function submitParentGate() {
    const ans = parseInt(document.getElementById('gate-answer').value, 10);
    if (ans === gateCorrectAnswer) {
        closeParentGate();
        changeScreen('parent');
        document.querySelector('.tab-btn[data-tab="tab-progress"]').click();
    } else {
        document.getElementById('gate-error').classList.remove('hidden');
        document.getElementById('gate-answer').value = '';
        playErrorSFX();
    }
}

// --- RENDER GRID PROGRES HURUF A-Z ---
function renderAlphabetProgressGrid() {
    const grid = document.getElementById('alphabet-progress-grid');
    grid.innerHTML = '';

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let char of alphabet) {
        const badge = document.createElement('div');
        const isMastered = gameState.masteredLetters.includes(char.toLowerCase());
        badge.className = `letter-badge ${isMastered ? 'mastered' : ''}`;
        badge.textContent = char;
        grid.appendChild(badge);
    }

    let extrasSection = document.getElementById('parent-extras-section');
    if (!extrasSection) {
        extrasSection = document.createElement('div');
        extrasSection.id = 'parent-extras-section';
        extrasSection.style.marginTop = '24px';
        extrasSection.style.width = '100%';
        grid.parentNode.appendChild(extrasSection);
    }

    const syllables = [];
    const words = [];

    const isWord = (item) => item.length > 2 || item.includes('-');
    const isSyllable = (item) => item.length === 2 && !item.includes('-');

    Object.values(LEVEL_GROUPS).forEach(group => {
        group.forEach(item => {
            if (isSyllable(item) && !syllables.includes(item)) {
                syllables.push(item);
            } else if (isWord(item) && !words.includes(item)) {
                words.push(item);
            }
        });
    });

    const masteredSyllablesCount = syllables.filter(s => gameState.masteredLetters.includes(s)).length;
    const masteredWordsCount = words.filter(w => gameState.masteredLetters.includes(w)).length;

    extrasSection.innerHTML = `
        <h3 style="margin-top: 20px; margin-bottom: 10px; color: var(--primary-dark); font-size: 16px;">Suku Kata Dikuasai (${masteredSyllablesCount}/${syllables.length})</h3>
        <div class="extras-grid" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
            ${syllables.map(s => {
                const isMastered = gameState.masteredLetters.includes(s);
                return `<div class="letter-badge ${isMastered ? 'mastered' : ''}" style="padding: 6px 10px; border-radius: 12px; font-size: 14px; width: auto; height: auto;">${s}</div>`;
            }).join('')}
        </div>
        
        <h3 style="margin-bottom: 10px; color: var(--primary-dark); font-size: 16px;">Kata Dikuasai (${masteredWordsCount}/${words.length})</h3>
        <div class="extras-grid" style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${words.map(w => {
                const isMastered = gameState.masteredLetters.includes(w);
                return `<div class="letter-badge ${isMastered ? 'mastered' : ''}" style="padding: 6px 12px; border-radius: 12px; font-size: 14px; width: auto; height: auto;">${w}</div>`;
            }).join('')}
        </div>
    `;
}

// --- FORMAT TANGGAL INDONESIA ---
function getIndonesianDate() {
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const today = new Date();
    return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
}

// --- RESET SEMUA DATA GAME ---
async function resetAllGameData() {
    if (confirm("Apakah Anda yakin ingin menghapus semua progres belajar anak dan rekaman suara? Tindakan ini tidak bisa dibatalkan.")) {
        localStorage.clear();
        await clearAllDBRecordings();

        gameState.xp = 0;
        gameState.coins = 0;
        gameState.dinoState = 'egg';
        gameState.dinoName = 'Telur Misterius';
        gameState.masteredLetters = [];

        saveGameState();
        changeScreen('nest');
        showNotification("Semua data berhasil di-reset.");
        playBeep(300, 0.4, "sawtooth");
    }
}

// --- CHEAT: SELESAIKAN SEMUA LEVEL (DEV ONLY) ---
function cheatHatchGame() {
    if (confirm("Apakah Anda ingin langsung menyelesaikan seluruh level Jilid 1 untuk menetaskan telur dino?")) {
        gameState.xp = 1000;
        gameState.coins = 500;
        gameState.masteredLetters = [];

        Object.values(LEVEL_GROUPS).forEach(group => {
            group.forEach(item => {
                if (!gameState.masteredLetters.includes(item)) {
                    gameState.masteredLetters.push(item);
                }
            });
        });

        saveGameState();
        changeScreen('nest');
        closeParentGate();

        setTimeout(() => { triggerEggHatching(); }, 500);
    }
}
