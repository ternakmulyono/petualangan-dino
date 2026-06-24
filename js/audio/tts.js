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
    } catch (e) {
        console.warn("Failed to load metadata json, playing via TTS default fallback", e);
    }
}

// Panggil loading metadata saat inisialisasi
loadAudioMetadata();

// Global flag to prevent screen change from cutting off long narrations
window.preventStopOnScreenChange = false;

// --- ANTRIAN AUDIO (SEQUENTIAL PLAYBACK QUEUE) ---
let audioQueue = [];
let isQueueProcessing = false;

// --- HENTIKAN SUARA / TTS YANG SEDANG BERJALAN & KOSONGKAN ANTRIAN ---
function stopLetterSound() {
    if (window.preventStopOnScreenChange) {
        return; // Mencegah pemutusan audio jika sedang berada dalam transisi layar yang dilindungi
    }
    
    // Kosongkan antrean
    audioQueue = [];
    isQueueProcessing = false;
    isTTSPlaying = false;
    currentTTSLoop = false;

    if (currentTTSAudio) {
        currentTTSAudio.pause();
        currentTTSAudio.currentTime = 0;
        currentTTSAudio = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    // Sembunyikan semua tombol stop di UI jika ada
    const stopBtn1 = document.getElementById('btn-picture-tts-stop');
    if (stopBtn1) stopBtn1.classList.add('hidden');

    const stopBtn2 = document.getElementById('btn-read-tts-stop');
    if (stopBtn2) stopBtn2.classList.add('hidden');
}

// --- MAINKAN SUARA HURUF / NARASI (ANTREAN / QUEUED PLAYBACK) ---
function playLetterSound(letter, loop = false) {
    // Masukkan audio baru ke dalam antrean
    audioQueue.push({ letter, loop });
    
    // Jika tidak ada audio yang sedang berputar, mulai proses antrean
    if (!isQueueProcessing) {
        processNextInQueue();
    }
}

// --- PROSES ANTRIAN AUDIO BERIKUTNYA ---
function processNextInQueue() {
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

    // Menghilangkan tanda baca & spasi berlebih untuk pencarian di metadata
    const cleanLetter = letter.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim().toUpperCase();
    currentTTSLoop = loop;

    // Tampilkan tombol stop yang relevan
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

    // Callback ketika audio selesai diputar
    const onAudioEnded = () => {
        if (!loop) {
            audioQueue.shift(); // Hapus item yang sudah selesai
            processNextInQueue(); // Lanjutkan ke antrean berikutnya
        }
    };

    // 1. Cek jika ada suara asli (Recorded Voice) di metadata
    if (audioMetadata[cleanLetter]) {
        const url = `audio/${audioMetadata[cleanLetter]}`;
        const audio = new Audio(url);
        audio.loop = loop;
        currentTTSAudio = audio;

        audio.addEventListener('ended', onAudioEnded);

        audio.play().catch(e => {
            console.warn("Gagal memutar audio kustom, beralih ke Fallback TTS", e);
            playLetterSoundFallbackWithCallback(letter, loop, onAudioEnded);
        });
        return;
    }

    // 2. Beralih ke fallback
    playLetterSoundFallbackWithCallback(letter, loop, onAudioEnded);
}

// --- FALLBACK TTS DENGAN CALLBACK ---
function playLetterSoundFallbackWithCallback(letter, loop, callback) {
    const cleanLetter = letter.replace(/-/g, '');
    const text = PHONETICS[cleanLetter.toUpperCase()] || cleanLetter;

    if (navigator.onLine) {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=gtx&q=${encodeURIComponent(text)}`;
        const audio = new Audio(url);
        audio.loop = loop;
        currentTTSAudio = audio;

        let fallbackTriggered = false;
        const triggerFallback = () => {
            if (!fallbackTriggered) {
                fallbackTriggered = true;
                playOfflineTTSWithCallback(cleanLetter, loop, callback);
            }
        };

        audio.addEventListener('error', triggerFallback);
        audio.addEventListener('ended', () => {
            if (!loop) {
                currentTTSAudio = null;
                callback();
            }
        });

        audio.play().catch(e => {
            console.log("Online Audio failed, falling back", e);
            triggerFallback();
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
                callback();
            }
        };

        window.speechSynthesis.speak(utterance);
    } else {
        showNotification("Browser tidak mendukung suara.");
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
