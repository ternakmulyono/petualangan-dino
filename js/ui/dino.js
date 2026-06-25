/* ============================================================
 * js/ui/dino.js
 * SVG Dino Triceratops — rendering karakter dengan aksesoris & pose dinamis
 * menggunakan file cropped manual dari user
 * ============================================================ */

function getDinoSvg(activeAccessory = '', pose = 'waving') {
    const poses = {
        waving: "image/dino/dino utama.png",
        thinking: "image/dino/dino-depan.png",
        samping: "image/dino/dino-samping.png",
        belajar: "image/dino/dino-belajar.png",
        merayakan: "image/dino/dino-merayakan.png",
        berjalan: "image/dino/dino-berjalan.png",
        berlari: "image/dino/dino-berlari.png",
        menyapa: "image/dino/dino-menyapa.png",
        melambai: "image/dino/dino-melambai.png"
    };

    let fileUrl = poses[pose] || poses.waving;

    // Jika pose utama (waving/awal) dan anak memakai aksesoris, gunakan file gambar gabungan dari user
    if (pose === 'waving' || !poses[pose]) {
        if (activeAccessory === 'explorer-hat') {
            fileUrl = "image/dino/dino-utama-topi.png";
        } else if (activeAccessory === 'sunglasses') {
            fileUrl = "image/dino/dino-utama-kacamata.png";
        } else if (activeAccessory === 'crown') {
            fileUrl = "image/dino/dino-utama-mahkota.png";
        } else if (activeAccessory === 'scarf') {
            fileUrl = "image/dino/dino-utama-syal.png";
        }
    }

    return `
<svg class="dino-graphic" viewBox="0 0 200 200" width="100%" height="100%">
    <!-- Base Dino Image (includes accessories if waving and equipped) -->
    <image href="${fileUrl}" x="0" y="0" width="200" height="200" />
</svg>`;
}

// --- FUNGSI UPDATE MASKOT DINO SECARA DINAMIS ---
let mascotPoseTimeout = null;

function updateMascotDino(poseName) {
    const mascot = document.getElementById('game-mascot-dino');
    if (!mascot) return;

    const accessory = (window.gameState && window.gameState.activeAccessory) || '';
    mascot.innerHTML = getDinoSvg(accessory, poseName);

    // Bersihkan timeout lama jika ada
    if (mascotPoseTimeout) {
        clearTimeout(mascotPoseTimeout);
        mascotPoseTimeout = null;
    }

    // Jika pose berekspresi senang (merayakan) dipicu, kembalikan ke pose default beraksesoris setelah 2.5 detik
    if (poseName === 'merayakan') {
        mascotPoseTimeout = setTimeout(() => {
            mascot.innerHTML = getDinoSvg(accessory, 'waving');
        }, 2500);
    }
}
