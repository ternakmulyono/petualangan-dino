/* ============================================================
 * js/core/state.js
 * Game State Management — load, save, dan objek state utama
 * ============================================================ */

// --- GAME STATE OBJECT ---
let gameState = {
    xp: 0,
    coins: 0,
    dinoState: 'egg',           // 'egg' or 'baby'
    dinoName: 'Telur Misterius',
    masteredLetters: [],        // Array of mastered items
    unlockedAccessories: [],    // Bought accessory IDs
    activeAccessory: '',        // Equipped accessory ID
    parentBadges: [],           // Array of string badge IDs given by parents
    pendingRewards: {
        coins: 0,
        badges: []
    },

    // Gameplay states
    currentLevelRange: 'a-e',   // Current level selected on Map (lowercase)
    currentLetterIndex: 0,      // Index within current level letters
    currentTargetLetter: '',    // Current letter being learned
    currentGameMode: 'letters', // Current game mode
    phaseStatus: {},            // Tracks completion of phase: { 'vowels': { letters: true, 'drag-match': false } }

    // Media Recording variables
    mediaRecorder: null,
    audioChunks: [],
    recordedBlob: null,
    isRecording: false,
    recordingTimeout: null
};

// Target letters for hatching egg (Jilid 1 letters A-Z)
const LETTERS_TO_HATCH = 26;

// Global variables for Canvas Tracing drawing strokes
let allStrokes = [];
let currentStroke = [];

// --- LOAD GAME STATE FROM LOCALSTORAGE ---
function loadGameState() {
    const saved = localStorage.getItem('dino_reading_state');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            gameState.xp = parsed.xp || 0;
            gameState.coins = parsed.coins || 0;
            gameState.dinoState = parsed.dinoState || 'egg';
            gameState.dinoName = parsed.dinoName || 'Telur Misterius';
            gameState.masteredLetters = parsed.masteredLetters || [];
            gameState.unlockedAccessories = parsed.unlockedAccessories || [];
            gameState.parentBadges = parsed.parentBadges || [];
            gameState.pendingRewards = parsed.pendingRewards || { coins: 0, badges: [] };
            gameState.phaseStatus = parsed.phaseStatus || {};
        } catch (e) {
            console.error("Error loading state", e);
        }
    }
}

// --- SAVE GAME STATE TO LOCALSTORAGE ---
function saveGameState() {
    const stateToSave = {
        xp: gameState.xp,
        coins: gameState.coins,
        dinoState: gameState.dinoState,
        dinoName: gameState.dinoName,
        masteredLetters: gameState.masteredLetters,
        unlockedAccessories: gameState.unlockedAccessories,
        activeAccessory: gameState.activeAccessory,
        parentBadges: gameState.parentBadges,
        pendingRewards: gameState.pendingRewards,
        phaseStatus: gameState.phaseStatus
    };
    localStorage.setItem('dino_reading_state', JSON.stringify(stateToSave));
    updateUIElements();
}
