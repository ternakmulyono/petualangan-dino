/* ============================================================
 * js/audio/tts.js
 * Text-to-Speech — suara huruf online (Google TTS) & offline
 * ============================================================ */

// --- WEB AUDIO CONTEXT ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// --- METADATA SUARA ASLI (RECORDED AUDIO) ---
let audioMetadata = {};
let currentTTSAudio = null;
let currentTTSLoop = false;
let isTTSPlaying = false;

window.isAudioMetadataLoaded = false;

async function loadAudioMetadata() {
    try {
        // 1. Load letter audio metadata
        const response = await fetch('metadata.json');
        if (response.ok) {
            const data = await response.json();
            data.forEach(item => {
                if (item.text && item.filename) {
                    const normalizedText = item.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim().toUpperCase();
                    audioMetadata[normalizedText] = item.filename;
                }
            });
        }
        
        // 2. Load game narration TTS audio metadata
        const responseTts = await fetch('audio/tts_metadata.json');
        if (responseTts.ok) {
            const dataTts = await responseTts.json();
            dataTts.forEach(item => {
                if (item.text && item.filename) {
                    const normalizedText = item.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim().toUpperCase();
                    audioMetadata[normalizedText] = item.filename;
                }
            });
        }
        console.log("Audio and TTS metadata loaded successfully:", audioMetadata);
        window.isAudioMetadataLoaded = true;
    } catch (e) {
        console.warn("Failed to load metadata json, playing via TTS default fallback", e);
        window.isAudioMetadataLoaded = true;
    }
}

// Panggil loading metadata saat inisialisasi
loadAudioMetadata();

// Global flag to prevent screen change from cutting off long narrations
window.preventStopOnScreenChange = false;

// --- GLOBAL AUDIO ELEMENT (UNLOCKED FOR MOBILE BROWSER AUTOPLAY) ---
if (!window.globalAudioElement) {
    window.globalAudioElement = new Audio();
}

// --- GLOBAL DEBUG STATE FOR AUDIO AUDIT ---
const debugState = {
    audioUrl: "N/A",
    audioFormat: "N/A",
    audioCtxState: "suspended",
    playbackStatus: "idle",
    errorMessage: "None"
};

// Update contents of the debug panel
function updateDebugPanel() {
    debugState.audioCtxState = audioCtx ? audioCtx.state : "N/A";
    const panel = document.getElementById('audio-debug-panel');
    if (panel) {
        panel.innerHTML = `
            <div style="font-weight:bold;margin-bottom:8px;border-bottom:1px solid #444;padding-bottom:4px;color:#ff9800;">Audio Debugger</div>
            <div style="margin-bottom:4px;"><strong>URL:</strong> <span style="word-break:break-all;color:#4caf50;">${debugState.audioUrl}</span></div>
            <div style="margin-bottom:4px;"><strong>Format:</strong> <span style="color:#2196f3;">${debugState.audioFormat}</span></div>
            <div style="margin-bottom:4px;"><strong>Ctx State:</strong> <span style="color:#e91e63;">${debugState.audioCtxState}</span></div>
            <div style="margin-bottom:4px;"><strong>Playback:</strong> <span style="color:#ffeb3b;">${debugState.playbackStatus}</span></div>
            <div><strong>Error:</strong> <span style="color:#f44336;word-break:break-all;">${debugState.errorMessage}</span></div>
        `;
    }
}

// Inject floating glassmorphic debug panel
function injectDebugPanel() {
    if (document.getElementById('audio-debug-panel-container')) return;

    const container = document.createElement('div');
    container.id = 'audio-debug-panel-container';
    container.style.position = 'fixed';
    container.style.bottom = '15px';
    container.style.left = '15px';
    container.style.zIndex = '99999';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '11px';

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = '🔊 Audio Debug';
    toggleBtn.style.padding = '6px 12px';
    toggleBtn.style.background = 'rgba(0,0,0,0.85)';
    toggleBtn.style.color = '#fff';
    toggleBtn.style.border = '1px solid #444';
    toggleBtn.style.borderRadius = '20px';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';

    const panel = document.createElement('div');
    panel.id = 'audio-debug-panel';
    panel.style.display = 'none';
    panel.style.marginTop = '8px';
    panel.style.padding = '12px';
    panel.style.background = 'rgba(0, 0, 0, 0.9)';
    panel.style.color = '#fff';
    panel.style.border = '1px solid #333';
    panel.style.borderRadius = '8px';
    panel.style.width = '240px';
    panel.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        unlockAudio(); // Pemicu unlock langsung jika debug diklik pertama kali
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            updateDebugPanel();
        } else {
            panel.style.display = 'none';
        }
    });

    container.appendChild(toggleBtn);
    container.appendChild(panel);
    document.body.appendChild(container);
}

// Injeksi otomatis panel debug (dinonaktifkan agar tidak tampil di aplikasi produksi, hapus komentar untuk mengaktifkan kembali)
// if (document.body) {
//     injectDebugPanel();
// } else {
//     window.addEventListener('DOMContentLoaded', injectDebugPanel);
// }

// Status Unlock Audio
let isAudioUnlocked = false;

// Fungsi untuk membuka kunci Audio & AudioContext (hanya diizinkan di event click/touchend)
function unlockAudio() {
    if (isAudioUnlocked) return;

    // 1. Aktifkan AudioContext jika tersuspensi
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            console.log("AudioContext berhasil diaktifkan.");
            debugState.audioCtxState = audioCtx.state;
            updateDebugPanel();
        }).catch(err => {
            console.warn("Gagal mengaktifkan AudioContext:", err);
            debugState.errorMessage = "Ctx resume err: " + err.message;
            updateDebugPanel();
        });
    }

    // 2. Mainkan suara hening di globalAudioElement untuk membukanya
    if (window.globalAudioElement) {
        const silentWav = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        const oldSrc = window.globalAudioElement.src;
        window.globalAudioElement.src = silentWav;
        window.globalAudioElement.play()
            .then(() => {
                console.log("Global Audio Element berhasil dibuka kunci.");
                window.globalAudioElement.src = oldSrc || "";
                isAudioUnlocked = true;
                debugState.playbackStatus = "Unlocked successfully";
                debugState.errorMessage = "None";
                updateDebugPanel();

                // Mulai mainkan antrean yang tertunda setelah berhasil unlock
                if (!isQueueProcessing && audioQueue.length > 0) {
                    processNextInQueue();
                }
            })
            .catch(err => {
                console.warn("Gagal membuka kunci global audio:", err);
                isAudioUnlocked = false; // Izinkan coba lagi pada ketukan berikutnya jika gagal
                debugState.errorMessage = "Audio unlock err: " + err.message;
                updateDebugPanel();
            });
    }
}

// Dengarkan event interaksi user asli (touchend dan click) untuk membuka kunci
document.addEventListener('click', unlockAudio);
document.addEventListener('touchend', unlockAudio);


// --- ANTRIAN AUDIO (SEQUENTIAL PLAYBACK QUEUE) ---
let audioQueue = [];
let isQueueProcessing = false;
let currentSafetyTimer = null; // Menyimpan id timer pengaman antrean

// --- HENTIKAN SUARA / TTS YANG SEDANG BERJALAN & KOSONGKAN ANTRIAN ---
function stopLetterSound() {
    if (window.preventStopOnScreenChange) {
        return; 
    }
    
    // Clear timer pengaman
    if (currentSafetyTimer) {
        clearTimeout(currentSafetyTimer);
        currentSafetyTimer = null;
    }

    audioQueue = [];
    isQueueProcessing = false;
    isTTSPlaying = false;
    currentTTSLoop = false;

    if (currentTTSAudio) {
        currentTTSAudio.pause();
        currentTTSAudio.src = "";
        currentTTSAudio = null;
        debugState.playbackStatus = "stopped";
        updateDebugPanel();
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    const stopBtn1 = document.getElementById('btn-picture-tts-stop');
    if (stopBtn1) stopBtn1.classList.add('hidden');

    const stopBtn2 = document.getElementById('btn-read-tts-stop');
    if (stopBtn2) stopBtn2.classList.add('hidden');
}

// --- MAINKAN SUARA HURUF / NARASI (ANTREAN / QUEUED PLAYBACK) ---
function playLetterSound(letter, loop = false) {
    audioQueue.push({ letter, loop });
    
    // Hanya jalankan antrean jika browser sudah pernah diinteraksi / diunlock
    if (isAudioUnlocked && !isQueueProcessing) {
        processNextInQueue();
    } else if (!isAudioUnlocked) {
        console.log("Audio tertunda menunggu interaksi user pertama:", letter);
        debugState.playbackStatus = `Queued (Pending Unlock): ${audioQueue.length} items`;
        updateDebugPanel();
    }
}

// --- PROSES ANTRIAN AUDIO BERIKUTNYA ---
function processNextInQueue() {
    if (!window.isAudioMetadataLoaded) {
        console.log("Audio metadata pending load. Delaying queue process 100ms...");
        setTimeout(processNextInQueue, 100);
        return;
    }

    if (audioQueue.length === 0) {
        isQueueProcessing = false;
        isTTSPlaying = false;
        return;
    }

    isQueueProcessing = true;
    isTTSPlaying = true;
    
    const currentItem = audioQueue[0];
    const letter = currentItem.letter;
    const loop = currentItem.loop;

    const cleanLetter = letter.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim().toUpperCase();
    currentTTSLoop = loop;

    const pictureView = document.getElementById('game-picture-view');
    const readView = document.getElementById('game-read-view');

    if (pictureView && !pictureView.classList.contains('hidden')) {
        const stopBtn1 = document.getElementById('btn-picture-tts-stop');
        if (stopBtn1) stopBtn1.classList.remove('hidden');
    }
    if (readView && !readView.classList.contains('hidden')) {
        const stopBtn2 = document.getElementById('btn-read-tts-stop');
        if (stopBtn2) stopBtn2.classList.remove('hidden');
    }


    // Bersihkan timer pengaman sebelumnya jika masih aktif
    if (currentSafetyTimer) {
        clearTimeout(currentSafetyTimer);
        currentSafetyTimer = null;
    }

    const onAudioEnded = () => {
        if (currentSafetyTimer) {
            clearTimeout(currentSafetyTimer);
            currentSafetyTimer = null;
        }
        if (!loop) {
            audioQueue.shift(); 
            processNextInQueue(); 
        }
    };

    // Buat timer pengaman baru (12 detik) agar antrean tidak tersangkut selamanya jika browser gagal memicu event ended
    if (!loop) {
        currentSafetyTimer = setTimeout(() => {
            console.warn("Timer pengaman antrean terpicu untuk:", letter);
            debugState.errorMessage = `Safety timeout: ${letter}`;
            updateDebugPanel();
            onAudioEnded();
        }, 12000);
    }

    // 1. Cek jika ada suara asli (Recorded Voice) di metadata
    if (audioMetadata[cleanLetter]) {
        const url = `audio/${audioMetadata[cleanLetter]}`;
        const audio = window.globalAudioElement;
        
        audio.pause();
        audio.src = url;
        audio.loop = loop;
        currentTTSAudio = audio;

        // Gunakan properti onended agar listener sebelumnya otomatis terhapus
        audio.onended = onAudioEnded;
        audio.onerror = (err) => {
            console.warn("Gagal memutar audio kustom, beralih ke Fallback TTS", err);
            debugState.errorMessage = "Custom play error, fallback triggered";
            updateDebugPanel();
            playLetterSoundFallbackWithCallback(letter, loop, onAudioEnded);
        };

        debugState.audioUrl = url;
        const ext = url.split('.').pop().split('?')[0];
        debugState.audioFormat = `${ext.toUpperCase()} (Custom)`;
        debugState.playbackStatus = "playing (custom)";
        debugState.errorMessage = "None";
        updateDebugPanel();

        audio.play().catch(e => {
            console.warn("Gagal memutar audio kustom (Promise rejected), beralih ke Fallback TTS", e);
            debugState.errorMessage = `Custom play promise err: ${e.message}`;
            updateDebugPanel();
            playLetterSoundFallbackWithCallback(letter, loop, onAudioEnded);
        });
        return;
    }

    playLetterSoundFallbackWithCallback(letter, loop, onAudioEnded);
}

// --- FALLBACK TTS DENGAN CALLBACK ---
function playLetterSoundFallbackWithCallback(letter, loop, callback) {
    const cleanLetter = letter.replace(/-/g, '');
    const text = PHONETICS[cleanLetter.toUpperCase()] || cleanLetter;

    if (navigator.onLine) {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=gtx&q=${encodeURIComponent(text)}`;
        const audio = window.globalAudioElement;
        
        audio.pause();
        audio.src = url;
        audio.loop = loop;
        currentTTSAudio = audio;

        let fallbackTriggered = false;
        const triggerFallback = (errEvent) => {
            if (!fallbackTriggered) {
                fallbackTriggered = true;
                debugState.errorMessage = "Google TTS fail, switching offline";
                updateDebugPanel();
                playOfflineTTSWithCallback(cleanLetter, loop, callback);
            }
        };

        audio.onerror = triggerFallback;
        audio.onended = () => {
            if (!loop) {
                currentTTSAudio = null;
                debugState.playbackStatus = "ended (Google TTS)";
                updateDebugPanel();
                callback();
            }
        };

        debugState.audioUrl = url;
        debugState.audioFormat = "Google TTS (MP3)";
        debugState.playbackStatus = "playing (Google TTS)";
        updateDebugPanel();

        audio.play().catch(e => {
            console.log("Online Audio failed, falling back", e);
            triggerFallback(e);
        });
    } else {
        playOfflineTTSWithCallback(cleanLetter, loop, callback);
    }
}

// --- TTS OFFLINE DENGAN CALLBACK ---
function playOfflineTTSWithCallback(letter, loop, callback) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const cleanLetter = letter.replace(/-/g, '');
        const phonetics = PHONETICS[cleanLetter.toUpperCase()] || cleanLetter;
        const utterance = new SpeechSynthesisUtterance(phonetics);
        utterance.lang = 'id-ID';
        utterance.rate = 0.75;
        utterance.pitch = 1.2;

        const voices = window.speechSynthesis.getVoices();
        const idVoices = voices.filter(v => v.lang.includes('id') || v.lang.includes('ID'));
        if (idVoices.length > 0) {
            let selectedVoice = idVoices.find(v => 
                v.name.toLowerCase().includes('female') || 
                v.name.toLowerCase().includes('perempuan') || 
                v.name.toLowerCase().includes('wanita') || 
                v.name.toLowerCase().includes('zira') ||
                v.name.toLowerCase().includes('google')
            );
            if (!selectedVoice) {
                selectedVoice = idVoices.find(v => 
                    !v.name.toLowerCase().includes('male') && 
                    !v.name.toLowerCase().includes('pria')
                );
            }
            if (!selectedVoice) {
                selectedVoice = idVoices[0];
            }
            utterance.voice = selectedVoice;
        }

        utterance.onend = () => {
            if (loop && isTTSPlaying) {
                playOfflineTTSWithCallback(letter, loop, callback);
            } else {
                debugState.playbackStatus = "ended (Offline TTS)";
                updateDebugPanel();
                callback();
            }
        };

        debugState.audioUrl = "SpeechSynthesis";
        debugState.audioFormat = "Synthesis (Web Speech)";
        debugState.playbackStatus = "playing (Offline TTS)";
        updateDebugPanel();

        window.speechSynthesis.speak(utterance);
    } else {
        showNotification("Browser tidak mendukung suara.");
        debugState.errorMessage = "SpeechSynthesis not supported";
        updateDebugPanel();
        callback();
    }
}

// --- SOUND EFFECTS ---
function playBeep(frequency, duration, type = "sine") {
    try {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime); // volume ramah anak
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn("Synth audio error", e);
    }
}

function playSuccessSFX() {
    setTimeout(() => playBeep(523.25, 0.15, "triangle"), 0);   // C5
    setTimeout(() => playBeep(659.25, 0.15, "triangle"), 100); // E5
    setTimeout(() => playBeep(783.99, 0.25, "triangle"), 200); // G5
}

function playErrorSFX() {
    playBeep(220, 0.3, "sawtooth"); // A3
}

// --- TTS HELPER: LEMBAR MEMBACA (Part 2) ---
function playReadTTSHelper() {
    const range = gameState.currentLevelRange;
    const items = LEVEL_GROUPS[range];
    if (!items) return;

    const textToPlay = items.join(', ');
    playLetterSound(textToPlay);

    const btn = document.getElementById('btn-read-tts-helper');
    if (btn) {
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
    }
}

// --- TTS HELPER: KATA GAMBAR ---
function playPictureWordTTS() {
    const range = gameState.currentLevelRange;
    const letters = LEVEL_GROUPS[range];
    if (!letters) return;

    const phrases = letters.map(l => {
        const data = PICTURE_WORDS[l];
        return data ? `${l}, ${data.text}` : l;
    });

    const textToPlay = phrases.join('. ');
    playLetterSound(textToPlay, true);

    const btn = document.getElementById('btn-picture-tts-helper');
    if (btn) {
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
    }
}
