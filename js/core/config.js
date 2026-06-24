/* ============================================================
 * js/core/config.js
 * Semua data konstanta aplikasi Dino Adventure Reading
 * ============================================================ */

// --- PHONETIC MAP FOR INDONESIAN SPEECH SYNTHESIS ---
const PHONETICS = {
    'A': 'a', 'B': 'beh', 'C': 'ceh', 'D': 'deh', 'E': 'e', 'F': 'ef', 'G': 'geh', 'H': 'hah',
    'I': 'i', 'J': 'je', 'K': 'kah', 'L': 'el', 'M': 'em', 'N': 'en', 'O': 'o', 'P': 'peh',
    'Q': 'ki', 'R': 'er', 'S': 'es', 'T': 'teh', 'U': 'u', 'V': 'feh', 'W': 'we', 'X': 'eks',
    'Y': 'ye', 'Z': 'zet'
};

// --- LEVEL GROUPS (Jilid 1: Letters & Consonant Syllables/Words) ---
const LEVEL_GROUPS = {
    'vowels': ['a', 'i', 'u', 'e', 'o'],
    'b-g': ['b', 'c', 'd', 'f', 'g'],
    'h-m': ['h', 'j', 'k', 'l', 'm'],
    'n-s': ['n', 'p', 'q', 'r', 's'],
    't-z': ['t', 'v', 'w', 'x', 'y', 'z']
};

const part2Keys = [
    'a-group', 'ba-bo', 'ca-co', 'da-do', 'e-group', 'ga-go',
    'ha-ho', 'i-group', 'ja-jo', 'ka-ko', 'la-lo', 'ma-mo',
    'na-no', 'o-group', 'pa-po', 'ra-ro', 'sa-so', 'ta-to',
    'u-group', 'ya-yo', 'za-zo'
];

// Define vowel combination levels manually
LEVEL_GROUPS['a-group'] = ['aa', 'ai', 'au', 'ae', 'ao', 'a-ba', 'a-da', 'a-pi', 'a-ki', 'a-ku', 'a-bu', 'a-de', 'a-le', 'a-lo', 'a-do'];
LEVEL_GROUPS['e-group'] = ['ea', 'ei', 'eu', 'ee', 'eo', 'e-ca', 'e-la', 'e-ki', 'e-ri', 'e-mu', 'e-pu', 'e-ke', 'e-de', 'e-to', 'e-no'];
LEVEL_GROUPS['i-group'] = ['ia', 'ii', 'iu', 'ie', 'io', 'i-pa', 'i-ma', 'i-ri', 'i-ki', 'i-mu', 'i-pu', 'i-ke', 'i-de', 'i-to', 'i-no'];
LEVEL_GROUPS['o-group'] = ['oa', 'oi', 'ou', 'oe', 'oo', 'o-pa', 'o-ma', 'o-ri', 'o-ki', 'o-mu', 'o-pu', 'o-ke', 'o-de', 'o-to', 'o-no'];
LEVEL_GROUPS['u-group'] = ['ua', 'ui', 'uu', 'ue', 'uo', 'u-pa', 'u-ma', 'u-ri', 'u-ki', 'u-mu', 'u-pu', 'u-ke', 'u-de', 'u-to', 'u-no'];

// Dynamically generate Jilid 1 consonant groups
part2Keys.forEach(key => {
    if (key.endsWith('-group')) return;
    const consonant = key.split('-')[0][0];
    const syllables = ['a', 'i', 'u', 'e', 'o'].map(v => consonant + v);
    const list = [...syllables];
    list.push(`${consonant}a-${consonant}a`, `${consonant}a-${consonant}i`, `${consonant}a-${consonant}u`);
    list.push(`${consonant}i-${consonant}i`, `${consonant}i-${consonant}a`, `${consonant}i-${consonant}u`);
    list.push(`${consonant}u-${consonant}u`, `${consonant}u-${consonant}a`, `${consonant}u-${consonant}i`);
    list.push(`${consonant}e-${consonant}e`, `${consonant}e-${consonant}a`, `${consonant}e-${consonant}o`);
    list.push(`${consonant}o-${consonant}o`, `${consonant}o-${consonant}a`, `${consonant}o-${consonant}i`);
    LEVEL_GROUPS[key] = list;
});

const isPart2Range = (range) => part2Keys.includes(range);

// --- KAMUS KATA GAMBAR ---
const PICTURE_WORDS = {
    'a': { word: 'a-pi', display: 'a pi', emoji: '🔥', text: 'api' },
    'i': { word: 'i-kan', display: 'i kan', emoji: '🐟', text: 'ikan' },
    'u': { word: 'u-lat', display: 'u lat', emoji: '🐛', text: 'ulat' },
    'e': { word: 'e-kor', display: 'e kor', emoji: '🦅', text: 'ekor' },
    'o': { word: 'o-li', display: 'o li', emoji: '🛢️', text: 'oli' },
    'b': { word: 'bo-la', display: 'bo la', emoji: '⚽', text: 'bola' },
    'c': { word: 'ca-be', display: 'ca be', emoji: '🌶️', text: 'cabe' },
    'd': { word: 'da-si', display: 'da si', emoji: '👔', text: 'dasi' },
    'f': { word: 'fe-ri', display: 'fe ri', emoji: '🚢', text: 'feri' },
    'g': { word: 'ga-jah', display: 'ga jah', emoji: '🐘', text: 'gajah' },
    'h': { word: 'hi-u', display: 'hi u', emoji: '🦈', text: 'hiu' },
    'j': { word: 'ja-ri', display: 'ja ri', emoji: '🖐️', text: 'jari' },
    'k': { word: 'ku-pu', display: 'ku pu', emoji: '🦋', text: 'kupu' },
    'l': { word: 'li-lin', display: 'li lin', emoji: '🕯️', text: 'lilin' },
    'm': { word: 'me-ja', display: 'me ja', emoji: '🪑', text: 'meja' },
    'n': { word: 'na-nas', display: 'na nas', emoji: '🍍', text: 'nanas' },
    'p': { word: 'pe-na', display: 'pe na', emoji: '🖋️', text: 'pena' },
    'q': { word: 'qo-ran', display: 'qo ran', emoji: '📖', text: 'qoran' },
    'r': { word: 'ro-ti', display: 'ro ti', emoji: '🍞', text: 'roti' },
    's': { word: 'sa-pu', display: 'sa pu', emoji: '🧹', text: 'sapu' },
    't': { word: 'to-pi', display: 'to pi', emoji: '🤠', text: 'topi' },
    'v': { word: 'vas', display: 'vas', emoji: '🏺', text: 'vas' },
    'w': { word: 'wor-tel', display: 'wor tel', emoji: '🥕', text: 'wortel' },
    'x': { word: 'xi-lo-fon', display: 'xi lo fon', emoji: '🎹', text: 'xilofon' },
    'y': { word: 'yo-yo', display: 'yo yo', emoji: '🪀', text: 'yoyo' },
    'z': { word: 'ze-bra', display: 'ze bra', emoji: '🦓', text: 'zebra' }
};

// --- PARENT AWARD BADGES CONFIG ---
const PARENT_BADGES = {
    'reading-star': { name: 'Bintang Membaca', emoji: '🏆', desc: 'Sangat rajin membaca kata demi kata.' },
    'beautiful-pronunciation': { name: 'Pelafalan Merdu', emoji: '🗣️', desc: 'Mengucapkan bunyi huruf dengan sangat jelas.' },
    'independent-adventurer': { name: 'Petualang Mandiri', emoji: '🚀', desc: 'Menyelesaikan misi membaca dengan mandiri.' },
    'patient-learner': { name: 'Anak Penyabar', emoji: '⏳', desc: 'Sabar mendengarkan dan mencoba terus.' }
};

// --- DINO SHOP ACCESSORIES LIST ---
const SHOP_ITEMS = [
    { id: 'explorer-hat', name: 'Topi Penjelajah 🌱', price: 30, emoji: '🤠', description: 'Untuk menjelajah hutan huruf dengan gagah!' },
    { id: 'scarf', name: 'Syal Hangat Dino 🧣', price: 45, emoji: '🧣', description: 'Syal merah rajut agar Dino tetap hangat.' },
    { id: 'sunglasses', name: 'Kacamata Keren 😎', price: 60, emoji: '🕶️', description: 'Bikin Dino-mu jadi yang paling modis!' },
    { id: 'crown', name: 'Mahkota Emas 👑', price: 120, emoji: '👑', description: 'Tanda Dino rajin membaca paling hebat!' }
];

// --- LEVEL THEMES & STORY LINES ---
const LEVEL_THEMES = {
    'vowels': { name: '🌱 Hutan Vokal a, i, u, e, o', story: 'Dino melihat buah-buahan lezat bercahaya di Hutan Vokal. Ayo temukan huruf vokal tersembunyi!', xp: 50, coins: 10 },
    'b-g': { name: '🦖 Lembah Huruf b, c, d, f, g', story: 'Dino melompat gembira mendengar gemuruh batu menggelinding di Lembah Huruf. Ikuti jejak purba ini!', xp: 50, coins: 10 },
    'h-m': { name: '🦋 Gua Huruf h, j, k, l, m', story: 'Ada kepakan sayap kupu-kupu purba di dalam Gua Huruf. Mari bantu Dino menjelajahi ruang kristal ini!', xp: 50, coins: 10 },
    'n-s': { name: '🌋 Bukit Huruf n, p, q, r, s', story: 'Dino mendaki Bukit Huruf dekat gunung api hangat yang mengeluarkan asap kata ajaib!', xp: 50, coins: 10 },
    't-z': { name: '🏜️ Gurun Huruf t, v, w, x, y, z', story: 'Prasasti pasir berbisik di Gurun Huruf. Ayo ketahui rahasia huruf-huruf terakhir bersama Dino!', xp: 60, coins: 15 },
    'a-group': { name: '🌱 Lembah Vokal Ganda a', story: 'Kombinasi vokal ajaib "a" menyala di dinding tebing. Ayo lafalkan untuk menuntun Dino!', xp: 80, coins: 20 },
    'ba-bo': { name: '🌳 Lembah Membaca ba - bo', story: 'Dino menemukan papan kayu berisi petunjuk suku kata pertama. Ayo bantu Dino membacanya!', xp: 100, coins: 25 },
    'ca-co': { name: '🌻 Kebun Membaca ca - co', story: 'Ada bunga raksasa yang mekar setiap kali suku kata dibaca dengan benar. Ayo siram bunga ini dengan suaramu!', xp: 100, coins: 25 },
    'da-do': { name: '🪵 Jembatan Membaca da - do', story: 'Jembatan kayu tua ini hanya akan turun jika Dino membaca mantra di atasnya. Ayo bantu Dino!', xp: 100, coins: 25 },
    'e-group': { name: '🌿 Hutan Vokal Ganda e', story: 'Suara gemerisik daun purba melantunkan kombinasi huruf vokal "e". Mari dengarkan bersama Dino!', xp: 80, coins: 20 },
    'ga-go': { name: '⛰️ Tebing Membaca ga - go', story: 'Ada sarang burung purba di puncak tebing. Dino ingin menyapa mereka dengan membaca suku kata!', xp: 100, coins: 25 },
    'ha-ho': { name: '🌊 Danau Membaca ha - ho', story: 'Monster air yang lucu membuat riak air berbentuk suku kata. Ayo ikuti bunyinya!', xp: 100, coins: 25 },
    'i-group': { name: '💧 Oasis Vokal Ganda i', story: 'Dino menemukan air jernih memancarkan cahaya biru bertuliskan vokal "i". Segarkan tenggorokanmu dan bacalah!', xp: 80, coins: 20 },
    'ja-jo': { name: '🏰 Kuil Membaca ja - jo', story: 'Gerbang kuil batu kuno ini terkunci rapat. Bacakan tulisan di dinding untuk membukanya!', xp: 100, coins: 25 },
    'ka-ko': { name: '🌴 Hutan Kelapa Membaca ka - ko', story: 'Dino lapar dan ingin menjatuhkan kelapa manis dengan melantunkan bacaan yang merdu!', xp: 100, coins: 25 },
    'la-lo': { name: '🕯️ Gua Kristal Membaca la - lo', story: 'Kristal-kristal di dalam gua ini bersinar warna-warni saat mendengar suku kata dibaca!', xp: 100, coins: 25 },
    'ma-mo': { name: '🍯 Lembah Madu Membaca ma - mo', story: 'Lebah madu purba menjaga madu manis di lembah ini. Sapalah mereka dengan suara membacamu!', xp: 100, coins: 25 },
    'na-no': { name: '🌧️ Awan Membaca na - no', story: 'Awan hujan yang mendung butuh nyanyian membaca agar berubah menjadi pelangi yang cerah!', xp: 100, coins: 25 },
    'o-group': { name: '🍂 Bukit Vokal Ganda o', story: 'Kakek dan Nenek Dino melambaikan tangan di bukit vokal "o". Sapalah mereka dengan penuh hormat!', xp: 80, coins: 20 },
    'pa-po': { name: '🐚 Pantai Membaca pa - po', story: 'Dino menemukan kerang-kerang ajaib di tepi pantai yang mengeluarkan suara suku kata saat didekatkan ke telinga!', xp: 100, coins: 25 },
    'ra-ro': { name: '🦖 Lembah Dino Membaca ra - ro', story: 'Dino-dino lain berkumpul untuk mendengar dongeng membaca dari Dino kesayanganmu. Ayo pimpin dongengnya!', xp: 100, coins: 25 },
    'sa-so': { name: '🌾 Padang Rumput Membaca sa - so', story: 'Angin sepoi-sepoi menggoyangkan rumput membentuk formasi kata. Bantu Dino membacanya ya!', xp: 100, coins: 25 },
    'ta-to': { name: '🍁 Bukit Oranye Membaca ta - to', story: 'Daun-daun berguguran menutup jalan. Bacalah kata-kata ini untuk meniup daun-daun tersebut!', xp: 100, coins: 25 },
    'u-group': { name: '☁️ Awan Vokal Ganda u', story: 'Dino menaiki awan kapas empuk bertuliskan vokal "u". Rasakan kehangatannya sambil membaca!', xp: 80, coins: 20 },
    'ya-yo': { name: '🔮 Bukit Bintang Membaca ya - yo', story: 'Bintang jatuh berkilauan di langit malam. Ayo buat harapan dengan menyelesaikan misi membaca ini!', xp: 100, coins: 25 },
    'za-zo': { name: '👑 Puncak Ajaib Membaca za - zo (Finis)', story: 'Misi terakhir! Mahkota emas dan telur emas misterius menanti di puncak bukit salju ini!', xp: 150, coins: 50 }
};

// --- TRACE LETTER PATHS (Writing guide coordinates) ---
const TRACE_LETTER_PATHS = {
    'a': [ [{x:75,y:40},{x:60,y:30},{x:40,y:30},{x:25,y:50},{x:40,y:70},{x:60,y:70},{x:75,y:60}], [{x:75,y:30},{x:75,y:75}] ],
    'i': [ [{x:50,y:40},{x:50,y:75}], [{x:50,y:22}] ],
    'u': [ [{x:30,y:35},{x:30,y:60},{x:50,y:75},{x:70,y:60},{x:70,y:35}], [{x:70,y:35},{x:70,y:75}] ],
    'e': [ [{x:25,y:55},{x:75,y:55},{x:75,y:40},{x:60,y:25},{x:40,y:30},{x:25,y:50},{x:40,y:75},{x:65,y:75},{x:75,y:68}] ],
    'o': [ [{x:50,y:25},{x:30,y:35},{x:20,y:50},{x:30,y:65},{x:50,y:75},{x:70,y:65},{x:80,y:50},{x:70,y:35},{x:50,y:25}] ],
    'b': [ [{x:30,y:15},{x:30,y:75}], [{x:30,y:45},{x:50,y:35},{x:70,y:50},{x:70,y:65},{x:50,y:75},{x:30,y:75}] ],
    'c': [ [{x:70,y:35},{x:50,y:25},{x:30,y:50},{x:50,y:75},{x:70,y:65}] ],
    'd': [ [{x:70,y:45},{x:50,y:35},{x:30,y:50},{x:30,y:65},{x:50,y:75},{x:70,y:75}], [{x:70,y:15},{x:70,y:75}] ],
    'f': [ [{x:70,y:25},{x:55,y:15},{x:45,y:25},{x:45,y:75}], [{x:30,y:40},{x:65,y:40}] ],
    'g': [ [{x:70,y:45},{x:50,y:35},{x:30,y:50},{x:30,y:65},{x:50,y:75},{x:70,y:75}], [{x:70,y:45},{x:70,y:80},{x:60,y:95},{x:40,y:95},{x:30,y:85}] ],
    'n': [ [{x:30,y:40},{x:30,y:75}], [{x:30,y:50},{x:45,y:35},{x:65,y:45},{x:65,y:75}] ],
    'p': [ [{x:30,y:40},{x:30,y:95}], [{x:30,y:50},{x:50,y:35},{x:70,y:50},{x:70,y:65},{x:50,y:75},{x:30,y:75}] ],
    'q': [ [{x:70,y:45},{x:50,y:35},{x:30,y:50},{x:30,y:65},{x:50,y:75},{x:70,y:75}], [{x:70,y:40},{x:70,y:95}] ],
    'r': [ [{x:35,y:40},{x:35,y:75}], [{x:35,y:55},{x:45,y:40},{x:65,y:40}] ],
    's': [ [{x:65,y:35},{x:50,y:25},{x:35,y:40},{x:50,y:50},{x:65,y:60},{x:50,y:75},{x:35,y:65}] ],
    't': [ [{x:45,y:15},{x:45,y:65},{x:55,y:75},{x:70,y:75}], [{x:30,y:35},{x:60,y:35}] ],
    'v': [ [{x:25,y:40},{x:50,y:75},{x:75,y:40}] ],
    'w': [ [{x:20,y:40},{x:35,y:75},{x:50,y:55},{x:65,y:75},{x:80,y:40}] ],
    'x': [ [{x:30,y:35},{x:70,y:75}], [{x:70,y:35},{x:30,y:75}] ],
    'y': [ [{x:25,y:40},{x:25,y:60},{x:45,y:70},{x:65,y:60},{x:65,y:40}], [{x:65,y:40},{x:65,y:80},{x:55,y:95},{x:35,y:95}] ],
    'z': [ [{x:25,y:35},{x:75,y:35},{x:25,y:75},{x:75,y:75}] ]
};

// --- BRIDGE LETTER COMPONENTS (Building game) ---
const BRIDGE_LETTER_COMPONENTS = {
    'h': [ { type: 'straight', x: 35, y: 20, w: 8, h: 65, label: '🪵' }, { type: 'arch', x: 43, y: 40, w: 22, h: 45, label: '🌿' } ],
    'j': [ { type: 'straight', x: 50, y: 35, w: 8, h: 35, label: '🪵' }, { type: 'dot', x: 50, y: 15, w: 8, h: 8, label: '🪨' }, { type: 'hook', x: 38, y: 65, w: 20, h: 12, label: '🪵' } ],
    'k': [ { type: 'straight', x: 33, y: 20, w: 8, h: 65, label: '🪵' }, { type: 'straight', x: 41, y: 20, w: 22, h: 10, r: 45, label: '🪵' }, { type: 'straight', x: 41, y: 50, w: 22, h: 10, r: -45, label: '🪵' } ],
    'l': [ { type: 'straight', x: 46, y: 15, w: 8, h: 70, label: '🪵' } ],
    'm': [ { type: 'straight', x: 25, y: 40, w: 8, h: 45, label: '🪵' }, { type: 'arch', x: 33, y: 40, w: 20, h: 45, label: '🌿' }, { type: 'arch', x: 53, y: 40, w: 20, h: 45, label: '🌿' } ]
};

// --- LETTER LAYOUT CENTERS ---
const LETTER_LAYOUT_CENTERS = [
    { cx: 40, cy: 30 }, { cx: 65, cy: 30 }, { cx: 90, cy: 30 },
    { cx: 40, cy: 75 }, { cx: 65, cy: 75 }, { cx: 90, cy: 75 }
];
