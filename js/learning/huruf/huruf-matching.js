/* ============================================================
 * js/learning/huruf/huruf-matching.js
 * Mode Cari Huruf — drag huruf ke keranjang Dino
 * ============================================================ */

// --- LOAD FASE MATCHING (DRAG HURUF KE KERANJANG) ---
function loadLetterChallenge() {
    const letters = LEVEL_GROUPS[gameState.currentLevelRange];
    const letter = letters[gameState.currentLetterIndex];
    gameState.currentTargetLetter = letter;

    const targetLetterEl = document.getElementById('match-target-letter');
    if (targetLetterEl) targetLetterEl.textContent = letter.toLowerCase();

    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, idx) => {
        dot.className = 'step-dot';
        if (idx < gameState.currentLetterIndex) dot.className = 'step-dot completed';
        if (idx === gameState.currentLetterIndex) dot.className = 'step-dot active';
    });

    document.getElementById('game-match-view').classList.remove('hidden');
    document.getElementById('game-speak-view').classList.add('hidden');
    document.getElementById('game-write-view').classList.add('hidden');

    const playground = document.getElementById('forest-playground');
    const lettersContainer = document.getElementById('forest-draggable-letters');
    lettersContainer.innerHTML = '';

    const basket = document.getElementById('dino-basket-dropzone');
    if (basket) basket.classList.remove('hover');

    // Generate pilihan: 1 benar + 2 distraktor
    const choices = [letter];
    const currentGroup = LEVEL_GROUPS[gameState.currentLevelRange];

    const isWord = (item) => item.length > 2 || item.includes('-');
    const isSyllable = (item) => item.length === 2 && !item.includes('-');
    const isLetter = (item) => item.length === 1;

    const targetType = isWord(letter) ? 'word' : (isSyllable(letter) ? 'syllable' : 'letter');
    const sameTypeGroup = currentGroup.filter(item => {
        if (targetType === 'word') return isWord(item);
        if (targetType === 'syllable') return isSyllable(item);
        return isLetter(item);
    });

    while (choices.length < 3 && choices.length < sameTypeGroup.length) {
        const randItem = sameTypeGroup[Math.floor(Math.random() * sameTypeGroup.length)];
        if (!choices.includes(randItem)) choices.push(randItem);
    }

    if (choices.length < 3) {
        let fallbackList = ['a', 'b', 'c', 'd', 'e'];
        if (targetType === 'word') fallbackList = ['ba-ba', 'ca-ca', 'da-da', 'ga-ga', 'ma-ma'];
        else if (targetType === 'syllable') fallbackList = ['ba', 'ca', 'da', 'ga', 'ma'];
        while (choices.length < 3) {
            const randItem = fallbackList[Math.floor(Math.random() * fallbackList.length)];
            if (!choices.includes(randItem)) choices.push(randItem);
        }
    }

    choices.sort(() => Math.random() - 0.5);

    const spawnPoints = [
        { left: 10, top: 15 },
        { left: 35, top: 45 },
        { left: 15, top: 60 }
    ];
    spawnPoints.sort(() => Math.random() - 0.5);

    choices.forEach((ch, idx) => {
        const el = document.createElement('div');
        el.className = 'draggable-letter';
        el.textContent = ch.toLowerCase();
        el.setAttribute('data-letter', ch);

        const pt = spawnPoints[idx];
        el.style.left = `${pt.left}%`;
        el.style.top = `${pt.top}%`;
        el.style.animationDelay = `${idx * 0.5}s`;

        lettersContainer.appendChild(el);

        initPointerDrag(el, playground,
            (dragEl) => {
                const dragRect = dragEl.getBoundingClientRect();
                const basketRect = basket.getBoundingClientRect();
                if (isOverlapping(dragRect, basketRect, 0.2)) {
                    basket.classList.add('hover');
                } else {
                    basket.classList.remove('hover');
                }
            },
            (dragEl) => {
                const dragRect = dragEl.getBoundingClientRect();
                const basketRect = basket.getBoundingClientRect();
                basket.classList.remove('hover');

                if (isOverlapping(dragRect, basketRect, 0.25)) {
                    const dragLetter = dragEl.getAttribute('data-letter');
                    if (dragLetter === gameState.currentTargetLetter) {
                        dragEl.style.transition = 'all 0.4s ease';
                        dragEl.style.transform = 'scale(0.1)';
                        dragEl.style.opacity = '0';

                        const mascot = document.getElementById('game-mascot-dino');
                        if (mascot) {
                            mascot.classList.add('jump');
                            setTimeout(() => mascot.classList.remove('jump'), 600);
                        }

                        playSuccessSFX();
                        showNotification('Hebat! Jawaban Benar! +10 XP');
                        gameState.xp += 10;
                        saveGameState();

                        setTimeout(() => { transitionToSpeakPhase(); }, 800);
                    } else {
                        playErrorSFX();
                        showNotification('Tarik huruf yang tepat ya! Kamu pasti bisa!');
                        bounceBack(dragEl, pt.left, pt.top);
                        setTimeout(() => {
                            dragEl.style.animation = 'hidden-letter-float 3s ease-in-out infinite';
                            dragEl.style.animationDelay = `${idx * 0.5}s`;
                        }, 400);
                    }
                } else {
                    bounceBack(dragEl, pt.left, pt.top);
                    setTimeout(() => {
                        dragEl.style.animation = 'hidden-letter-float 3s ease-in-out infinite';
                        dragEl.style.animationDelay = `${idx * 0.5}s`;
                    }, 400);
                }
            }
        );
    });

    setTimeout(() => { playLetterSound(letter); }, 400);
}

// --- HANDLER KLIK PILIHAN HURUF ---
function handleOptionClick(selectedLetter, cardElement) {
    if (selectedLetter === gameState.currentTargetLetter) {
        cardElement.classList.add('correct');

        const mascot = document.getElementById('game-mascot-dino');
        if (mascot) {
            mascot.classList.add('jump');
            setTimeout(() => mascot.classList.remove('jump'), 600);
        }

        playSuccessSFX();
        showNotification('Hebat! Jawaban Benar! +10 XP');
        gameState.xp += 10;
        saveGameState();

        setTimeout(() => { transitionToSpeakPhase(); }, 1000);
    } else {
        cardElement.classList.add('wrong');
        playErrorSFX();
        showNotification('Coba lagi ya, kamu pasti bisa!');
        setTimeout(() => { cardElement.classList.remove('wrong'); }, 800);
    }
}

// --- TRANSISI KE FASE UCAPKAN HURUF ---
function transitionToSpeakPhase() {
    document.getElementById('game-match-view').classList.add('hidden');
    document.getElementById('game-speak-view').classList.remove('hidden');

    const container = document.getElementById('target-letter-display');
    const letterLower = gameState.currentTargetLetter.toLowerCase();
    const letterUpper = gameState.currentTargetLetter.toUpperCase();
    container.innerHTML = `
        <span class="letter-main">${letterLower}</span>
        <span class="letter-main" style="color: var(--primary);">${letterUpper}</span>
    `;

    gameState.recordedBlob = null;
    document.getElementById('playback-area').classList.add('hidden');
    document.getElementById('btn-submit-speak').classList.add('hidden');
    document.getElementById('recording-status').textContent = 'Tekan tombol mikrofon lalu tirukan suara hurufnya.';

    const recordBtn = document.getElementById('btn-record-mic');
    recordBtn.className = 'mic-button';
    document.getElementById('icon-mic').classList.remove('hidden');
    document.getElementById('icon-stop').classList.add('hidden');

    setTimeout(() => { playLetterSound(gameState.currentTargetLetter); }, 300);
}
