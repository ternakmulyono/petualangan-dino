/* ============================================================
 * js/learning/huruf/huruf-dragdrop.js
 * Mode Pasangkan Huruf — drag huruf besar ke slot huruf kecil
 * ============================================================ */

// --- LOAD MODE PASANGKAN HURUF (BESAR-KECIL) ---
function loadDragMatchChallenge() {
    const range = gameState.currentLevelRange;
    const letters = LEVEL_GROUPS[range];

    const slotsContainer = document.getElementById('drag-match-slots');
    slotsContainer.innerHTML = '';

    const playground = document.getElementById('forest-drag-match-playground');
    const lettersContainer = document.getElementById('forest-drag-match-letters');
    lettersContainer.innerHTML = '';

    // 1. Buat slot
    letters.forEach(letter => {
        const slot = document.createElement('div');
        slot.className = 'match-slot';
        slot.setAttribute('data-letter', letter);
        slot.innerHTML = `
            <span class="slot-label">${letter.toLowerCase()}</span>
            <div class="slot-drop-area">?</div>
        `;
        slotsContainer.appendChild(slot);
    });

    // 2. Buat huruf yang bisa di-drag
    const spawnPoints = [
        { left: 8, top: 48 }, { left: 24, top: 68 }, { left: 40, top: 52 },
        { left: 56, top: 72 }, { left: 72, top: 48 }, { left: 80, top: 68 }
    ];
    spawnPoints.sort(() => Math.random() - 0.5);

    let matchedCount = 0;

    letters.forEach((letter, idx) => {
        const el = document.createElement('div');
        el.className = 'draggable-letter';
        el.textContent = letter.toUpperCase();
        el.setAttribute('data-letter', letter);

        const pt = spawnPoints[idx % spawnPoints.length];
        el.style.left = `${pt.left}%`;
        el.style.top = `${pt.top}%`;
        el.style.animationDelay = `${idx * 0.4}s`;

        lettersContainer.appendChild(el);

        const slot = slotsContainer.querySelector(`.match-slot[data-letter="${letter}"]`);

        initPointerDrag(el, playground,
            (dragEl) => {
                const dragRect = dragEl.getBoundingClientRect();
                if (slot) {
                    const slotDropArea = slot.querySelector('.slot-drop-area');
                    const slotRect = slotDropArea.getBoundingClientRect();
                    if (isOverlapping(dragRect, slotRect, 0.15)) {
                        slot.classList.add('matched');
                    } else {
                        if (!slot.getAttribute('data-locked')) slot.classList.remove('matched');
                    }
                }
            },
            (dragEl) => {
                const dragRect = dragEl.getBoundingClientRect();
                if (!slot) return;

                const slotDropArea = slot.querySelector('.slot-drop-area');
                const slotRect = slotDropArea.getBoundingClientRect();

                if (isOverlapping(dragRect, slotRect, 0.2)) {
                    slot.setAttribute('data-locked', 'true');
                    slot.classList.add('matched');
                    slotDropArea.textContent = letter.toUpperCase();
                    dragEl.remove();
                    playSuccessSFX();
                    matchedCount++;

                    if (matchedCount === letters.length) {
                        setTimeout(() => {
                            letters.forEach(item => {
                                if (!gameState.masteredLetters.includes(item)) {
                                    gameState.masteredLetters.push(item);
                                }
                            });

                            const theme = LEVEL_THEMES[range];
                            if (theme) {
                                gameState.xp += theme.xp;
                                gameState.coins += theme.coins;
                                showNotification("Selamat! Misi selesai! Hadiah XP dan koin disimpan."); // MP3: 0018
                            } else {
                                gameState.xp += 20;
                                gameState.coins += 5;
                                showNotification("Kamu berhasil!"); // MP3: 0014
                            }

                            // Set status fase drag-match selesai untuk tingkat ini
                            if (!gameState.phaseStatus) gameState.phaseStatus = {};
                            if (!gameState.phaseStatus[range]) gameState.phaseStatus[range] = {};
                            gameState.phaseStatus[range]['drag-match'] = true;

                            saveGameState();
                            spawnConfetti();

                            const mascot = document.getElementById('game-mascot-dino');
                            if (mascot) {
                                mascot.classList.add('jump');
                                setTimeout(() => mascot.classList.remove('jump'), 600);
                            }

                            setTimeout(() => {
                                changeScreen('map');
                                setTimeout(() => {
                                    openMissionPreview(range);
                                }, 500);
                            }, 1500);
                        }, 500);
                    }
                } else {
                    slot.classList.remove('matched');
                    playErrorSFX();
                    bounceBack(dragEl, pt.left, pt.top);
                    setTimeout(() => {
                        dragEl.style.animation = 'hidden-letter-float 3s ease-in-out infinite';
                        dragEl.style.animationDelay = `${idx * 0.4}s`;
                    }, 400);
                }
            }
        );
    });
}
