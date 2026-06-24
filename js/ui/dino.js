/* ============================================================
 * js/ui/dino.js
 * SVG Dino Triceratops — rendering karakter dengan aksesoris
 * ============================================================ */

function getDinoSvg(activeAccessory = '') {
    const show = (id) => activeAccessory === id ? '' : 'class="hidden"';

    return `
<svg class="dino-graphic" viewBox="0 0 100 100">
    <!-- Tail -->
    <path d="M75 55 C85 50, 90 35, 88 30 C85 30, 80 40, 72 48" fill="#4CAF50" stroke="#2E7D32" stroke-width="2" />
    <!-- Body -->
    <ellipse cx="50" cy="60" rx="26" ry="20" fill="#4CAF50" stroke="#2E7D32" stroke-width="2" />
    <ellipse cx="44" cy="62" rx="14" ry="10" fill="#81C784" opacity="0.6" />
    <!-- Spots -->
    <circle cx="42" cy="43" r="3" fill="#81C784" />
    <circle cx="53" cy="42" r="4" fill="#81C784" />
    <circle cx="63" cy="45" r="3" fill="#81C784" />
    <!-- Feet -->
    <rect x="32" y="70" width="10" height="15" rx="5" fill="#388E3C" stroke="#2E7D32" stroke-width="2" />
    <rect x="58" y="70" width="10" height="15" rx="5" fill="#388E3C" stroke="#2E7D32" stroke-width="2" />
    <circle cx="37" cy="82" r="2" fill="#FFF" />
    <circle cx="63" cy="82" r="2" fill="#FFF" />
    <!-- Neck -->
    <path d="M30 52 L38 35 L48 45 L40 60 Z" fill="#4CAF50" />
    <!-- Collar Frill -->
    <path d="M22 28 C18 10, 52 10, 48 28 Z" fill="#FFC107" stroke="#F57C00" stroke-width="2" />
    <circle cx="27" cy="18" r="3" fill="#FF8F00" />
    <circle cx="35" cy="14" r="3" fill="#FF8F00" />
    <circle cx="43" cy="18" r="3" fill="#FF8F00" />
    <!-- Head -->
    <circle cx="30" cy="38" r="16" fill="#4CAF50" stroke="#2E7D32" stroke-width="2" />
    <!-- Snout -->
    <path d="M14 38 C14 32, 22 32, 24 38 C24 42, 14 44, 14 38 Z" fill="#388E3C" stroke="#2E7D32" stroke-width="1.5" />
    <path d="M16 40 Q20 42 22 39" fill="none" stroke="#1B5E20" stroke-width="2" stroke-linecap="round" />
    <!-- Horns -->
    <path d="M22 26 L15 16 L22 22 Z" fill="#FFF9C4" stroke="#FBC02D" stroke-width="1.5" />
    <path d="M12 33 L4 33 L10 36 Z" fill="#FFF9C4" stroke="#FBC02D" stroke-width="1.5" />
    <!-- Eye -->
    <g class="dino-eye-group">
        <circle cx="28" cy="34" r="5" fill="#1B5E20" />
        <circle cx="27" cy="32" r="2" fill="#FFF" />
        <circle cx="30" cy="35" r="1" fill="#FFF" />
    </g>
    <!-- Rosy Cheek -->
    <ellipse class="dino-cheek" cx="23" cy="40" rx="3" ry="2" fill="#FF8A80" opacity="0.8" />
    <!-- Accessories -->
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
</svg>`;
}
