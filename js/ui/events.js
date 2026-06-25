/* ============================================================
 * js/ui/events.js
 * Semua Event Listener UI — dipecah per domain
 * ============================================================ */

// --- NAVIGASI UTAMA ---
function initNavEvents() {
    // Mainkan suara sambutan awal "Selamat datang di Hutan Huruf." (MP3: 0001) saat game dimuat pertama kali
    setTimeout(() => {
        playLetterSound("Selamat datang di Hutan Huruf.");
    }, 1000);

    document.getElementById('btn-start-adventure').addEventListener('click', () => {
        window.preventStopOnScreenChange = true;
        changeScreen('map');
        window.preventStopOnScreenChange = false;
        // Mainkan instruksi jilid 1: Dino kehilangan telur emasnya. Ayo bantu Dino menemukan petunjuk baru. (MP3: 0002 & 0003)
        setTimeout(() => {
            playLetterSound("Dino kehilangan telur emasnya.");
            setTimeout(() => {
                playLetterSound("Ayo bantu Dino menemukan petunjuk baru.");
            }, 3000);
        }, 800);
    });
    document.getElementById('btn-back-nest').addEventListener('click', () => {
        if (typeof stopLetterSound === 'function') stopLetterSound();
        changeScreen('nest');
    });

    document.getElementById('btn-next-map').addEventListener('click', () => {
        window.preventStopOnScreenChange = true;
        document.getElementById('map-page-1').classList.add('hidden');
        document.getElementById('map-page-2').classList.remove('hidden');
        document.getElementById('screen-map').scrollTop = 0;
        window.preventStopOnScreenChange = false;
        // Mainkan petunjuk jilid 2: Latihan hari ini selesai. Target harian berhasil dicapai. (Atau gunakan MP3 40 & 39)
        setTimeout(() => {
            playLetterSound("Latihan hari ini selesai.");
            setTimeout(() => {
                playLetterSound("Target harian berhasil dicapai.");
            }, 3000);
        }, 500);
    });

    document.getElementById('btn-prev-map').addEventListener('click', () => {
        document.getElementById('map-page-2').classList.add('hidden');
        document.getElementById('map-page-1').classList.remove('hidden');
        document.getElementById('screen-map').scrollTop = 0;
    });

    // Map Nodes
    document.querySelectorAll('.map-node').forEach(node => {
        node.addEventListener('click', () => {
            if (node.classList.contains('locked')) {
                showNotification('Area terkunci! Selesaikan misi sebelumnya.'); // MP3: 0035
                playErrorSFX();
                return;
            }
            openMissionPreview(node.getAttribute('data-range'));
        });
    });
}

// --- GAME EVENTS (suara, rekam, submit) ---
function initGameEvents() {
    // Suara huruf
    document.getElementById('btn-sound-trigger').addEventListener('click', () => {
        playLetterSound(gameState.currentTargetLetter);
        const btn = document.getElementById('btn-sound-trigger');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 100);
    });

    // Speak phase
    document.getElementById('btn-record-mic').addEventListener('click', toggleRecording);
    document.getElementById('btn-play-recorded').addEventListener('click', playRecordedAudio);
    document.getElementById('btn-submit-speak').addEventListener('click', submitSpeakPhase);

    // Write phase
    document.getElementById('btn-write-sound-trigger').addEventListener('click', () => {
        playLetterSound(gameState.currentTargetLetter);
        const btn = document.getElementById('btn-write-sound-trigger');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 100);
    });

    document.getElementById('btn-reset-write').addEventListener('click', () => {
        const canvas = document.getElementById('write-canvas');
        if (canvas && canvas.style.display !== 'none' && canvas.onReset) {
            canvas.onReset();
        } else {
            loadWriteChallenge();
        }
    });

    document.getElementById('btn-submit-write').addEventListener('click', completeWriteChallenge);

    // Read phase (Part 2)
    document.getElementById('btn-record-read').addEventListener('click', toggleRecording);
    document.getElementById('btn-play-read').addEventListener('click', playRecordedAudio);
    document.getElementById('btn-submit-read').addEventListener('click', submitReadPhase);

    // Hatching Game triggers
    document.getElementById('btn-trigger-hatching-game').addEventListener('click', () => {
        if (gameState.masteredLetters.length < LETTERS_TO_HATCH) {
            playErrorSFX();
            showNotification("Selesaikan seluruh materi Jilid 1 untuk membuka Mesin Penetas! 🔒");
        } else {
            startHatchingGame();
        }
    });

    document.getElementById('btn-read-trigger-hatching').addEventListener('click', () => {
        document.getElementById('btn-read-trigger-hatching').classList.add('hidden');
        startHatchingGame();
    });

    document.getElementById('btn-read-tts-helper').addEventListener('click', playReadTTSHelper);
    document.getElementById('btn-read-tts-stop').addEventListener('click', stopLetterSound);

    // Picture phase
    document.getElementById('btn-record-picture').addEventListener('click', toggleRecording);
    document.getElementById('btn-play-picture').addEventListener('click', playRecordedAudio);
    document.getElementById('btn-submit-picture').addEventListener('click', submitPicturePhase);
    document.getElementById('btn-picture-tts-helper').addEventListener('click', playPictureWordTTS);
    document.getElementById('btn-picture-tts-stop').addEventListener('click', stopLetterSound);

    // Treasure Chest
    const chestSvg = document.getElementById('chest-svg');
    if (chestSvg) chestSvg.addEventListener('click', unlockTreasureChest);

    const btnClaimChest = document.getElementById('btn-claim-chest');
    if (btnClaimChest) {
        btnClaimChest.addEventListener('click', () => {
            document.getElementById('chest-modal').classList.add('hidden');
            changeScreen('map');
        });
    }

    // Hatching
    document.getElementById('btn-close-hatching').addEventListener('click', () => {
        document.getElementById('hatching-modal').classList.add('hidden');
        changeScreen('nest');
        playSuccessSFX();
    });

    // Claim Gift (pending reward dari parent)
    document.getElementById('btn-claim-gift').addEventListener('click', () => {
        if (gameState.pendingRewards) {
            const { coins, badges } = gameState.pendingRewards;
            gameState.coins = (gameState.coins || 0) + coins;
            if (badges && badges.length > 0) {
                if (!gameState.parentBadges) gameState.parentBadges = [];
                badges.forEach(b => {
                    if (!gameState.parentBadges.includes(b)) gameState.parentBadges.push(b);
                });
            }
            gameState.pendingRewards = { coins: 0, badges: [] };
            saveGameState();
            updateUIElements();
            updateNestParentBadges();
        }
        document.getElementById('gift-modal').classList.add('hidden');
        playSuccessSFX();
    });
}

// --- SHOP EVENTS ---
function initShopEvents() {
    document.getElementById('btn-open-shop').addEventListener('click', openDinoShop);
    document.getElementById('btn-shop-close').addEventListener('click', closeDinoShop);

    const btnExchangeXp = document.getElementById('btn-exchange-xp');
    if (btnExchangeXp) {
        btnExchangeXp.addEventListener('click', () => {
            if (gameState.xp >= 100) {
                gameState.xp -= 100;
                gameState.coins = (gameState.coins || 0) + 10;
                saveGameState();
                document.getElementById('shop-coin-count').textContent = gameState.coins;
                if (document.getElementById('shop-xp-count')) {
                    document.getElementById('shop-xp-count').textContent = gameState.xp;
                }
                showNotification('Berhasil menukar seratus XP menjadi sepuluh koin!'); // MP3: 0038
                playSuccessSFX();
            } else {
                showNotification('XP tidak cukup! Butuh minimal seratus XP.'); // MP3: 0039
                playErrorSFX();
            }
        });
    }
}

// --- PARENT EVENTS ---
function initParentEvents() {
    // Parent Gate
    document.getElementById('btn-parent-gate').addEventListener('click', openParentGate);
    document.getElementById('btn-gate-cancel').addEventListener('click', closeParentGate);
    document.getElementById('btn-gate-submit').addEventListener('click', submitParentGate);
    document.getElementById('btn-close-parent').addEventListener('click', () => changeScreen('nest'));

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.remove('hidden');
            if (tabId === 'tab-audio') renderRecordingsList();
            else if (tabId === 'tab-parent-rewards') renderParentRewardsGrid();
        });
    });

    // Send bonus coins
    document.getElementById('btn-parent-send-coins').addEventListener('click', () => {
        const select = document.getElementById('parent-coins-select');
        const amount = parseInt(select.value, 10) || 0;
        if (!gameState.pendingRewards) gameState.pendingRewards = { coins: 0, badges: [] };
        gameState.pendingRewards.coins += amount;
        saveGameState();
        showNotification(`Bonus +${amount} Koin disiapkan untuk kejutan anak! 🎁`);
        playSuccessSFX();
    });

    // Certificate
    document.getElementById('btn-print-certificate').addEventListener('click', () => {
        document.getElementById('cert-dino-name').textContent = gameState.dinoName || 'Dino Hebat';
        document.getElementById('cert-date').textContent = getIndonesianDate();
        document.getElementById('certificate-modal').classList.remove('hidden');
    });

    document.getElementById('btn-cert-close').addEventListener('click', () => {
        document.getElementById('certificate-modal').classList.add('hidden');
    });

    document.getElementById('btn-cert-print-action').addEventListener('click', () => window.print());

    // Reset & Cheat
    document.getElementById('btn-reset-data').addEventListener('click', resetAllGameData);
    document.getElementById('btn-cheat-hatch').addEventListener('click', cheatHatchGame);
}
