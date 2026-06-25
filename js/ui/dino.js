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
        <!-- Topi Dino (Explorer Hat) -->
        <g id="acc-explorer-hat" ${show('explorer-hat')}>
            <image href="image/dino/topi-dino.png" x="10" y="8" width="36" height="22" />
        </g>
        <!-- Kacamata Dino (Sunglasses) -->
        <g id="acc-sunglasses" ${show('sunglasses')}>
            <image href="image/dino/kacamata-dino.png" x="16" y="28" width="22" height="15" />
        </g>
        <!-- Mahkota Dino (Crown) -->
        <g id="acc-crown" ${show('crown')}>
            <image href="image/dino/mahkota-dino.png" x="12" y="8" width="32" height="19" />
        </g>
        <!-- Syal Dino (Scarf) -->
        <g id="acc-scarf" ${show('scarf')}>
            <image href="image/dino/syal-dino.png" x="22" y="42" width="28" height="28" />
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
