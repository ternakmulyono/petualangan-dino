/* ============================================================
 * js/learning/huruf/huruf-intro.js
 * Mode Kata Gambar & Lembar Membaca (Part 2)
 * ============================================================ */

// --- SETUP VIEW LEMBAR MEMBACA (PART 2) ---
function setupReadView(range) {
    if (typeof updateMascotDino === 'function') updateMascotDino('belajar'); // Dino belajar
    
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

        // Pilih suku kata pertama secara default saat masuk halaman (tanpa suara agar tidak terkena blokir autoplay browser mobile)
        if (syllables.length > 0 && typeof selectReadWriteItem === 'function') {
            selectReadWriteItem(syllables[0], false);
        }
    }, 100);

    gameState.recordedBlob = null;
    document.getElementById('playback-area-read').classList.add('hidden');
    document.getElementById('btn-submit-read').classList.add('hidden');
    document.getElementById('read-recording-status').textContent =
        'Tekan tombol mikrofon lalu rekam suaramu saat membaca.';

    const recordBtn = document.getElementById('btn-record-read');
    recordBtn.className = 'mic-button';
    document.getElementById('icon-mic-read').classList.remove('hidden');
    document.getElementById('icon-stop-read').classList.add('hidden');
}

// --- SETUP VIEW KATA GAMBAR ---
function setupPictureView(range) {
    if (typeof updateMascotDino === 'function') updateMascotDino('belajar'); // Dino belajar
    
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
    document.getElementById('picture-recording-status').textContent =
        'Tekan tombol mikrofon lalu rekam suaramu saat membaca.';

    const recordBtn = document.getElementById('btn-record-picture');
    recordBtn.className = 'mic-button';
    document.getElementById('icon-mic-picture').classList.remove('hidden');
    document.getElementById('icon-stop-picture').classList.add('hidden');
}
