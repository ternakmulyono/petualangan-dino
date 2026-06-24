/* ============================================================
 * js/core/router.js
 * Screen Router & UI Update Utama
 * ============================================================ */

// --- DOM ELEMENTS ---
const screens = {
    nest: document.getElementById('screen-nest'),
    map: document.getElementById('screen-map'),
    game: document.getElementById('screen-game'),
    parent: document.getElementById('screen-parent')
};

const header = {
    backNestBtn: document.getElementById('btn-back-nest'),
    xpBarFill: document.getElementById('xp-bar-fill'),
    xpText: document.getElementById('xp-text'),
    parentBtn: document.getElementById('btn-parent-gate')
};

// --- GANTI LAYAR ---
function changeScreen(screenName) {
    // Hentikan suara pelafalan yang sedang berputar jika ada
    if (typeof stopLetterSound === 'function') {
        stopLetterSound();
    }

    Object.keys(screens).forEach(key => {
        screens[key].classList.remove('active');
        screens[key].classList.add('hidden');
    });

    screens[screenName].classList.add('active');
    screens[screenName].classList.remove('hidden');

    if (screenName === 'nest' || screenName === 'parent') {
        header.backNestBtn.classList.add('hidden');
    } else {
        header.backNestBtn.classList.remove('hidden');
    }

    if (screenName === 'map') updateMapScreen();

    if (screenName === 'nest') {
        updateNestParentBadges();
        checkPendingRewards();
    }
}

// --- UPDATE UI ELEMENTS (XP, Koin, Status Dino) ---
function updateUIElements() {
    const xpMax = 1000;
    const fillPercent = Math.min((gameState.xp / xpMax) * 100, 100);
    header.xpBarFill.style.width = `${fillPercent}%`;
    header.xpText.textContent = `${gameState.xp} XP`;
    document.getElementById('coin-text').textContent = gameState.coins;

    const eggElement = document.getElementById('egg-element');
    const dinoElement = document.getElementById('dino-element');
    const dinoStatusText = document.getElementById('dino-status-text');
    const dinoNameHeader = document.getElementById('dino-name');
    const container = document.getElementById('dino-avatar-container');
    const shopBtn = document.getElementById('btn-open-shop');

    if (gameState.dinoState === 'egg') {
        container.className = "egg-state";
        eggElement.classList.remove('hidden');
        dinoElement.classList.add('hidden');
        dinoNameHeader.textContent = "Telur Misterius";
        if (shopBtn) shopBtn.classList.add('hidden');

        const lettersLeft = LETTERS_TO_HATCH - gameState.masteredLetters.length;
        if (lettersLeft > 0) {
            dinoStatusText.textContent = `Dino kehilangan telur emasnya! Pelajari ${lettersLeft} materi lagi untuk membantu Dino menemukannya!`;
        } else {
            dinoStatusText.textContent = `Telur emas siap ditemukan! Mulai petualangan untuk melihat Dino menetas!`;
            eggElement.classList.add('wiggling');
        }
    } else {
        container.className = "dino-state";
        eggElement.classList.add('hidden');
        dinoElement.classList.remove('hidden');
        dinoElement.innerHTML = getDinoSvg(gameState.activeAccessory);
        dinoNameHeader.textContent = gameState.dinoName;
        dinoStatusText.textContent = `Bayi Dino sangat senang mendampingimu bertualang membaca!`;
        if (shopBtn) shopBtn.classList.remove('hidden');
    }

    document.getElementById('parent-stat-xp').textContent = `${gameState.xp} XP`;
    document.getElementById('parent-stat-dino').textContent = gameState.dinoState === 'egg' ? 'Telur' : 'Bayi Dino';
    document.getElementById('parent-stat-letters').textContent = `${gameState.masteredLetters.length} / ${LETTERS_TO_HATCH}`;

    const certBtn = document.getElementById('btn-print-certificate');
    const certInfo = document.getElementById('certificate-info-text');
    if (certBtn) {
        if (gameState.dinoState === 'baby') {
            certBtn.disabled = false;
            if (certInfo) certInfo.textContent = "Sertifikat Kelulusan Jilid 1 sudah siap dicetak! 🎉";
        } else {
            certBtn.disabled = true;
            if (certInfo) certInfo.textContent = "Sertifikat baru bisa dicetak setelah anak menyelesaikan seluruh level Jilid 1 (telur menetas).";
        }
    }

    renderAlphabetProgressGrid();
}

// --- UPDATE MAP SCREEN ---
function updateMapScreen() {
    const part1Letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    const part1Completed = part1Letters.every(l => gameState.masteredLetters.includes(l));

    const btnNext = document.getElementById('btn-next-map');
    const mapPage1 = document.getElementById('map-page-1');
    const mapPage2 = document.getElementById('map-page-2');

    const currentIsPart2 = part2Keys.includes(gameState.currentLevelRange);

    if (part1Completed) {
        if (btnNext) btnNext.classList.remove('hidden');
        if (currentIsPart2) {
            if (mapPage1) mapPage1.classList.add('hidden');
            if (mapPage2) mapPage2.classList.remove('hidden');
        } else {
            if (mapPage1) mapPage1.classList.remove('hidden');
            if (mapPage2) mapPage2.classList.add('hidden');
        }
    } else {
        if (btnNext) btnNext.classList.add('hidden');
        if (mapPage1) mapPage1.classList.remove('hidden');
        if (mapPage2) mapPage2.classList.add('hidden');
    }

    const keys = ['vowels', 'b-g', 'h-m', 'n-s', 't-z', ...part2Keys];
    keys.forEach((key, index) => {
        const node = document.querySelector(`.map-node[data-range="${key}"]`);
        if (!node) return;

        const letters = LEVEL_GROUPS[key];
        const masteredCount = letters.filter(l => gameState.masteredLetters.includes(l)).length;

        node.classList.remove('locked', 'active', 'completed');

        if (index === 0) {
            if (masteredCount === letters.length) {
                node.classList.add('completed');
            } else {
                node.classList.add('active');
            }
        } else {
            const prevKey = keys[index - 1];
            const prevLetters = LEVEL_GROUPS[prevKey];
            const prevMastered = prevLetters.every(l => gameState.masteredLetters.includes(l));

            if (prevMastered) {
                if (masteredCount === letters.length) {
                    node.classList.add('completed');
                } else {
                    node.classList.add('active');
                }
                const badge = node.querySelector('.node-badge');
                badge.innerHTML = index + 1;
            } else {
                node.classList.add('locked');
                const badge = node.querySelector('.node-badge');
                badge.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`;
            }
        }
    });
}

// --- NOTIFIKASI TOAST ---
function showNotification(text) {
    // Mainkan suara narasi notifikasi (Voice Feedback) menggunakan Google TTS Fallback
    if (typeof playLetterSoundFallback === 'function') {
        // Hilangkan emoji agar tidak ikut dilafalkan aneh oleh TTS
        const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "");
        playLetterSoundFallback(cleanText);
    }
}
