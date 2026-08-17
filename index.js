function filterModules() {
    const q = document.getElementById('global-search').value.trim().toLowerCase();
    document.querySelectorAll('.nav-card').forEach(card => {
        const text = card.getAttribute('data-search') || '';
        card.classList.toggle('hidden', !!q && !text.includes(q));
    });
}

const BANNER_QUOTES = [
    "Hayaller, planla gerçeğe döner.",
    "Bugün attığın adım, yarının temelidir.",
    "Düzen kur, huzuru bul.",
    "Emek boşa gitmez, sabret.",
    "Küçük başlangıçlar, büyük sonuçlar doğurur.",
    "Her gün bir adım, yıl sonunda bir yol.",
    "Kazanmak isteyen, önce disiplinli olur.",
    "Bereket, çalışanın kapısını çalar.",
    "Bugünün emeği, yarının rahatlığıdır.",
    "Hedefini yaz, adımını at."
];

function showRandomBanner() {
    const el = document.getElementById('quote-banner');
    if (!el) return;
    const q = BANNER_QUOTES[Math.floor(Math.random() * BANNER_QUOTES.length)];
    el.textContent = '“' + q + '”';
}

document.addEventListener('DOMContentLoaded', showRandomBanner);
