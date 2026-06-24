/* ============================================================
 * js/core/storage.js
 * IndexedDB Helper — simpan dan ambil rekaman audio offline
 * ============================================================ */

const DB_NAME = "DinoAdventureDB";
const STORE_NAME = "recordings";
let db = null;

// --- INISIALISASI INDEXEDDB ---
function initDB() {
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (e) => {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: "letter" });
            }
        };

        request.onsuccess = (e) => {
            db = e.target.result;
            resolve(true);
        };

        request.onerror = (e) => {
            console.error("IndexedDB error:", e.target.error);
            resolve(false); // Fallback to memory
        };
    });
}

// --- SIMPAN AUDIO BLOB KE INDEXEDDB ---
function saveAudioBlob(letter, blob) {
    return new Promise((resolve) => {
        if (!db) return resolve(false);

        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        const record = {
            letter: letter,
            blob: blob,
            timestamp: new Date().getTime(),
            dateString: new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        const request = store.put(record);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
    });
}

// --- AMBIL SEMUA REKAMAN DARI INDEXEDDB ---
function getAudioRecordings() {
    return new Promise((resolve) => {
        if (!db) return resolve([]);

        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
    });
}

// --- HAPUS SEMUA REKAMAN DARI INDEXEDDB ---
function clearAllDBRecordings() {
    return new Promise((resolve) => {
        if (!db) return resolve(false);
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
    });
}
