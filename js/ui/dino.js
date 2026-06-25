/* ============================================================
 * js/ui/dino.js
 * SVG Dino Triceratops — rendering karakter dengan aksesoris & pose dinamis
 * ============================================================ */

function getDinoSvg(activeAccessory = '', pose = 'waving') {
    const show = (id) => activeAccessory === id ? '' : 'class="hidden"';

    const poses = {
        waving: { viewBox: "0 0 380 400", x: -120, y: -100, width: 1536, height: 1024, accTransform: "translate(50, -25) scale(5.2)" },
        thinking: { viewBox: "0 0 200 280", x: -615, y: -175, width: 1536, height: 1024, accTransform: "translate(4, -40) scale(3.2)" },
        samping: { viewBox: "0 0 200 280", x: -825, y: -175, width: 1536, height: 1024, accTransform: "translate(10, -40) scale(3.2)" },
        belajar: { viewBox: "0 0 200 280", x: -1030, y: -570, width: 1536, height: 1024, accTransform: "translate(5, -40) scale(3.2)" },
        merayakan: { viewBox: "0 0 210 280", x: -1250, y: -570, width: 1536, height: 1024, accTransform: "translate(8, -40) scale(3.2)" },
        berjalan: { viewBox: "0 0 210 280", x: -340, y: -570, width: 1536, height: 1024, accTransform: "translate(4, -40) scale(3.2)" },
        berlari: { viewBox: "0 0 220 280", x: -570, y: -570, width: 1536, height: 1024, accTransform: "translate(8, -40) scale(3.2)" },
        menyapa: { viewBox: "0 0 200 280", x: -810, y: -570, width: 1536, height: 1024, accTransform: "translate(4, -40) scale(3.2)" }
    };

    const p = poses[pose] || poses.waving;

    return `
<svg class="dino-graphic" viewBox="${p.viewBox}" width="100%" height="100%">
    <!-- Base Dino Image cropped from the sheet -->
    <image href="image/dino.png" x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" />
    
    <!-- Accessories wrapped and scaled to fit the specific pose's head -->
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
