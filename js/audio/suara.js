/* ============================================================
 * js/audio/suara.js
 * Perekaman Suara (Mikrofon) & Playback
 * ============================================================ */

// --- AMBIL ID ELEMEN KONTROL AUDIO SESUAI MODE AKTIF ---
function getAudioControlIds() {
    const isPart2 = isPart2Range(gameState.currentLevelRange);
    const isPictureMode = !isPart2 && gameState.currentGameMode === 'pictures';

    if (isPart2) {
        return {
            recordBtn: document.getElementById('btn-record-read'),
            statusText: document.getElementById('read-recording-status'),
            micIconId: 'icon-mic-read',
            stopIconId: 'icon-stop-read',
            wave: document.getElementById('mic-wave-read'),
            playbackArea: document.getElementById('playback-area-read'),
            submitBtn: document.getElementById('btn-submit-read'),
            isLongRecording: true
        };
    } else if (isPictureMode) {
        return {
            recordBtn: document.getElementById('btn-record-picture'),
            statusText: document.getElementById('picture-recording-status'),
            micIconId: 'icon-mic-picture',
            stopIconId: 'icon-stop-picture',
            wave: document.getElementById('mic-wave-picture'),
            playbackArea: document.getElementById('playback-area-picture'),
            submitBtn: document.getElementById('btn-submit-picture'),
            isLongRecording: true
        };
    } else {
        return {
            recordBtn: document.getElementById('btn-record-mic'),
            statusText: document.getElementById('recording-status'),
            micIconId: 'icon-mic',
            stopIconId: 'icon-stop',
            wave: document.getElementById('mic-wave'),
            playbackArea: document.getElementById('playback-area'),
            submitBtn: document.getElementById('btn-submit-speak'),
            isLongRecording: false
        };
    }
}

// --- TOGGLE RECORDING (START / STOP) ---
async function toggleRecording() {
    const ctrl = getAudioControlIds();

    if (!gameState.isRecording) {
        // Start Recording
        gameState.audioChunks = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            let options = { mimeType: 'audio/webm' };
            if (!MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/aac' };
                if (!MediaRecorder.isTypeSupported('audio/aac')) {
                    options = {}; // browser default
                }
            }

            gameState.mediaRecorder = new MediaRecorder(stream, options);
            gameState.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) gameState.audioChunks.push(e.data);
            };

            gameState.mediaRecorder.onstop = () => {
                gameState.recordedBlob = new Blob(gameState.audioChunks, { type: gameState.mediaRecorder.mimeType || 'audio/webm' });
                showPlaybackControls();
            };

            gameState.mediaRecorder.start();
            gameState.isRecording = true;

            // UI Update
            ctrl.recordBtn.classList.add('recording');
            document.getElementById(ctrl.micIconId).classList.add('hidden');
            document.getElementById(ctrl.stopIconId).classList.remove('hidden');
            if (ctrl.wave) ctrl.wave.classList.add('active');

            if (ctrl.isLongRecording) {
                ctrl.statusText.textContent = "Sedang merekam suara membaca... Tekan tombol stop jika sudah selesai.";
            } else {
                ctrl.statusText.textContent = "Dino sedang mendengarkan... (Maks 6 detik)";
            }
            playBeep(440, 0.1);

            // Auto stop setelah 6 detik untuk Part 1
            if (!ctrl.isLongRecording) {
                gameState.recordingTimeout = setTimeout(() => {
                    if (gameState.isRecording) {
                        toggleRecording();
                        showNotification("Waktu rekam habis! Rekaman disimpan.");
                    }
                }, 6000);
            }

        } catch (err) {
            console.error("Mic block or not supported, fallback to simulation mode", err);
            // Simulation Mode
            gameState.isRecording = true;
            ctrl.recordBtn.classList.add('recording');
            document.getElementById(ctrl.micIconId).classList.add('hidden');
            document.getElementById(ctrl.stopIconId).classList.remove('hidden');
            ctrl.statusText.textContent = "Perekaman simulasi (Mikrofon terkendala)...";

            const simTime = ctrl.isLongRecording ? 8000 : 2500;
            gameState.recordingTimeout = setTimeout(() => {
                if (gameState.isRecording) {
                    toggleRecording();
                }
            }, simTime);
        }
    } else {
        // Stop Recording
        if (gameState.recordingTimeout) {
            clearTimeout(gameState.recordingTimeout);
            gameState.recordingTimeout = null;
        }

        gameState.isRecording = false;
        ctrl.recordBtn.classList.remove('recording');
        document.getElementById(ctrl.micIconId).classList.remove('hidden');
        document.getElementById(ctrl.stopIconId).classList.add('hidden');
        if (ctrl.wave) ctrl.wave.classList.remove('active');

        if (gameState.mediaRecorder && gameState.mediaRecorder.state !== 'inactive') {
            gameState.mediaRecorder.stop();
            gameState.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        } else {
            // Simulated Recording Stopped
            gameState.recordedBlob = new Blob([new Uint8Array(1000)], { type: 'audio/webm' });
            showPlaybackControls();
        }
        playBeep(554.37, 0.1);
    }
}

// --- TAMPILKAN KONTROL PLAYBACK SETELAH REKAM ---
function showPlaybackControls() {
    const ctrl = getAudioControlIds();
    ctrl.statusText.textContent = "Hebat! Rekaman selesai.";
    if (ctrl.playbackArea) ctrl.playbackArea.classList.remove('hidden');
    if (ctrl.submitBtn) ctrl.submitBtn.classList.remove('hidden');
}

// --- PUTAR REKAMAN AUDIO ---
function playRecordedAudio() {
    if (!gameState.recordedBlob) return;

    // Jika rekaman simulasi
    if (gameState.recordedBlob.size <= 1000) {
        showNotification("Memutar suara tiruan (simulasi)...");
        const isPart2 = isPart2Range(gameState.currentLevelRange);
        const isPictureMode = !isPart2 && gameState.currentGameMode === 'pictures';
        if (isPart2) {
            const words = LEVEL_GROUPS[gameState.currentLevelRange];
            if (words) playLetterSound(words.join(', '));
        } else if (isPictureMode) {
            playPictureWordTTS();
        } else {
            playLetterSound(gameState.currentTargetLetter);
        }
        return;
    }

    const audioUrl = URL.createObjectURL(gameState.recordedBlob);
    const audio = new Audio(audioUrl);
    audio.play();
}

// --- SUBMIT FASE SPEAK (LAFAL HURUF) ---
async function submitSpeakPhase() {
    if (gameState.recordedBlob) {
        await saveAudioBlob(gameState.currentTargetLetter, gameState.recordedBlob);
    }

    gameState.xp += 10;
    gameState.coins += 1;
    saveGameState();

    showNotification("Hebat!"); // Kalimat ini sudah 100% ada di file MP3 (0010_HEBAT_.mp3)
    playSuccessSFX();

    setTimeout(() => {
        loadWriteChallenge();
    }, 1500); // Jeda diturunkan karena durasi "Hebat!" singkat
}

// --- SUBMIT LEMBAR MEMBACA (PART 2) ---
async function submitReadPhase() {
    if (gameState.recordedBlob) {
        await saveAudioBlob(gameState.currentLevelRange, gameState.recordedBlob);
    }

    const letters = LEVEL_GROUPS[gameState.currentLevelRange];
    letters.forEach(item => {
        if (!gameState.masteredLetters.includes(item)) {
            gameState.masteredLetters.push(item);
        }
    });

    const theme = LEVEL_THEMES[gameState.currentLevelRange];
    if (theme) {
        gameState.xp += theme.xp;
        gameState.coins += theme.coins;
        showNotification("Selamat! Misi selesai! Hadiah XP dan koin disimpan."); // MP3: 0018_SELAMAT__MISI_SELESAI__HADIAH_XP_DAN_KOIN_DISIMPAN_.mp3
    } else {
        gameState.xp += 50;
        gameState.coins += 10;
        showNotification("Kamu berhasil!"); // MP3: 0014_KAMU_BERHASIL_.mp3
    }
    saveGameState();
    playSuccessSFX();

    if (gameState.dinoState === 'egg' && gameState.masteredLetters.length >= LETTERS_TO_HATCH) {
        document.getElementById('btn-submit-read').classList.add('hidden');
        const readTriggerBtn = document.getElementById('btn-read-trigger-hatching');
        if (readTriggerBtn) {
            readTriggerBtn.classList.remove('hidden');
            readTriggerBtn.style.display = 'block';
        }
        showNotification("Hebat! Jilid 1 Selesai! Klik tombol emas di bawah untuk mulai Mesin Penetas Dino! 🥚⚡");
        return;
    }

    setTimeout(() => { openTreasureChest(); }, 4500); // Naikkan dari 1500ms ke 4500ms agar audio 'Selamat! Misi selesai!' selesai diucapkan
}

// --- SUBMIT FASE KATA GAMBAR ---
async function submitPicturePhase() {
    const range = gameState.currentLevelRange;
    if (gameState.recordedBlob) {
        await saveAudioBlob(`${range}_pictures`, gameState.recordedBlob);
    }

    const letters = LEVEL_GROUPS[range];
    letters.forEach(item => {
        if (!gameState.masteredLetters.includes(item)) {
            gameState.masteredLetters.push(item);
        }
    });

    const theme = LEVEL_THEMES[range];
    if (theme) {
        gameState.xp += theme.xp;
        gameState.coins += theme.coins;
        showNotification("Selamat! Misi selesai! Hadiah XP dan koin disimpan."); // MP3: 0018_SELAMAT__MISI_SELESAI__HADIAH_XP_DAN_KOIN_DISIMPAN_.mp3
    } else {
        gameState.xp += 50;
        gameState.coins += 10;
        showNotification("Kamu berhasil!"); // MP3: 0014_KAMU_BERHASIL_.mp3
    }

    // Set status fase pictures selesai untuk tingkat ini
    if (!gameState.phaseStatus) gameState.phaseStatus = {};
    if (!gameState.phaseStatus[range]) gameState.phaseStatus[range] = {};
    gameState.phaseStatus[range].pictures = true;

    saveGameState();
    playSuccessSFX();

    if (gameState.dinoState === 'egg' && gameState.masteredLetters.length >= LETTERS_TO_HATCH) {
        triggerEggHatching();
        return;
    }

    setTimeout(() => { openTreasureChest(); }, 4500); // Naikkan dari 1500ms ke 4500ms agar audio 'Selamat! Misi selesai!' selesai diucapkan
}

// --- RENDER DAFTAR REKAMAN DI DASHBOARD PARENT ---
async function renderRecordingsList() {
    const container = document.getElementById('recordings-list-container');
    container.innerHTML = '';

    const list = await getAudioRecordings();

    if (list.length === 0) {
        container.innerHTML = `<p class="no-recordings">Belum ada rekaman suara tersimpan. Mulai misi membaca dulu!</p>`;
        return;
    }

    // Sort: terbaru dulu
    list.sort((a, b) => b.timestamp - a.timestamp);

    list.forEach(item => {
        const row = document.createElement('div');
        row.className = 'recording-item';

        const isPart2 = isPart2Range(item.letter);
        const displayTitle = isPart2
            ? `Lembar Membaca "${item.letter}"`
            : `Huruf "${item.letter.toUpperCase()}" (${PHONETICS[item.letter.toUpperCase()] || item.letter})`;

        row.innerHTML = `
            <div class="rec-info">
                <span class="rec-title">Materi: ${displayTitle}</span>
                <span class="rec-date">${item.dateString}</span>
            </div>
            <button class="btn-secondary play-btn">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M8 5v14l11-7z"/>
                </svg>
                <span>Putar</span>
            </button>
        `;

        row.querySelector('.play-btn').addEventListener('click', () => {
            if (item.blob.size <= 1000) {
                showNotification(`Memutar simulasi rekaman "${item.letter}"...`);
                if (isPart2) {
                    const words = LEVEL_GROUPS[item.letter];
                    if (words) playLetterSound(words.join(', '));
                } else {
                    playLetterSound(item.letter);
                }
                return;
            }
            const audioUrl = URL.createObjectURL(item.blob);
            const audio = new Audio(audioUrl);
            audio.play();
        });

        container.appendChild(row);
    });
}
