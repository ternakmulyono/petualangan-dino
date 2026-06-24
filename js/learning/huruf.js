/* ============================================================
 * js/learning/huruf.js
 * Logika Pengenalan Huruf — Matching, Drag, Mission Preview
 * ============================================================ */

// --- UTILITY: DRAG AND DROP (POINTER EVENTS) ---
function initPointerDrag(element, parentElement, onDragMove, onDragEnd) {
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    element.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        element.setPointerCapture(e.pointerId);

        element.style.animation = 'none';
        element.style.transform = 'scale(1.15)';
        element.style.boxShadow = '0 8px 12px rgba(0,0,0,0.3)';

        startX = e.clientX;
        startY = e.clientY;

        const rect = element.getBoundingClientRect();
        const parentRect = parentElement.getBoundingClientRect();
        initialLeft = rect.left - parentRect.left;
        initialTop = rect.top - parentRect.top;

        const onPointerMove = (moveEv) => {
            const dx = moveEv.clientX - startX;
            const dy = moveEv.clientY - startY;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;

            const parentWidth = parentRect.width;
            const parentHeight = parentRect.height;
            newLeft = Math.max(0, Math.min(newLeft, parentWidth - rect.width));
            newTop = Math.max(0, Math.min(newTop, parentHeight - rect.height));

            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;

            if (onDragMove) onDragMove(element, newLeft, newTop);
        };

        const onPointerUp = (upEv) => {
            element.removeEventListener('pointermove', onPointerMove);
            element.removeEventListener('pointerup', onPointerUp);
            element.releasePointerCapture(upEv.pointerId);

            element.style.transform = '';
            element.style.boxShadow = '';

            if (onDragEnd) onDragEnd(element, initialLeft, initialTop);
        };

        element.addEventListener('pointermove', onPointerMove);
        element.addEventListener('pointerup', onPointerUp);
    });
}

// --- UTILITY: CEK TUMPANG TINDIH DUA ELEMEN ---
function isOverlapping(rectA, rectB, threshold = 0.2) {
    const overlapX = Math.max(0, Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left));
    const overlapY = Math.max(0, Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top));
    const overlapArea = overlapX * overlapY;
    const areaA = (rectA.right - rectA.left) * (rectA.bottom - rectA.top);
    return overlapArea / areaA >= threshold;
}

// --- MULAI LEVEL ---
function startLevel(range, mode) {
    gameState.currentLevelRange = range;
    gameState.currentGameMode = mode || 'letters';

    // Sembunyikan semua view
    document.getElementById('game-match-view').classList.add('hidden');
    document.getElementById('game-speak-view').classList.add('hidden');
    document.getElementById('game-read-view').classList.add('hidden');
    document.getElementById('game-picture-view').classList.add('hidden');
    document.getElementById('game-drag-match-view').classList.add('hidden');
    document.getElementById('game-write-view').classList.add('hidden');

    if (isPart2Range(range)) {
        // --- BAGIAN 2: LEMBAR MEMBACA MANDIRI ---
        document.getElementById('game-level-title').textContent = `Misi: Membaca ${range}`;

        const dotsContainer = document.getElementById('game-step-dots');
        dotsContainer.innerHTML = '';
        const dot = document.createElement('div');
        dot.className = 'step-dot active';
        dotsContainer.appendChild(dot);

        changeScreen('game');
        document.getElementById('game-read-view').classList.remove('hidden');

        const syllables = LEVEL_GROUPS[range].slice(0, 5);
        const words = LEVEL_GROUPS[range].slice(5);

        // Buat suku kata menjadi clickable-read-item
        document.getElementById('read-sheet-syllables').innerHTML = syllables.map(s => 
            `<span class="clickable-read-item syllable-item" data-text="${s}" style="cursor: pointer; padding: 4px 10px; border-radius: 8px; background: #FFF9C4; margin: 0 4px; display: inline-block; border: 2px solid #FFF59D; transition: all 0.2s; font-weight: bold; font-size: 16px;">${s}</span>`
        ).join(' ');

        const groupedRows = {};
        if (range.endsWith('-group')) {
            syllables.forEach((s, idx) => {
                groupedRows[s] = [words[idx * 2], words[idx * 2 + 1]];
            });
        } else {
            syllables.forEach(s => { groupedRows[s] = []; });
            words.forEach(w => {
                const prefix = syllables.find(s => w.startsWith(s));
                if (prefix) {
                    groupedRows[prefix].push(w);
                } else {
                    if (!groupedRows['misc']) groupedRows['misc'] = [];
                    groupedRows['misc'].push(w);
                }
            });
        }

        // Buat kata-kata kombinasi menjadi clickable-read-item
        let wordsHtml = '';
        Object.keys(groupedRows).forEach(s => {
            const rowWords = groupedRows[s];
            if (rowWords && rowWords.length > 0) {
                const formattedWordsHtml = rowWords.map(w => {
                    const cleanW = w.replace(/-/g, ' ');
                    return `<span class="clickable-read-item word-item" data-text="${w}" style="cursor: pointer; padding: 4px 8px; border-radius: 6px; background: #E8F5E9; border: 2px solid #C8E6C9; transition: all 0.2s; font-size: 15px; font-weight: 500;">${cleanW}</span>`;
                });
                wordsHtml += `<div class="read-row" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; justify-content: center;">${formattedWordsHtml.join('')}</div>`;
            }
        });
        document.getElementById('read-sheet-words').innerHTML = wordsHtml;

        // Inisialisasi event click untuk item latihan menulis
        setTimeout(() => {
            const items = document.querySelectorAll('.clickable-read-item');
            items.forEach(item => {
                item.onclick = () => {
                    const text = item.getAttribute('data-text');
                    if (typeof selectReadWriteItem === 'function') {
                        selectReadWriteItem(text);
                    }
                };
            });

            // Set up tombol reset & sound di area menulis
            const resetBtn = document.getElementById('btn-reset-read-write');
            if (resetBtn) {
                resetBtn.onclick = () => {
                    if (typeof currentReadWriteText === 'string' && typeof initReadWriteCanvas === 'function') {
                        initReadWriteCanvas(currentReadWriteText);
                    }
                };
            }

            const soundBtn = document.getElementById('btn-sound-read-write');
            if (soundBtn) {
                soundBtn.onclick = () => {
                    if (typeof currentReadWriteText === 'string') {
                        playLetterSound(currentReadWriteText);
                    }
                };
            }

            // Pilih suku kata pertama secara default saat masuk halaman (Beri jeda agar tidak tabrakan dengan suara instruksi)
            if (syllables.length > 0 && typeof selectReadWriteItem === 'function') {
                setTimeout(() => {
                    selectReadWriteItem(syllables[0]);
                }, 3000);
            }
        }, 100);

        gameState.recordedBlob = null;
        document.getElementById('playback-area-read').classList.add('hidden');
        document.getElementById('btn-submit-read').classList.add('hidden');
        document.getElementById('read-recording-status').textContent = "Tekan tombol mikrofon lalu rekam suaramu saat membaca.";

        const recordBtn = document.getElementById('btn-record-read');
        recordBtn.className = "mic-button";
        document.getElementById('icon-mic-read').classList.remove('hidden');
        document.getElementById('icon-stop-read').classList.add('hidden');

        // Mainkan petunjuk membaca: Ikuti garis untuk menulis huruf. (Atau setara MP3: 0007)
        setTimeout(() => {
            playLetterSound("Ikuti garis untuk menulis huruf.");
        }, 300);

        return;
    }

    // --- BAGIAN 1: MODE PASANGKAN HURUF ---
    if (gameState.currentGameMode === 'drag-match') {
        document.getElementById('game-level-title').textContent = `Misi Pasang: ${range}`;

        const dotsContainer = document.getElementById('game-step-dots');
        dotsContainer.innerHTML = '';
        const dot = document.createElement('div');
        dot.className = 'step-dot active';
        dotsContainer.appendChild(dot);

        changeScreen('game');
        document.getElementById('game-drag-match-view').classList.remove('hidden');
        loadDragMatchChallenge();
        // Berikan perintah suara untuk anak: Sentuh huruf yang diminta. (MP3: 0008)
        setTimeout(() => {
            playLetterSound("Sentuh huruf yang diminta.");
        }, 300);
        return;
    }

    // --- BAGIAN 1: MODE KATA GAMBAR ---
    if (gameState.currentGameMode === 'pictures') {
        document.getElementById('game-level-title').textContent = `Misi Gambar: ${range}`;

        const dotsContainer = document.getElementById('game-step-dots');
        dotsContainer.innerHTML = '';
        const dot = document.createElement('div');
        dot.className = 'step-dot active';
        dotsContainer.appendChild(dot);

        changeScreen('game');
        document.getElementById('game-picture-view').classList.remove('hidden');

        const letters = LEVEL_GROUPS[range];
        const container = document.getElementById('picture-sheet-container');
        container.innerHTML = '';

        const colors = ['#E91E63', '#FF9800', '#4CAF50', '#2196F3', '#9C27B0'];
        letters.forEach((l, idx) => {
            const data = PICTURE_WORDS[l] || { word: l, display: l, emoji: '🦖', text: l };
            const row = document.createElement('div');
            row.className = 'pic-row';
            row.innerHTML = `
                <div class="pic-letter-box" style="background-color: ${colors[idx % colors.length]};">${l}</div>
                <div class="pic-separator">:</div>
                <div class="pic-word">${data.display}</div>
                <div class="pic-emoji-box">${data.emoji}</div>
            `;
            container.appendChild(row);
        });

        gameState.recordedBlob = null;
        document.getElementById('playback-area-picture').classList.add('hidden');
        document.getElementById('btn-submit-picture').classList.add('hidden');
        document.getElementById('picture-recording-status').textContent = "Tekan tombol mikrofon lalu rekam suaramu saat membaca.";

        const recordBtn = document.getElementById('btn-record-picture');
        recordBtn.className = "mic-button";
        document.getElementById('icon-mic-picture').classList.remove('hidden');
        document.getElementById('icon-stop-picture').classList.add('hidden');

        // Berikan perintah suara untuk anak: Dengarkan lalu pilih jawabannya. (MP3: 0006)
        setTimeout(() => {
            playLetterSound("Dengarkan lalu pilih jawabannya.");
        }, 300);
        return;
    }

    // --- BAGIAN 1: MODE CARI HURUF (Matching) ---
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
    // Berikan perintah suara untuk anak: Pilih huruf yang benar. (MP3: 0005)
    setTimeout(() => {
        playLetterSound("Pilih huruf yang benar.");
    }, 300);
}

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
                        showNotification("Hebat!");
                        gameState.xp += 10;
                        saveGameState();

                        setTimeout(() => { transitionToSpeakPhase(); }, 1800);
                    } else {
                        playErrorSFX();
                        showNotification("Tarik huruf yang tepat ya! Kamu pasti bisa!"); // Kalimat ini sesuai di MP3 (0025_TARIK_HURUF_YANG_TEPAT_YA__KAMU_PASTI_BISA_.mp3)
                        dragEl.style.transition = 'left 0.4s ease, top 0.4s ease';
                        dragEl.style.left = `${pt.left}%`;
                        dragEl.style.top = `${pt.top}%`;
                        setTimeout(() => {
                            dragEl.style.transition = '';
                            dragEl.style.animation = `hidden-letter-float 3s ease-in-out infinite`;
                            dragEl.style.animationDelay = `${idx * 0.5}s`;
                        }, 400);
                    }
                } else {
                    dragEl.style.transition = 'left 0.4s ease, top 0.4s ease';
                    dragEl.style.left = `${pt.left}%`;
                    dragEl.style.top = `${pt.top}%`;
                    setTimeout(() => {
                        dragEl.style.transition = '';
                        dragEl.style.animation = `hidden-letter-float 3s ease-in-out infinite`;
                        dragEl.style.animationDelay = `${idx * 0.5}s`;
                    }, 400);
                }
            }
        );
    });

    // Beri jeda 3000ms agar instruksi "Pilih huruf yang benar" selesai diucapkan terlebih dahulu
    setTimeout(() => { playLetterSound(letter); }, 3000);
}

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
                            } else {
                                gameState.xp += 50;
                                gameState.coins += 10;
                            }
                            showNotification("Selamat! Misi selesai! Hadiah XP dan koin disimpan."); // Kalimat ini ada di MP3 (0018_SELAMAT__MISI_SELESAI__HADIAH_XP_DAN_KOIN_DISIMPAN_.mp3)

                            saveGameState();
                            spawnConfetti();

                            const mascot = document.getElementById('game-mascot-dino');
                            if (mascot) {
                                mascot.classList.add('jump');
                                setTimeout(() => mascot.classList.remove('jump'), 600);
                            }

                             setTimeout(() => { openTreasureChest(); }, 4500); // Naikkan dari 1500ms ke 4500ms agar audio 'Selamat! Misi selesai!' selesai diucapkan
                        }, 500);
                    }
                } else {
                    slot.classList.remove('matched');
                    playErrorSFX();
                    dragEl.style.transition = 'left 0.4s ease, top 0.4s ease';
                    dragEl.style.left = `${pt.left}%`;
                    dragEl.style.top = `${pt.top}%`;
                    setTimeout(() => {
                        dragEl.style.transition = '';
                        dragEl.style.animation = `hidden-letter-float 3s ease-in-out infinite`;
                        dragEl.style.animationDelay = `${idx * 0.4}s`;
                    }, 400);
                }
            }
        );
    });
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
        showNotification("Hebat!");
        gameState.xp += 10;
        saveGameState();

        setTimeout(() => { transitionToSpeakPhase(); }, 1800);
    } else {
        cardElement.classList.add('wrong');
        playErrorSFX();
        showNotification("Coba lagi ya."); // Kalimat ini ada di MP3 (0019_COBA_LAGI_YA_.mp3)
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
    document.getElementById('recording-status').textContent = "Tekan tombol mikrofon lalu tirukan suara hurufnya.";

    const recordBtn = document.getElementById('btn-record-mic');
    recordBtn.className = "mic-button";
    document.getElementById('icon-mic').classList.remove('hidden');
    document.getElementById('icon-stop').classList.add('hidden');

    setTimeout(() => { playLetterSound(gameState.currentTargetLetter); }, 2000); // Jeda dikurangi karena feedback "Hebat!" sekarang sangat singkat
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
        li2.textContent = `Membaca lancar 5 baris kata latihan`;
        targetsList.appendChild(li2);

        actionsArea.innerHTML = `
            <button id="btn-mission-cancel" class="btn-secondary" style="flex: 1; margin: 0; padding: 10px;">Batal</button>
            <button id="btn-mission-start" class="btn-primary" style="flex: 1; margin: 0; padding: 10px;">Mulai Misi!</button>
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
        li2.textContent = `Pasangkan huruf besar dengan huruf kecil yang tepat`;
        targetsList.appendChild(li2);

        const li3 = document.createElement('li');
        li3.textContent = `Baca nama gambar dengan kartu kata bergambar`;
        targetsList.appendChild(li3);

        actionsArea.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                <button id="btn-mission-letters" class="btn-primary" style="margin: 0; width: 100%; padding: 10px; background: var(--primary); border-color: var(--primary-dark); box-shadow: 0 4px 0 var(--primary-dark); font-size: 14px;">🔍 Cari & Tulis Huruf (CALIS)</button>
                <button id="btn-mission-drag-match" class="btn-primary" style="margin: 0; width: 100%; padding: 10px; background: #9C27B0; border-color: #7B1FA2; box-shadow: 0 4px 0 #7B1FA2; font-size: 14px;">🧩 Pasangkan Huruf (Besar-Kecil)</button>
                <button id="btn-mission-pictures" class="btn-primary" style="margin: 0; width: 100%; padding: 10px; background: var(--accent); border-color: var(--accent-dark); box-shadow: 0 4px 0 var(--accent-dark); font-size: 14px;">🖼️ Kata Gambar</button>
                <button id="btn-mission-cancel" class="btn-secondary" style="margin: 0; width: 100%; padding: 8px; font-size: 13px;">Batal</button>
            </div>
        `;

        document.getElementById('btn-mission-cancel').addEventListener('click', () => {
            document.getElementById('mission-modal').classList.add('hidden');
        });
        document.getElementById('btn-mission-letters').addEventListener('click', () => {
            document.getElementById('mission-modal').classList.add('hidden');
            startLevel(range, 'letters');
        });
        document.getElementById('btn-mission-drag-match').addEventListener('click', () => {
            document.getElementById('mission-modal').classList.add('hidden');
            startLevel(range, 'drag-match');
        });
        document.getElementById('btn-mission-pictures').addEventListener('click', () => {
            document.getElementById('mission-modal').classList.add('hidden');
            startLevel(range, 'pictures');
        });
    }

    document.getElementById('mission-modal').classList.remove('hidden');
}
