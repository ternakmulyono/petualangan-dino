/* ============================================================
 * js/game/reward.js
 * Sistem Reward — Peti Harta, Toko Dino, Lencana, Hadiah Parent
 * ============================================================ */

// --- STATE PETI HARTA KARUN ---
let chestCoinsRewardAmount = 0;
let isChestOpenPending = false;

// --- BUKA PETI HARTA KARUN (MODAL) ---
function openTreasureChest() {
    const modal = document.getElementById('chest-modal');
    if (!modal) return;

    document.getElementById('chest-title').textContent = "Peti Harta Karun! 🏴‍☠️";
    document.getElementById('chest-subtitle').textContent = "Kamu menyelesaikan misi! Klik peti untuk membukanya!";
    document.getElementById('chest-reward-area').classList.add('hidden');
    document.getElementById('btn-claim-chest').classList.add('hidden');

    const chestSvg = document.getElementById('chest-svg');
    if (chestSvg) {
        chestSvg.classList.remove('chest-shake', 'chest-glow');
        chestSvg.style.transform = '';
    }

    document.getElementById('chest-state-locked').classList.remove('hidden');
    document.getElementById('chest-state-opened').classList.add('hidden');

    const chestConfetti = document.getElementById('chest-confetti');
    if (chestConfetti) chestConfetti.innerHTML = '';

    modal.classList.remove('hidden');
    isChestOpenPending = true;

    playBeep(440, 0.15, "triangle");
}

// --- ANIMASI BUKA PETI + GENERATE REWARD ---
function unlockTreasureChest() {
    if (!isChestOpenPending) return;
    isChestOpenPending = false;

    const chestSvg = document.getElementById('chest-svg');
    if (chestSvg) chestSvg.classList.add('chest-shake');

    playBeep(293.66, 0.1, "sine");
    setTimeout(() => playBeep(329.63, 0.1, "sine"), 150);

    setTimeout(() => {
        if (chestSvg) {
            chestSvg.classList.remove('chest-shake');
            chestSvg.classList.add('chest-glow');
        }

        document.getElementById('chest-state-locked').classList.add('hidden');
        document.getElementById('chest-state-opened').classList.remove('hidden');

        chestCoinsRewardAmount = Math.floor(Math.random() * 21) + 20; // 20 to 40 coins
        gameState.coins = (gameState.coins || 0) + chestCoinsRewardAmount;
        saveGameState();

        document.getElementById('chest-coins-reward').textContent = `+${chestCoinsRewardAmount} Koin!`;
        document.getElementById('chest-title').textContent = "Hore! Peti Terbuka!";
        document.getElementById('chest-subtitle').textContent = "Kamu mendapatkan koin emas purba!";

        document.getElementById('chest-reward-area').classList.remove('hidden');
        document.getElementById('btn-claim-chest').classList.remove('hidden');

        playSuccessSFX();
        spawnConfetti('chest-confetti');
    }, 500);
}

// --- ANIMASI TELUR MENETAS ---
function triggerEggHatching() {
    gameState.dinoState = 'baby';
    gameState.dinoName = 'Bayi Triceratops';
    saveGameState();

    const modal = document.getElementById('hatching-modal');
    const animArea = modal.querySelector('.hatching-animation-area');
    const animDino = document.getElementById('anim-dino');
    const egg = document.getElementById('anim-egg');

    modal.classList.remove('hidden');
    animArea.classList.remove('hatched');
    animDino.classList.add('hidden');
    animDino.innerHTML = getDinoSvg('', 'merayakan');
    
    // Reset telur ke keadaan awal: telur utuh
    egg.src = 'image/dino/telur-utuh.png';
    egg.className = 'hatching-egg-graphic';

    // Mainkan sound effect sukses & suara narasi pembuka menetas: Selamat! Dino senang sekali! (MP3: 0041 & 0015)
    playSuccessSFX();
    setTimeout(() => {
        playLetterSound("Selamat!");
        setTimeout(() => {
            playLetterSound("Dino senang sekali!");
        }, 2000);
    }, 500);

    setTimeout(() => {
        // Tahap 1: Mulai goyangan pelan pada telur utuh
        egg.classList.add('wiggling');
        playBeep(330, 0.2, "square");

        setTimeout(() => {
            // Tahap 2: Berganti ke telur retak & goyangan cepat/keras
            egg.classList.remove('wiggling');
            egg.src = 'image/dino/telur-retak.png';
            egg.classList.add('cracking-hard');
            playBeep(380, 0.15, "square"); // suara retakan

            setTimeout(() => {
                // Tahap 3: Berganti ke telur pecah & Dino keluar!
                egg.classList.remove('cracking-hard');
                egg.src = 'image/dino/telur-pecah.png';
                
                animDino.classList.remove('hidden');
                animArea.classList.add('hatched');
                playBeep(880, 0.4, "triangle"); // suara menetas sukses
                spawnConfetti();
            }, 1000); // goyang keras selama 1 detik
        }, 1000); // goyang pelan selama 1 detik
    }, 2500); // Diundur sedikit agar narasi pembuka terdengar
}

// --- SPAWN CONFETTI ANIMASI ---
function spawnConfetti(containerId = 'hatching-confetti') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#4CAF50', '#FF9800', '#80DEEA', '#FF5722', '#E91E63', '#9C27B0'];

    for (let i = 0; i < 40; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'absolute';
        conf.style.width = Math.random() * 8 + 6 + 'px';
        conf.style.height = Math.random() * 12 + 6 + 'px';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.left = Math.random() * 100 + '%';
        conf.style.top = '-10px';
        conf.style.borderRadius = '2px';
        conf.style.transform = `rotate(${Math.random() * 360}deg)`;

        const fallDuration = Math.random() * 2 + 1.5;
        const drift = Math.random() * 40 - 20;

        conf.animate([
            { top: '-10px', transform: 'rotate(0deg) translateX(0px)' },
            { top: '100%', transform: `rotate(${Math.random() * 720}deg) translateX(${drift}px)`, opacity: 0 }
        ], {
            duration: fallDuration * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fill: 'forwards'
        });

        container.appendChild(conf);
    }
}

// --- BUKA TOKO AKSESORIS DINO ---
function openDinoShop() {
    renderShopItems();
    document.getElementById('shop-coin-count').textContent = gameState.coins;
    if (document.getElementById('shop-xp-count')) {
        document.getElementById('shop-xp-count').textContent = gameState.xp;
    }
    document.getElementById('shop-modal').classList.remove('hidden');
}

// --- TUTUP TOKO ---
function closeDinoShop() {
    document.getElementById('shop-modal').classList.add('hidden');
    updateUIElements();
}

// --- RENDER ITEM TOKO ---
function renderShopItems() {
    const grid = document.getElementById('shop-items-grid');
    grid.innerHTML = '';

    const allItems = [
        { id: '', name: 'Murni (Tanpa Aksesoris)', price: 0, emoji: '🦖', description: 'Tampilan alami Dino Triceratops yang imut.' },
        ...SHOP_ITEMS
    ];

    allItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'shop-item-card';

        const isUnlocked = item.id === '' || gameState.unlockedAccessories.includes(item.id);
        const isActive = gameState.activeAccessory === item.id;

        let actionHtml = '';
        if (isActive) {
            actionHtml = `<button class="btn-equip active" disabled>Dipakai</button>`;
        } else if (isUnlocked) {
            actionHtml = `<button class="btn-equip" onclick="equipAccessory('${item.id}')">Pakai</button>`;
        } else {
            const canBuy = gameState.coins >= item.price;
            actionHtml = `<button class="btn-buy" ${canBuy ? '' : 'disabled'} onclick="buyAccessory('${item.id}', ${item.price})">🪙 ${item.price}</button>`;
        }

        card.innerHTML = `
            <div class="shop-item-emoji">${item.emoji}</div>
            <div class="shop-item-details">
                <span class="shop-item-name">${item.name}</span>
                <span class="shop-item-desc">${item.description}</span>
            </div>
            <div class="shop-item-action">${actionHtml}</div>
        `;

        grid.appendChild(card);
    });
}

// --- PASANG AKSESORIS ---
window.equipAccessory = function(id) {
    gameState.activeAccessory = id;
    saveGameState();
    if (typeof updateUIElements === 'function') updateUIElements();
    renderShopItems();
    showNotification("Aksesoris dipasang!");
    playSuccessSFX();
};

// --- BELI AKSESORIS ---
window.buyAccessory = function(id, price) {
    if (gameState.coins >= price) {
        gameState.coins -= price;
        gameState.unlockedAccessories.push(id);
        gameState.activeAccessory = id;
        saveGameState();
        if (typeof updateUIElements === 'function') updateUIElements();
        document.getElementById('shop-coin-count').textContent = gameState.coins;
        renderShopItems();
        showNotification("Aksesoris berhasil dibeli dan dipakai!");
        playSuccessSFX();
    }
};

// --- RENDER GRID LENCANA UNTUK PARENT ---
function renderParentRewardsGrid() {
    const grid = document.getElementById('parent-badges-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.keys(PARENT_BADGES).forEach(badgeId => {
        const badge = PARENT_BADGES[badgeId];
        const isOwned = gameState.parentBadges && gameState.parentBadges.includes(badgeId);

        const card = document.createElement('div');
        card.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:#fff;border:2px solid var(--earth-brown);border-radius:var(--border-radius-sm);padding:8px 10px;gap:8px;';

        card.innerHTML = `
            <div style="font-size: 24px;">${badge.emoji}</div>
            <div style="flex-grow: 1; text-align: left;">
                <div style="font-weight: 700; font-size: 13px; color: var(--earth-dark);">${badge.name}</div>
                <div style="font-size: 11px; color: var(--earth-brown); line-height: 1.2;">${badge.desc}</div>
                ${isOwned ? '<span style="font-size: 10px; color: var(--primary-dark); font-weight: 700;">✓ Sudah Dimiliki Anak</span>' : ''}
            </div>
            <button class="btn-primary" style="margin: 0; padding: 6px 10px; font-size: 11px; flex-shrink: 0; width: auto;" onclick="sendBadgeToChild('${badgeId}')">Kirim!</button>
        `;
        grid.appendChild(card);
    });
}

// --- KIRIM LENCANA DARI PARENT KE ANAK ---
window.sendBadgeToChild = function(badgeId) {
    if (!gameState.pendingRewards) {
        gameState.pendingRewards = { coins: 0, badges: [] };
    }
    if (!gameState.pendingRewards.badges) {
        gameState.pendingRewards.badges = [];
    }
    if (!gameState.pendingRewards.badges.includes(badgeId)) {
        gameState.pendingRewards.badges.push(badgeId);
    }
    saveGameState();
    showNotification(`Lencana "${PARENT_BADGES[badgeId].name}" disiapkan untuk kejutan anak! 🎁`);
    renderParentRewardsGrid();
    playSuccessSFX();
};

// --- UPDATE TAMPILAN LENCANA DI LAYAR NEST ---
function updateNestParentBadges() {
    const shelf = document.getElementById('nest-parent-badges');
    const container = document.getElementById('nest-badges-container');
    if (!shelf || !container) return;

    if (gameState.parentBadges && gameState.parentBadges.length > 0) {
        shelf.classList.remove('hidden');
        container.innerHTML = '';
        gameState.parentBadges.forEach(badgeId => {
            const badge = PARENT_BADGES[badgeId];
            if (badge) {
                const badgeEl = document.createElement('div');
                badgeEl.style.cssText = 'display:inline-flex;flex-direction:column;align-items:center;justify-content:center;background:#FFF9C4;border:2.5px solid var(--earth-brown);border-radius:10px;padding:8px 6px;width:85px;min-height:75px;box-shadow:0 3px 0 var(--earth-brown);';
                badgeEl.title = badge.desc;
                badgeEl.innerHTML = `
                    <span style="font-size: 24px; line-height: 1;">${badge.emoji}</span>
                    <span style="font-size: 10px; font-weight: 700; color: var(--earth-dark); margin-top: 4px; text-align: center; line-height: 1.1;">${badge.name}</span>
                `;
                container.appendChild(badgeEl);
            }
        });
    } else {
        shelf.classList.add('hidden');
    }
}

// --- CEK & TAMPILKAN REWARD PENDING DARI PARENT ---
function checkPendingRewards() {
    if (!gameState.pendingRewards) return;

    const { coins, badges } = gameState.pendingRewards;
    if (coins > 0 || (badges && badges.length > 0)) {
        const modal = document.getElementById('gift-modal');
        const itemsArea = document.getElementById('gift-items-area');
        if (!modal || !itemsArea) return;

        itemsArea.innerHTML = '';

        if (coins > 0) {
            const coinEl = document.createElement('div');
            coinEl.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700;color:var(--primary-dark);';
            coinEl.innerHTML = `<span>🪙</span> <span>+${coins} Koin Bonus!</span>`;
            itemsArea.appendChild(coinEl);
        }

        if (badges && badges.length > 0) {
            badges.forEach(badgeId => {
                const badge = PARENT_BADGES[badgeId];
                if (badge) {
                    const badgeEl = document.createElement('div');
                    badgeEl.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--earth-dark);';
                    badgeEl.innerHTML = `<span>${badge.emoji}</span> <span>Lencana "${badge.name}"!</span>`;
                    itemsArea.appendChild(badgeEl);
                }
            });
        }

        modal.classList.remove('hidden');
        playSuccessSFX();
    }
}
