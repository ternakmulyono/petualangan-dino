/* ============================================================
 * js/audio/tts.js
 * Text-to-Speech — suara huruf online (Google TTS) & offline
 * ============================================================ */

// --- WEB AUDIO CONTEXT ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// --- METADATA SUARA ASLI (RECORDED AUDIO) ---
const STATIC_AUDIO_METADATA = {
    // Letters
    "A": "0001_A.mp3",
    "I": "0002_I.mp3",
    "U": "0003_U.mp3",
    "E": "0004_E.mp3",
    "O": "0005_O.mp3",
    "B": "0006_B.mp3",
    "C": "0007_C.mp3",
    "D": "0008_D.mp3",
    "F": "0009_F.mp3",
    "G": "0010_G.mp3",
    "H": "0011_H.mp3",
    "J": "0012_J.mp3",
    "K": "0013_K.mp3",
    "L": "0014_L.mp3",
    "M": "0015_M.mp3",
    "N": "0016_N.mp3",
    "P": "0017_P.mp3",
    "Q": "0018_Q.mp3",
    "R": "0019_R.mp3",
    "S": "0020_S.mp3",
    "T": "0021_T.mp3",
    "V": "0022_V.mp3",
    "W": "0023_W.mp3",
    "X": "0024_X.mp3",
    "Y": "0025_Y.mp3",
    "Z": "0026_Z.mp3",

    // Narrations
    "SELAMAT DATANG DI HUTAN HURUF": "0001_SELAMAT_DATANG_DI_HUTAN_HURUF_.mp3",
    "DINO KEHILANGAN TELUR EMASNYA": "0002_DINO_KEHILANGAN_TELUR_EMASNYA_.mp3",
    "AYO BANTU DINO MENEMUKAN PETUNJUK BARU": "0003_AYO_BANTU_DINO_MENEMUKAN_PETUNJUK_BARU_.mp3",
    "PETUALANGAN DIMULAI": "0004_PETUALANGAN_DIMULAI_.mp3",
    "PILIH HURUF YANG BENAR": "0005_PILIH_HURUF_YANG_BENAR_.mp3",
    "DENGARKAN LALU PILIH JAWABANNYA": "0006_DENGARKAN_LALU_PILIH_JAWABANNYA_.mp3",
    "IKUTI GARIS UNTUK MENULIS HURUF": "0007_IKUTI_GARIS_UNTUK_MENULIS_HURUF_.mp3",
    "SENTUH HURUF YANG DIMINTA": "0008_SENTUH_HURUF_YANG_DIMINTA_.mp3",
    "SUSUN HURUF HINGGA MENJADI KATA": "0009_SUSUN_HURUF_HINGGA_MENJADI_KATA_.mp3",
    "HEBAT": "0010_HEBAT_.mp3",
    "BAGUS SEKALI": "0011_BAGUS_SEKALI_.mp3",
    "LUAR BIASA": "0012_LUAR_BIASA_.mp3",
    "PINTAR": "0013_PINTAR_.mp3",
    "KAMU BERHASIL": "0014_KAMU_BERHASIL_.mp3",
    "DINO SENANG SEKALI": "0015_DINO_SENANG_SEKALI_.mp3",
    "TERUSKAN PETUALANGANMU": "0016_TERUSKAN_PETUALANGANMU_.mp3",
    "HEBAT JAWABAN BENAR KAMU MENDAPAT SEPULUH XP": "0017_HEBAT__JAWABAN_BENAR__KAMU_MENDAPAT_SEPULUH_XP_.mp3",
    "SELAMAT MISI SELESAI HADIAH XP DAN KOIN DISIMPAN": "0018_SELAMAT__MISI_SELESAI__HADIAH_XP_DAN_KOIN_DISIMPAN_.mp3",
    "COBA LAGI YA": "0019_COBA_LAGI_YA_.mp3",
    "HAMPIR BENAR": "0020_HAMPIR_BENAR_.mp3",
    "JANGAN MENYERAH": "0021_JANGAN_MENYERAH_.mp3",
    "AYO COBA SEKALI LAGI": "0022_AYO_COBA_SEKALI_LAGI_.mp3",
    "KAMU PASTI BISA": "0023_KAMU_PASTI_BISA_.mp3",
    "DINO MASIH MEMBUTUHKAN BANTUANMU": "0024_DINO_MASIH_MEMBUTUHKAN_BANTUANMU_.mp3",
    "TARIK HURUF YANG TEPAT YA KAMU PASTI BISA": "0025_TARIK_HURUF_YANG_TEPAT_YA__KAMU_PASTI_BISA_.mp3",
    "HALO TEMAN": "0026_HALO_TEMAN_.mp3",
    "AKU BUTUH BANTUANMU": "0027_AKU_BUTUH_BANTUANMU_.mp3",
    "AYO KITA MENJELAJAH BERSAMA": "0028_AYO_KITA_MENJELAJAH_BERSAMA_.mp3",
    "AKU BANGGA PADAMU": "0029_AKU_BANGGA_PADAMU_.mp3",
    "WAH KITA BERHASIL": "0030_WAH__KITA_BERHASIL_.mp3",
    "AYO CARI PETUNJUK BERIKUTNYA": "0031_AYO_CARI_PETUNJUK_BERIKUTNYA_.mp3",
    "KAMU MENDAPATKAN BINTANG": "0032_KAMU_MENDAPATKAN_BINTANG_.mp3",
    "KOIN BERHASIL DIKUMPULKAN": "0033_KOIN_BERHASIL_DIKUMPULKAN_.mp3",
    "LEVEL DINO MENINGKAT": "0034_LEVEL_DINO_MENINGKAT_.mp3",
    "HADIAH BARU TERBUKA": "0035_HADIAH_BARU_TERBUKA_.mp3",
    "PETI HARTA BERHASIL DIBUKA": "0036_PETI_HARTA_BERHASIL_DIBUKA_.mp3",
    "ANAK ANDA BERHASIL MENYELESAIKAN LATIHAN HARI INI": "0037_ANAK_ANDA_BERHASIL_MENYELESAIKAN_LATIHAN_HARI_INI_.mp3",
    "PROGRESS MEMBACA MENINGKAT": "0038_PROGRESS_MEMBACA_MENINGKAT_.mp3",
    "TARGET HARIAN BERHASIL DICAPAI": "0039_TARGET_HARIAN_BERHASIL_DICAPAI_.mp3",
    "LATIHAN HARI INI SELESAI": "0040_LATIHAN_HARI_INI_SELESAI_.mp3",
    "SELAMAT": "0041_SELAMAT_.mp3",
    "KAMU BERHASIL MENYELESAIKAN HUTAN HURUF": "0042_KAMU_BERHASIL_MENYELESAIKAN_HUTAN_HURUF_.mp3",
    "DINO BANGGA PADAMU": "0043_DINO_BANGGA_PADAMU_.mp3",
    "PETUALANGAN BERIKUTNYA TELAH TERBUKA": "0044_PETUALANGAN_BERIKUTNYA_TELAH_TERBUKA_.mp3",
    "WAKTU REKAM HABIS REKAMAN DISIMPAN": "0045_WAKTU_REKAM_HABIS__REKAMAN_DISIMPAN_.mp3",
    "AREA TERKUNCI SELESAIKAN MISI SEBELUMNYA": "0046_AREA_TERKUNCI__SELESAIKAN_MISI_SEBELUMNYA_.mp3",
    "AKSESORIS DIPASANG": "0047_AKSESORIS_DIPASANG_.mp3",
    "AKSESORIS BERHASIL DIBELI DAN DIPAKAI": "0048_AKSESORIS_BERHASIL_DIBELI_DAN_DIPAKAI_.mp3",
    "BERHASIL MENUKAR SERATUS XP MENJADI SEPULUH KOIN": "0049_BERHASIL_MENUKAR_SERATUS_XP_MENJADI_SEPULUH_KOIN_.mp3",
    "XP TIDAK CUKUP BUTUH MINIMAL SERATUS XP": "0050_XP_TIDAK_CUKUP__BUTUH_MINIMAL_SERATUS_XP_.mp3"
};

let audioMetadata = { ...STATIC_AUDIO_METADATA };
let currentTTSAudio = null;
let currentTTSLoop = false;
let isTTSPlaying = false;

window.isAudioMetadataLoaded = true; // Set to true initially since it's pre-populated

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
        audioCtx.resume().catch(err => {
            console.warn("Gagal mengaktifkan AudioContext:", err);
        });
    }

    // 2. Jika ada antrean audio yang menunggu, langsung proses secara sinkron di sini
    // agar .play() dipicu langsung dari call stack interaksi user (gesture token aktif)!
    if (audioQueue.length > 0) {
        console.log("Membuka kunci audio menggunakan item antrean pertama secara sinkron...");
        isAudioUnlocked = true;
        if (!isQueueProcessing) {
            processNextInQueue();
        }
        return;
    }

    // 3. Jika antrean kosong, gunakan suara hening untuk membuka kunci
    if (window.globalAudioElement) {
        const silentWav = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        const oldSrc = window.globalAudioElement.src;
        window.globalAudioElement.src = silentWav;
        window.globalAudioElement.play()
            .then(() => {
                console.log("Global Audio Element berhasil dibuka kunci dengan hening.");
                window.globalAudioElement.src = oldSrc || "";
                isAudioUnlocked = true;
                debugState.playbackStatus = "Unlocked successfully";
                debugState.errorMessage = "None";
                updateDebugPanel();
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
