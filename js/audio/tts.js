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
        const response = await fetch('metadata.json');
        if (response.ok) {
            const data = await response.json();
            audioMetadata = {};
            data.forEach(item => {
                if (item.text && item.filename) {
                    audioMetadata[item.text.trim().toUpperCase()] = item.filename;
                }
            });
            console.log("Audio metadata loaded successfully:", audioMetadata);
        }
    } catch (e) {
        console.warn("Failed to load metadata.json, playing via TTS default fallback", e);
    }
}

// Panggil loading metadata saat inisialisasi
loadAudioMetadata();

// --- HENTIKAN SUARA / TTS YANG SEDANG BERJALAN ---
function stopLetterSound() {
    if (currentTTSAudio) {
        currentTTSAudio.pause();
        currentTTSAudio.currentTime = 0;
        currentTTSAudio = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    isTTSPlaying = false;
    currentTTSLoop = false;

    // Sembunyikan semua tombol stop di UI jika ada
    const stopBtn1 = document.getElementById('btn-picture-tts-stop');
    if (stopBtn1) stopBtn1.classList.add('hidden');

    const stopBtn2 = document.getElementById('btn-read-tts-stop');
    if (stopBtn2) stopBtn2.classList.add('hidden');
}

// --- MAINKAN SUARA HURUF (AUDIO ASLI + FALLBACK TTS) ---
function playLetterSound(letter, loop = false) {
    // Selalu hentikan audio sebelumnya terlebih dahulu
    stopLetterSound();

    const cleanLetter = letter.replace(/-/g, '').trim().toUpperCase();
    currentTTSLoop = loop;
    isTTSPlaying = true;

    // Tampilkan tombol stop yang relevan dengan layar aktif
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

    // 1. Cek jika ada suara asli (Recorded Voice) di metadata
    if (audioMetadata[cleanLetter]) {
        const url = `audio/${audioMetadata[cleanLetter]}`;
        const audio = new Audio(url);
        audio.loop = loop;
        currentTTSAudio = audio;

        audio.addEventListener('ended', () => {
            if (!loop) stopLetterSound();
        });

        audio.play().catch(e => {
            console.warn("Failed to play custom audio file, falling back to TTS", e);
            playLetterSoundFallback(letter, loop);
        });
        return;
    }

    // 2. Fallback jika tidak ada suara asli
    playLetterSoundFallback(letter, loop);
}

// --- FALLBACK TTS (ONLINE + OFFLINE) ---
function playLetterSoundFallback(letter, loop = false) {
    const cleanLetter = letter.replace(/-/g, '');
    const text = PHONETICS[cleanLetter.toUpperCase()] || cleanLetter;

    // Gunakan Google Translate TTS (Online) untuk suara alami Bahasa Indonesia
    if (navigator.onLine) {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=gtx&q=${encodeURIComponent(text)}`;
        const audio = new Audio(url);
        audio.loop = loop;
        currentTTSAudio = audio;

        let fallbackTriggered = false;
        const triggerFallback = () => {
            if (!fallbackTriggered) {
                fallbackTriggered = true;
                playOfflineTTS(cleanLetter, loop);
            }
        };

        audio.addEventListener('error', triggerFallback);
        audio.addEventListener('ended', () => {
            if (!loop) stopLetterSound();
        });

        audio.play().catch(e => {
            console.log("Online Audio failed, falling back", e);
            triggerFallback();
        });
    } else {
        playOfflineTTS(cleanLetter, loop);
    }
}

// --- TTS OFFLINE (SpeechSynthesis API) ---
function playOfflineTTS(letter, loop = false) {
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
            // Prioritaskan suara perempuan (nama mengandung female, perempuan, wanita, zira, google)
            let selectedVoice = idVoices.find(v => 
                v.name.toLowerCase().includes('female') || 
                v.name.toLowerCase().includes('perempuan') || 
                v.name.toLowerCase().includes('wanita') || 
                v.name.toLowerCase().includes('zira') ||
                v.name.toLowerCase().includes('google')
            );
            
            // Hindari suara pria jika tidak ada suara perempuan khusus
            if (!selectedVoice) {
                selectedVoice = idVoices.find(v => 
                    !v.name.toLowerCase().includes('male') && 
                    !v.name.toLowerCase().includes('pria')
                );
            }
            
            // Fallback suara Indonesia pertama
            if (!selectedVoice) {
                selectedVoice = idVoices[0];
            }
            
            utterance.voice = selectedVoice;
        }

        utterance.onend = () => {
            if (loop && isTTSPlaying) {
                playOfflineTTS(letter, loop);
            } else {
                stopLetterSound();
            }
        };

        window.speechSynthesis.speak(utterance);
    } else {
        showNotification("Browser tidak mendukung suara.");
    }
}

// --- SOUND EFFECTS ---
function playBeep(frequency, duration, type = "sine") {
    // Sound effects ignored for now per user feedback
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
