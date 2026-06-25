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
    if (typeof startHatchingGame === 'function') {
        startHatchingGame();
    }
}

// --- SPAWN CONFETTI ANIMASI (Mendukung Bintang Emas & Global Container) ---
function spawnConfetti(containerId = 'global-confetti') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#4CAF50', '#FF9800', '#80DEEA', '#FF5722', '#E91E63', '#9C27B0'];

    for (let i = 0; i < 50; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'absolute';
        
        // 30% dari partikel berupa bintang emas (⭐), 70% berupa kertas warna-warni (lingkaran / persegi)
        const randType = Math.random();
        if (randType < 0.3) {
            conf.textContent = '⭐';
            conf.style.fontSize = Math.random() * 12 + 12 + 'px';
            conf.style.width = 'auto';
            conf.style.height = 'auto';
            conf.style.backgroundColor = 'transparent';
            conf.style.zIndex = '10000';
        } else {
            conf.style.width = Math.random() * 8 + 6 + 'px';
            conf.style.height = Math.random() * 12 + 6 + 'px';
            conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            if (randType < 0.6) {
                conf.style.borderRadius = '50%'; // Lingkaran
            } else {
                conf.style.borderRadius = '2px'; // Persegi
            }
        }
        
        conf.style.left = Math.random() * 100 + '%';
        conf.style.top = '-15px';
        conf.style.transform = `rotate(${Math.random() * 360}deg)`;

        const fallDuration = Math.random() * 2 + 1.5;
        const drift = Math.random() * 60 - 30;

        conf.animate([
            { top: '-15px', transform: 'rotate(0deg) translateX(0px)' },
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
        ...SHOP_ITEMS,
        { id: 'mystery-chest', name: 'Peti Misteri 🎁', price: 100, emoji: '🎁', description: 'Dapatkan 1 aksesoris acak yang belum kamu miliki!' }
    ];

    allItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'shop-item-card';

        let actionHtml = '';
        let mediaHtml = '';

        if (item.id === 'mystery-chest') {
            const hasAll = SHOP_ITEMS.every(acc => gameState.unlockedAccessories.includes(acc.id));
            if (hasAll) {
                actionHtml = `<button class="btn-equip active" disabled>Lengkap</button>`;
            } else {
                const canBuy = gameState.coins >= item.price;
                actionHtml = `<button class="btn-buy" ${canBuy ? '' : 'disabled'} onclick="buyMysteryChest()">🪙 ${item.price}</button>`;
            }
            mediaHtml = `<div class="shop-item-img-container" style="display:flex;align-items:center;justify-content:center;font-size:36px;width:60px;height:60px;background:#FFF9C4;border:2.5px solid var(--earth-dark);border-radius:50%;margin-bottom:8px;">🎁</div>`;
        } else {
            const isUnlocked = item.id === '' || gameState.unlockedAccessories.includes(item.id);
            const isActive = gameState.activeAccessory === item.id;

            if (isActive) {
                actionHtml = `<button class="btn-equip active" disabled>Dipakai</button>`;
            } else if (isUnlocked) {
                actionHtml = `<button class="btn-equip" onclick="equipAccessory('${item.id}')">Pakai</button>`;
            } else {
                const canBuy = gameState.coins >= item.price;
                actionHtml = `<button class="btn-buy" ${canBuy ? '' : 'disabled'} onclick="buyAccessory('${item.id}', ${item.price})">🪙 ${item.price}</button>`;
            }

            const accessoryImages = {
                '': 'image/dino/dino-utama.png',
                'explorer-hat': 'image/dino/topi-dino.png',
                'sunglasses': 'image/dino/kacamata-dino.png',
                'crown': 'image/dino/mahkota-dino.png',
                'scarf': 'image/dino/syal-dino.png'
            };
            const imgSrc = accessoryImages[item.id] || 'image/dino/dino-utama.png';
            mediaHtml = `<img src="${imgSrc}" class="shop-item-img" alt="${item.name}" />`;
        }

        card.innerHTML = `
            ${mediaHtml}
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
        
        // Unlock 'dino-friend' achievement badge
        if (!gameState.parentBadges) gameState.parentBadges = [];
        if (!gameState.parentBadges.includes('dino-friend')) {
            gameState.parentBadges.push('dino-friend');
            setTimeout(() => {
                showNotification("Lencana Baru: 🦖 Sahabat Dino!");
            }, 1500);
        }

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

// --- BELI PETI MISTERI (GACHA) ---
window.buyMysteryChest = function() {
    const price = 100;
    if (gameState.coins < price) {
        showNotification("Koinmu tidak cukup!");
        playErrorSFX();
        return;
    }

    const lockedAccessories = SHOP_ITEMS.filter(acc => !gameState.unlockedAccessories.includes(acc.id));
    if (lockedAccessories.length === 0) {
        showNotification("Semua aksesoris sudah dimiliki! 👑");
        playErrorSFX();
        return;
    }

    gameState.coins -= price;
    const randomIndex = Math.floor(Math.random() * lockedAccessories.length);
    const chosen = lockedAccessories[randomIndex];

    gameState.unlockedAccessories.push(chosen.id);
    gameState.activeAccessory = chosen.id; // Otomatis pakai aksesoris yang didapatkan

    // Buka lencana 'dino-friend' jika belum ada
    if (!gameState.parentBadges) gameState.parentBadges = [];
    if (!gameState.parentBadges.includes('dino-friend')) {
        gameState.parentBadges.push('dino-friend');
    }

    saveGameState();

    // Tampilkan modal reward gacha
    const modal = document.getElementById('mystery-reward-modal');
    const cardArea = document.getElementById('mystery-reward-card-area');
    if (modal && cardArea) {
        const accessoryImages = {
            'explorer-hat': 'image/dino/topi-dino.png',
            'sunglasses': 'image/dino/kacamata-dino.png',
            'crown': 'image/dino/mahkota-dino.png',
            'scarf': 'image/dino/syal-dino.png'
        };
        const imgSrc = accessoryImages[chosen.id] || 'image/dino/dino-utama.png';

        cardArea.innerHTML = `
            <div style="font-size: 44px; margin-bottom: 5px;">${chosen.emoji}</div>
            <div style="font-weight: 800; font-size: 15px; color: var(--earth-dark);">${chosen.name}</div>
            <div style="font-size: 12px; color: var(--earth-brown); text-align: center; line-height: 1.3;">${chosen.description}</div>
            <img src="${imgSrc}" style="width: 100px; height: 100px; object-fit: contain; margin-top: 10px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));" />
        `;

        modal.classList.remove('hidden');
        playSuccessSFX();
        spawnConfetti('mystery-confetti');
    }

    // Refresh UI Toko & Nest
    document.getElementById('shop-coin-count').textContent = gameState.coins;
    renderShopItems();
    if (typeof updateUIElements === 'function') updateUIElements();
};

