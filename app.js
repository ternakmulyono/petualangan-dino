/* ============================================================
 * app.js — Entry Point (< 20 baris logika)
 * Dino Adventure Reading — Calistung App
 * ============================================================ */

window.addEventListener('DOMContentLoaded', async () => {
    // 1. Core
    loadGameState();
    // Inisialisasi DB di background agar tidak memblokir event binding UI jika IndexedDB bermasalah/lambat
    initDB().then(() => {
        console.log("Database initialized successfully.");
    }).catch(e => {
        console.error("Database initialization failed:", e);
    });

    // 2. UI
    initNavEvents();
    initGameEvents();
    initShopEvents();
    initParentEvents();

    // 3. Render awal
    updateUIElements();
    updateMapScreen();
    updateNestParentBadges();
    checkPendingRewards();
});
