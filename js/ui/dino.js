/* ============================================================
 * js/ui/dino.js
 * SVG Dino Triceratops — rendering karakter dengan aksesoris & pose dinamis
 * menggunakan file cropped manual dari user
 * ============================================================ */

function getDinoSvg(activeAccessory = '', pose = 'waving') {
    const show = (id) => activeAccessory === id ? '' : 'class="hidden"';

    const poses = {
        waving: { file: "image/dino/dino utama.png", accTransform: "translate(34, -22) scale(2.2)" },
        thinking: { file: "image/dino/dino-depan.png", accTransform: "translate(34, -22) scale(2.2)" },
        samping: { file: "image/dino/dino-samping.png", accTransform: "translate(32, -22) scale(2.2)" },
        belajar: { file: "image/dino/dino-belajar.png", accTransform: "translate(34, -22) scale(2.2)" },
        merayakan: { file: "image/dino/dino-merayakan.png", accTransform: "translate(34, -22) scale(2.2)" },
        berjalan: { file: "image/dino/dino-berjalan.png", accTransform: "translate(34, -22) scale(2.2)" },
        berlari: { file: "image/dino/dino-berlari.png", accTransform: "translate(34, -22) scale(2.2)" },
        menyapa: { file: "image/dino/dino-menyapa.png", accTransform: "translate(34, -22) scale(2.2)" },
        melambai: { file: "image/dino/dino-melambai.png", accTransform: "translate(34, -22) scale(2.2)" }
    };

    const p = poses[pose] || poses.waving;

    return `
<svg class="dino-graphic" viewBox="0 0 200 200" width="100%" height="100%">
    <!-- Base Dino Image - pre-cropped by the user -->
    <image href="${p.file}" x="0" y="0" width="200" height="200" />
    
    <!-- Accessories wrapped and scaled to fit the pre-cropped Dino's head -->
    <g transform="${p.accTransform}">
        <g id="acc-explorer-hat" ${show('explorer-hat')}>
            <ellipse cx="28" cy="24" rx="16" ry="4" fill="#8D6E63" stroke="#5D4037" stroke-width="1.5" />
            <path d="M18 24 C18 14, 38 14, 38 24 Z" fill="#8D6E63" stroke="#5D4037" stroke-width="1.5" />
            <path d="M18 23 C18 21, 38 21, 38 23 C38 24, 18 24, 18 23 Z" fill="#FFB74D" />
        </g>
        <g id="acc-sunglasses" ${show('sunglasses')}>
            <polygon points="21,34 32,32 33,39 22,41" fill="#212121" stroke="#FFD54F" stroke-width="1.5" />
            <circle cx="24" cy="36" r="1.2" fill="#FFF" opacity="0.8" />
        </g>
        <g id="acc-crown" ${show('crown')}>
            <path d="M18 24 L16 14 L23 19 L28 11 L33 19 L40 14 L38 24 Z" fill="#FFD54F" stroke="#FFB300" stroke-width="1.5" />
            <circle cx="16" cy="14" r="1.2" fill="#E91E63" />
            <circle cx="28" cy="11" r="1.2" fill="#2196F3" />
            <circle cx="40" cy="14" r="1.2" fill="#E91E63" />
        </g>
        <g id="acc-scarf" ${show('scarf')}>
            <path d="M28 48 C28 45, 46 45, 43 54 C40 58, 28 54, 28 48 Z" fill="#D32F2F" stroke="#B71C1C" stroke-width="1.5" />
            <path d="M38 52 C38 52, 34 65, 33 68 C35 70, 40 66, 41 53" fill="#D32F2F" stroke="#B71C1C" stroke-width="1.5" />
            <path d="M34 51 C34 51, 28 62, 26 66 C28 68, 33 64, 34 52" fill="#F44336" stroke="#B71C1C" stroke-width="1" />
        </g>
    </g>
</svg>`;
}

// --- FUNGSI UPDATE MASKOT DINO SECARA DINAMIS ---
function updateMascotDino(poseName) {
    const mascot = document.getElementById('game-mascot-dino');
    if (mascot) {
        const accessory = (window.gameState && window.gameState.activeAccessory) || '';
        mascot.innerHTML = getDinoSvg(accessory, poseName);
    }
}
