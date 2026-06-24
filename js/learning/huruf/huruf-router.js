/* ============================================================
 * js/learning/huruf/huruf-router.js
 * Router Level — pilih mode dan siapkan UI game
 * ============================================================ */

// --- MULAI LEVEL (ENTRY POINT UTAMA) ---
function startLevel(range, mode) {
    gameState.currentLevelRange = range;
    gameState.currentGameMode = mode || 'letters';

    // Sembunyikan semua view
    const views = [
        'game-match-view', 'game-speak-view', 'game-read-view',
        'game-picture-view', 'game-drag-match-view', 'game-write-view'
    ];
    views.forEach(id => document.getElementById(id).classList.add('hidden'));

    if (isPart2Range(range)) {
        setupReadView(range);
        return;
    }

    if (gameState.currentGameMode === 'drag-match') {
        document.getElementById('game-level-title').textContent = `Misi Pasang: ${range}`;
        _setupSingleDot();
        changeScreen('game');
        document.getElementById('game-drag-match-view').classList.remove('hidden');
        loadDragMatchChallenge();
        return;
    }

    if (gameState.currentGameMode === 'pictures') {
        setupPictureView(range);
        return;
    }

    // --- DEFAULT: MODE CARI HURUF ---
    const letters = LEVEL_GROUPS[range];
    let firstUnmasteredIndex = letters.findIndex(l => !gameState.masteredLetters.includes(l));
    if (firstUnmasteredIndex === -1) firstUnmasteredIndex = 0;

    gameState.currentLetterIndex = firstUnmasteredIndex;
    document.getElementById('game-level-title').textContent = `Misi: Huruf ${range}`;

    const dotsContainer = document.getElementById('game-step-dots');
    dotsContainer.innerHTML = '';
    letters.forEach((_, idx) => {
        const dot = document.createElement('div');
        if (idx < gameState.currentLetterIndex) {
            dot.className = 'step-dot completed';
        } else if (idx === gameState.currentLetterIndex) {
            dot.className = 'step-dot active';
        } else {
            dot.className = 'step-dot';
        }
        dotsContainer.appendChild(dot);
    });

    changeScreen('game');
    loadLetterChallenge();
}

// --- HELPER INTERNAL: Render satu dot aktif ---
function _setupSingleDot() {
    const dotsContainer = document.getElementById('game-step-dots');
    dotsContainer.innerHTML = '';
    const dot = document.createElement('div');
    dot.className = 'step-dot active';
    dotsContainer.appendChild(dot);
}

// --- MODAL PREVIEW MISI ---
function openMissionPreview(range) {
    const theme = LEVEL_THEMES[range];
    if (!theme) {
        startLevel(range);
        return;
    }

    document.getElementById('mission-area-title').textContent = theme.name;
    document.getElementById('mission-story-text').textContent = `"${theme.story}"`;
    document.getElementById('mission-reward-xp').textContent = theme.xp;
    document.getElementById('mission-reward-coins').textContent = theme.coins;

    const emojiEl = document.getElementById('mission-area-emoji');
    emojiEl.textContent = theme.name.split(' ')[0] || '🌱';

    const targetsList = document.getElementById('mission-targets-list');
    targetsList.innerHTML = '';

    const items = LEVEL_GROUPS[range];
    const actionsArea = document.querySelector('#mission-modal .modal-actions');

    if (isPart2Range(range)) {
        const syllables = items.slice(0, 5);
        const li1 = document.createElement('li');
        li1.textContent = `Latih membaca suku kata: ${syllables.join(', ')}`;
        targetsList.appendChild(li1);

        const li2 = document.createElement('li');
        li2.textContent = 'Membaca lancar 5 baris kata latihan';
        targetsList.appendChild(li2);

        actionsArea.innerHTML = `
            <button id="btn-mission-cancel" class="btn-secondary" style="flex:1;margin:0;padding:10px;">Batal</button>
            <button id="btn-mission-start" class="btn-primary" style="flex:1;margin:0;padding:10px;">Mulai Misi!</button>
        `;
        document.getElementById('btn-mission-cancel').addEventListener('click', () => {
            document.getElementById('mission-modal').classList.add('hidden');
        });
        document.getElementById('btn-mission-start').addEventListener('click', () => {
            document.getElementById('mission-modal').classList.add('hidden');
            startLevel(range);
        });
    } else {
        const letters = items.join(', ').toLowerCase();
        const li1 = document.createElement('li');
        li1.textContent = `Cari, Lafalkan & Tulis Huruf (CALIS): ${letters}`;
        targetsList.appendChild(li1);

        const li2 = document.createElement('li');
        li2.textContent = 'Pasangkan huruf besar dengan huruf kecil yang tepat';
        targetsList.appendChild(li2);

        const li3 = document.createElement('li');
        li3.textContent = 'Baca nama gambar dengan kartu kata bergambar';
        targetsList.appendChild(li3);

        // Cek status penyelesaian fase untuk range ini
        if (!gameState.phaseStatus) gameState.phaseStatus = {};
        const rangeStatus = gameState.phaseStatus[range] || { letters: false, 'drag-match': false, pictures: false };

        const isDragMatchDisabled = !rangeStatus.letters;
        const isPicturesDisabled = !rangeStatus['drag-match'];

        actionsArea.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:8px;width:100%;">
                <button id="btn-mission-letters" class="btn-primary" style="margin:0;width:100%;padding:10px;background:var(--primary);border-color:var(--primary-dark);box-shadow:0 4px 0 var(--primary-dark);font-size:14px;">🔍 Cari & Tulis Huruf (CALIS)</button>
                <button id="btn-mission-drag-match" class="btn-primary" style="margin:0;width:100%;padding:10px;background:#9C27B0;border-color:#7B1FA2;box-shadow:0 4px 0 #7B1FA2;font-size:14px;" ${isDragMatchDisabled ? 'disabled style="opacity:0.5;cursor:not-allowed;background:#777;border-color:#555;box-shadow:none;"' : ''}>🧩 Pasangkan Huruf (Besar-Kecil)</button>
                <button id="btn-mission-pictures" class="btn-primary" style="margin:0;width:100%;padding:10px;background:var(--accent);border-color:var(--accent-dark);box-shadow:0 4px 0 var(--accent-dark);font-size:14px;" ${isPicturesDisabled ? 'disabled style="opacity:0.5;cursor:not-allowed;background:#777;border-color:#555;box-shadow:none;"' : ''}>🖼️ Kata Gambar</button>
                <button id="btn-mission-cancel" class="btn-secondary" style="margin:0;width:100%;padding:8px;font-size:13px;">Batal</button>
            </div>
        `;
        
        document.getElementById('btn-mission-cancel').addEventListener('click', () => {
            document.getElementById('mission-modal').classList.add('hidden');
        });
        document.getElementById('btn-mission-letters').addEventListener('click', () => {
            document.getElementById('mission-modal').classList.add('hidden');
            startLevel(range, 'letters');
        });
        if (!isDragMatchDisabled) {
            document.getElementById('btn-mission-drag-match').addEventListener('click', () => {
                document.getElementById('mission-modal').classList.add('hidden');
                startLevel(range, 'drag-match');
            });
        }
        if (!isPicturesDisabled) {
            document.getElementById('btn-mission-pictures').addEventListener('click', () => {
                document.getElementById('mission-modal').classList.add('hidden');
                startLevel(range, 'pictures');
            });
        }
    }

    document.getElementById('mission-modal').classList.remove('hidden');
}
