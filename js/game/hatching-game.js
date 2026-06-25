/* ============================================================
 * js/game/hatching-game.js
 * Logika Mini Game Kelulusan Jilid 1 — Mesin Penetas Telur Dino
 * ============================================================ */

let hatchingGameTargetLetters = [];
let hatchingGameCurrentIndex = 0;
let hatchingGameEnergy = 0;
let hatchingGameCurrentLetter = '';
let hatchingMascotTimeout = null;

// --- MEMULAI MINI GAME PENETASAN ---
function startHatchingGame() {
    const modal = document.getElementById('hatching-modal');
    const gameScreen = document.getElementById('hatching-game-screen');
    const certScreen = document.getElementById('hatching-certificate-screen');

    if (!modal || !gameScreen || !certScreen) return;

    // Reset view screens
    gameScreen.classList.remove('hidden');
    certScreen.classList.add('hidden');
    modal.classList.remove('hidden');

    // Reset visual area animasi telur
    const animArea = document.querySelector('.hatching-animation-area');
    if (animArea) {
        animArea.classList.remove('hatched');
    }
    const animDino = document.getElementById('anim-dino');
    if (animDino) {
        animDino.classList.add('hidden');
        animDino.innerHTML = '';
    }
    const egg = document.getElementById('anim-egg');
    if (egg) {
        egg.className = 'hatching-egg-graphic';
        egg.style.opacity = '1';
    }

    // Reset game state
    hatchingGameEnergy = 0;
    hatchingGameCurrentIndex = 0;
    
    // Siapkan 10 huruf acak unik dari A-Z
    hatchingGameTargetLetters = _generateRandomHatchingLetters(10);
    
    // Render progress bar awal
    _setHatchingEnergyBar(0);

    // Render maskot Dino awal: waving (memakai aksesoris gabungan)
    updateHatchingMascot('waving');

    // Render visual telur utuh
    updateEggHatchingVisual(0);

    // Load kuis pertama
    loadHatchingQuestion();

    // Dialog TTS Pembuka
    playSuccessSFX();
    setTimeout(() => {
        playOfflineTTS("Selamat! Ayo lafalkan huruf untuk mengisi energi mesin penetas telur emas!");
    }, 500);
}

// --- GENERATE 10 HURUF ACAK UNIK A-Z ---
function _generateRandomHatchingLetters(count) {
    const alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// --- RENDER PERTANYAAN KUIS ---
function loadHatchingQuestion() {
    const letter = hatchingGameTargetLetters[hatchingGameCurrentIndex];
    hatchingGameCurrentLetter = letter;

    // Update huruf target di DOM
    const targetDisplay = document.getElementById('hatching-target-display');
    if (targetDisplay) {
        targetDisplay.textContent = letter.toLowerCase() + letter.toUpperCase();
    }

    // Bangkitkan pilihan: 1 benar + 3 salah
    const choices = [letter];
    const alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    
    while (choices.length < 4) {
        const randLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        if (!choices.includes(randLetter)) {
            choices.push(randLetter);
        }
    }

    // Acak posisi pilihan jawaban
    choices.sort(() => Math.random() - 0.5);

    // Render pilihan ke grid tombol
    const grid = document.getElementById('hatching-choices-grid');
    if (grid) {
        grid.innerHTML = '';
        choices.forEach(ch => {
            const btn = document.createElement('button');
            btn.className = 'hatching-choice-btn';
            btn.textContent = ch.toLowerCase();
            btn.addEventListener('click', (e) => checkHatchingAnswer(ch, btn));
            grid.appendChild(btn);
        });
    }

    // Mainkan audio pengenalan huruf target
    setTimeout(() => {
        playLetterSound(letter);
    }, 400);
}

// --- TOMBOL RE-PLAY SUARA TARGET ---
document.addEventListener('DOMContentLoaded', () => {
    const soundBtn = document.getElementById('btn-sound-hatching');
    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            if (hatchingGameCurrentLetter) {
                playLetterSound(hatchingGameCurrentLetter);
            }
        });
    }
});

// --- PERIKSA JAWABAN KUIS ---
function checkHatchingAnswer(selectedLetter, buttonEl) {
    // Hindari double click saat memproses transisi
    const allButtons = document.querySelectorAll('.hatching-choice-btn');
    allButtons.forEach(btn => btn.disabled = true);

    if (selectedLetter === hatchingGameCurrentLetter) {
        // --- JAWABAN BENAR ---
        buttonEl.classList.add('correct');
        hatchingGameEnergy += 10;
        
        // Update Progress Bar
        _setHatchingEnergyBar(hatchingGameEnergy);

        // Update Visual Retakan Telur
        updateEggHatchingVisual(hatchingGameEnergy);

        // Reaksi Dino Melompat Senang
        updateHatchingMascot('merayakan');
        const mascotEl = document.getElementById('hatching-mascot');
        if (mascotEl) {
            mascotEl.classList.add('jump');
            setTimeout(() => mascotEl.classList.remove('jump'), 600);
        }

        // Putar suara feedback positif acak
        const successFeedback = [
            "Hebat!", 
            "Bagus sekali!", 
            "Kamu berhasil!"
        ];
        const randSuccess = successFeedback[Math.floor(Math.random() * successFeedback.length)];
        playSuccessSFX();
        setTimeout(() => {
            playOfflineTTS(randSuccess);
        }, 300);

        // Lanjut ke soal berikutnya setelah jeda 1.8 detik
        setTimeout(() => {
            hatchingGameCurrentIndex++;
            if (hatchingGameEnergy >= 100 || hatchingGameCurrentIndex >= hatchingGameTargetLetters.length) {
                completeHatchingGame();
            } else {
                loadHatchingQuestion();
            }
        }, 1800);

    } else {
        // --- JAWABAN SALAH ---
        buttonEl.classList.add('wrong');

        // Reaksi Dino Bingung/Berpikir
        updateHatchingMascot('thinking');
        const mascotEl = document.getElementById('hatching-mascot');
        if (mascotEl) {
            mascotEl.classList.add('dino-confused');
            if (hatchingMascotTimeout) clearTimeout(hatchingMascotTimeout);
            hatchingMascotTimeout = setTimeout(() => {
                mascotEl.classList.remove('dino-confused');
                updateHatchingMascot('waving');
            }, 1200);
        }

        // Putar suara feedback salah acak
        const errorFeedback = [
            "Coba lagi ya.", 
            "Hampir benar.", 
            "Kamu pasti bisa."
        ];
        const randError = errorFeedback[Math.floor(Math.random() * errorFeedback.length)];
        playErrorSFX();
        setTimeout(() => {
            playOfflineTTS(randError);
        }, 300);

        // Aktifkan kembali tombol-tombol setelah 1.2 detik agar anak bisa mencoba lagi
        setTimeout(() => {
            buttonEl.classList.remove('wrong');
            allButtons.forEach(btn => {
                if (!btn.classList.contains('correct')) btn.disabled = false;
            });
        }, 1200);
    }
}

// --- UPDATE PROGRESS BAR ENERGI ---
function _setHatchingEnergyBar(energy) {
    const fillEl = document.getElementById('hatching-energy-bar-fill');
    const textEl = document.getElementById('hatching-energy-text');
    if (fillEl) fillEl.style.width = `${energy}%`;
    if (textEl) textEl.textContent = `${energy}%`;
}

// --- UPDATE REAKSI DINO MASKOT DI MESIN PENETAS ---
function updateHatchingMascot(poseName) {
    const mascot = document.getElementById('hatching-mascot');
    if (mascot) {
        const accessory = (window.gameState && window.gameState.activeAccessory) || '';
        mascot.innerHTML = getDinoSvg(accessory, poseName);
    }
}

// --- UPDATE TAHAPAN VISUAL TELUR DINO ---
function updateEggHatchingVisual(energy) {
    const egg = document.getElementById('anim-egg');
    const animArea = document.querySelector('.hatching-animation-area');
    if (!egg || !animArea) return;

    // Reset kelas animasi
    egg.className = 'hatching-egg-graphic';

    if (energy < 25) {
        // 0% = Utuh
        egg.src = 'image/dino/telur-utuh.png';
    } else if (energy < 50) {
        // 25% = Retak kecil
        egg.src = 'image/dino/telur-retak.png';
    } else if (energy < 75) {
        // 50% = Retak sedang (bergoyang pelan)
        egg.src = 'image/dino/telur-retak.png';
        egg.classList.add('wiggling');
    } else if (energy < 100) {
        // 75% = Cahaya keluar (bergoyang + cahaya pulsa)
        egg.src = 'image/dino/telur-retak.png';
        egg.classList.add('wiggling', 'egg-glow-pulse');
    } else {
        // 100% = Menetas
        egg.src = 'image/dino/telur-pecah.png';
    }
}

// --- SELESAIKAN GAME & PENETASAN AKHIR ---
function completeHatchingGame() {
    const animArea = document.querySelector('.hatching-animation-area');
    const animDino = document.getElementById('anim-dino');
    const egg = document.getElementById('anim-egg');

    if (!animArea || !animDino || !egg) return;

    // Check free random accessory reward
    const lockedAccessories = SHOP_ITEMS.filter(acc => !gameState.unlockedAccessories.includes(acc.id));
    let freeAccessoryMsg = '';
    let chosen = null;
    if (lockedAccessories.length > 0) {
        const randomIndex = Math.floor(Math.random() * lockedAccessories.length);
        chosen = lockedAccessories[randomIndex];
        gameState.unlockedAccessories.push(chosen.id);
        gameState.activeAccessory = chosen.id; // Auto-equip the new accessory!
        freeAccessoryMsg = ` dan aksesoris gratis: ${chosen.name}!`;
    }

    // Picu efek pecahnya telur
    egg.src = 'image/dino/telur-pecah.png';
    animDino.innerHTML = getDinoSvg(gameState.activeAccessory, 'merayakan');
    animDino.classList.remove('hidden');
    animArea.classList.add('hatched');
    
    playBeep(880, 0.4, "triangle");
    spawnConfetti('global-confetti');

    // Simpan status penetasan
    gameState.dinoState = 'baby';
    gameState.dinoName = 'Bayi Triceratops';
    
    // Berikan Hadiah Lencana Kelulusan, +50 XP (Bintang bonus), & +50 Koin bonus
    gameState.coins = (gameState.coins || 0) + 50;
    gameState.xp = (gameState.xp || 0) + 50;
    
    if (!gameState.parentBadges) gameState.parentBadges = [];
    if (!gameState.parentBadges.includes('graduation-jilid-1')) {
        gameState.parentBadges.push('graduation-jilid-1');
    }

    saveGameState();

    // Update text sertifikat
    const rewardTextEl = document.getElementById('hatching-reward-text');
    if (rewardTextEl) {
        if (chosen) {
            rewardTextEl.innerHTML = `Lencana kelulusan, +50 Bintang, +50 Koin<br>&amp; Hadiah Aksesoris: ${chosen.emoji} ${chosen.name}!`;
        } else {
            rewardTextEl.innerHTML = `Lencana kelulusan, +50 Bintang, +50 Koin diperoleh!`;
        }
    }

    // Dialog Kelulusan TTS
    setTimeout(() => {
        playOfflineTTS("Hore! Selamat, telur Dino berhasil menetas! Kamu resmi lulus Jilid 1!" + freeAccessoryMsg);
    }, 1200);

    // Tampilkan layar Sertifikat Kelulusan setelah 3.2 detik agar anak puas melihat Dino lahir
    setTimeout(() => {
        const gameScreen = document.getElementById('hatching-game-screen');
        const certScreen = document.getElementById('hatching-certificate-screen');
        if (gameScreen && certScreen) {
            gameScreen.classList.add('hidden');
            certScreen.classList.remove('hidden');
            spawnConfetti('global-confetti');
        }
    }, 3200);
}
