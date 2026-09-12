// ================= ANA SAYFA: MODÜL LİSTESİ + YÖNETİCİ PANELİ =================

// Tüm modüllerin sabit tanımı (href, başlık, arama metni, alıntı). Sıra burada
// varsayılan sırayı belirler; gerçek görüntülenen sıra moduleOrder ile kontrol edilir.
const MODULES = [
    { key: 'ibadet', href: 'ibadet.html', title: '🕌 İbadet Takibi', search: '🕌 i̇badet takibi', quote: '“Her secde, huzura atılan bir adımdır.”' },
    { key: 'gunluk', href: 'gunluk.html', title: '⏰🔥 Günlük Program & Alışkanlık Takibi', search: '⏰🔥 günlük program & alışkanlık takibi', quote: '“Küçük alışkanlıklar, büyük hayatları inşa eder.”' },
    { key: 'fitness', href: 'fitness.html', title: '💪 Fitness Takibi', search: '💪 fitness takibi', quote: '“Bugün ter dök, yarın gururlan.”' },
    { key: 'spor', href: 'spor.html', title: '🏋️ Spor Takibi', search: '🏋️ spor takibi', quote: '“Disiplin, yetenekten daha çok kazandırır.”' },
    { key: 'dovus', href: 'dovus.html', title: '🥋 Dövüş / Teknik Takibi', search: '🥋 dövüş / teknik takibi', quote: '“Her tekrar, ustalığa bir adım daha yaklaştırır.”' },
    { key: 'kpss', href: 'kpss.html', title: '📚 KPSS Takibi', search: '📚 kpss takibi', quote: '“Bugünün emeği, yarının makamı.”' },
    { key: 'ders', href: 'ders.html', title: '📖 Ders Takibi', search: '📖 ders takibi', quote: '“Her ders, bir basamak daha yukarı taşır.”' },
    { key: 'yks', href: 'yks.html', title: '🎓 YKS Takibi', search: '🎓 yks takibi', quote: '“Bir sayfa daha, hedefe bir adım daha.”' },
    { key: 'dil', href: 'dil.html', title: '🌍 Yabancı Dil Takibi', search: '🌍 yabancı dil takibi', quote: '“Yeni bir kelime, yeni bir kapı demektir.”' },
    { key: 'tarif', href: 'tarif.html', title: '👨‍🍳 Tarif Defteri', search: '👨‍🍳 tarif defteri', quote: '“Emekle pişen yemek, gönülden gönüle gider.”' },
    { key: 'enstruman', href: 'enstruman.html', title: '🎸 Enstrüman & Ders Takibi', search: '🎸 enstrüman & ders takibi', quote: '“Her nota, sabrın bir karşılığıdır.”' },
    { key: 'tasarim', href: 'tasarim.html', title: '🎨 Tasarım Programları Öğreniyorum', search: '🎨 tasarım programları öğreniyorum', quote: '“Öğrenmeye devam eden, geride kalmaz.”' },
    { key: 'oyun', href: 'oyun.html', title: '🎶 Oyun Havaları & Müzik', search: '🎶 oyun havaları & müzik', quote: '“Müzik ruhun dinlenme molasıdır.”' },
    { key: 'tarim', href: 'tarim.html', title: '🌾 Tarım Takibi', search: '🌾 tarım takibi', quote: '“Toprağa emek ver, bereketi bekle.”' },
    { key: 'blog', href: 'blog.html', title: '📰 Blog', search: '📰 blog', quote: '“Yazdığın her satır, düşüncene kalıcılık katar.”' },
    { key: 'kitap', href: 'kitap.html', title: '📕 Kitap', search: '📕 kitap', quote: '“Okuyan zihin, hiç durmadan büyür.”' },
    { key: 'siir', href: 'siir.html', title: '✒️ Şiir', search: '✒️ şiir', quote: '“Kelimeler, söylenemeyeni taşır.”' },
    { key: 'yazilim', href: 'yazilim.html', title: '💻 Yazılım Projeleri', search: '💻 yazılım projeleri', quote: '“Her satır kod, bir problemin çözümüdür.”' },
    { key: 'kiraathane', href: 'kiraathane.html', title: '☕ Kıraathane & Satış Yönetimi', search: '☕ kıraathane & satış yönetimi', quote: '“Küçük işletme, büyük emekle büyür.”' },
    { key: 'cari', href: 'cari.html', title: '📒 Cari Hesap (Müşteri Borç/Alacak)', search: '📒 cari hesap (müşteri borç/alacak)', quote: '“Düzenli hesap, güvenli ticaret demektir.”' },
    { key: 'yatirim', href: 'yatirim.html', title: '₿ Kripto & Yatırım Takibi', search: '₿ kripto & yatırım takibi', quote: '“Sabırlı yatırımcı, kazanan yatırımcıdır.”' },
    { key: 'sut', href: 'sut.html', title: '🥛 Süt Stok ve Satış Takibi', search: '🥛 süt stok ve satış takibi', quote: '“Taze takip, taze kazanç getirir.”' },
    { key: 'manav', href: 'manav.html', title: '🥬 Manav Stok ve Satış Takibi', search: '🥬 manav stok ve satış takibi', quote: '“Bereket, düzenli emekle gelir.”' },
    { key: 'et', href: 'et.html', title: '🥩 Et Stok ve Satış Takibi', search: '🥩 et stok ve satış takibi', quote: '“Kaliteli iş, güvenilir takiple olur.”' },
    { key: 'tekstil', href: 'tekstil.html', title: '👕 Tekstil Stok Takibi', search: '👕 tekstil stok takibi', quote: '“Düzenli stok, kesintisiz kazanç demektir.”' },
    { key: 'teknoloji', href: 'teknoloji.html', title: '💻 Teknoloji Çantası', search: '💻 teknoloji çantası', quote: '“Doğru araç, doğru işi kolaylaştırır.”' },
    { key: 'arac', href: 'arac.html', title: '🚜 Motorlu Araç ve Ekipman Takibi', search: '🚜 motorlu araç ve ekipman takibi', quote: '“Bakımlı makine, uzun ömürlü yatırımdır.”' },
    { key: 'gayrimenkul', href: 'gayrimenkul.html', title: '🏠 Gayrimenkul Takibi (500 Ev / 500 Dükkan)', search: '🏠 gayrimenkul takibi (500 ev / 500 dükkan)', quote: '“Bugün ekilen, yarın kira olur.”' },
    { key: 'suru', href: 'suru.html', title: '🐂 Sürü / Besi Takibi', search: '🐂 sürü / besi takibi', quote: '“Sabırla beslenen, bereketle döner.”' }
];

// Bu şifreyi değiştirmek istersen doğrudan bu satırı düzenleyip repoya kaydet.
// NOT: Bu statik bir site olduğu için gerçek bir güvenlik katmanı değildir, sadece
// panelin ayarlarına hızlı erişimi engelleyen basit bir kilittir.
const ADMIN_PASSWORD = 'ergun2026';

function isAdminLoggedIn() {
    return sessionStorage.getItem('ergun_admin') === '1';
}

function adminLogin() {
    const input = document.getElementById('admin-password-input');
    if (input.value === ADMIN_PASSWORD) {
        sessionStorage.setItem('ergun_admin', '1');
        renderAdminPanel();
    } else {
        alert('Şifre yanlış.');
    }
}

function adminLogout() {
    sessionStorage.removeItem('ergun_admin');
    renderAdminPanel();
}

function toggleAdminPanel() {
    const panel = document.getElementById('admin-panel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) renderAdminPanel();
}

// moduleOrder içinde eksik olan (örn. yeni eklenmiş) modülleri sona ekler,
// artık var olmayanları temizler.
function ensureModuleOrderState() {
    MODULES.forEach(m => {
        if (!moduleOrder.includes(m.key)) moduleOrder.push(m.key);
    });
    moduleOrder = moduleOrder.filter(key => MODULES.some(m => m.key === key));
}

function isModuleVisible(key) {
    return moduleVisibility[key] !== false;
}

function toggleModuleVisibility(key, checked) {
    moduleVisibility[key] = checked;
    renderModuleCards();
}

function moveModule(key, direction) {
    ensureModuleOrderState();
    const idx = moduleOrder.indexOf(key);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= moduleOrder.length) return;
    const tmp = moduleOrder[idx];
    moduleOrder[idx] = moduleOrder[newIdx];
    moduleOrder[newIdx] = tmp;
    renderAdminPanel();
    renderModuleCards();
}

function renderAdminPanel() {
    const wrap = document.getElementById('admin-panel-content');
    if (!wrap) return;

    if (!isAdminLoggedIn()) {
        wrap.innerHTML = `
            <div class="admin-login-row">
                <input type="password" id="admin-password-input" placeholder="Yönetici şifresi" onkeydown="if(event.key==='Enter') adminLogin()">
                <button class="btn-action btn-primary" onclick="adminLogin()">Giriş Yap</button>
            </div>`;
        return;
    }

    ensureModuleOrderState();
    wrap.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
            <strong>⚙️ Modül Görünürlüğü ve Sırası</strong>
            <button class="btn-action" onclick="adminLogout()">Çıkış Yap</button>
        </div>
        <div class="admin-module-list">
            ${moduleOrder.map((key, i) => {
                const m = MODULES.find(mm => mm.key === key);
                if (!m) return '';
                const visible = isModuleVisible(key);
                return `
                <div class="admin-module-row">
                    <label class="done-check" style="flex:1;">
                        <input type="checkbox" ${visible ? 'checked' : ''} onchange="toggleModuleVisibility('${key}', this.checked)">
                        ${m.title}
                    </label>
                    <button class="btn-action" onclick="moveModule('${key}', -1)" ${i === 0 ? 'disabled' : ''}>↑</button>
                    <button class="btn-action" onclick="moveModule('${key}', 1)" ${i === moduleOrder.length - 1 ? 'disabled' : ''}>↓</button>
                </div>`;
            }).join('')}
        </div>`;
}

function renderModuleCards() {
    const grid = document.getElementById('nav-grid');
    if (!grid) return;
    ensureModuleOrderState();
    grid.innerHTML = moduleOrder
        .filter(key => isModuleVisible(key))
        .map(key => {
            const m = MODULES.find(mm => mm.key === key);
            if (!m) return '';
            return `
            <a class="nav-card" href="${m.href}" data-search="${m.search}">
                <div class="nav-card-row">
                    <div class="nav-card-title">${m.title}</div>
                    <div class="nav-card-open">Aç →</div>
                </div>
                <div class="nav-card-quote">${m.quote}</div>
            </a>`;
        }).join('');
}

// ---- Arama ----
function filterModules() {
    const q = document.getElementById('global-search').value.trim().toLowerCase();
    document.querySelectorAll('.nav-card').forEach(card => {
        const text = card.getAttribute('data-search') || '';
        card.classList.toggle('hidden', !!q && !text.includes(q));
    });
}

// ---- Banner ----
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

document.addEventListener('DOMContentLoaded', function() {
    showRandomBanner();
    renderModuleCards(); // Veriler yüklenmeden önce ilk (varsayılan) görünümle göster
    loadAllData()
        .then(function() { renderModuleCards(); renderAdminPanel(); })
        .catch(function(e) { /* veri yüklenemese bile hepsi görünür halde çalışmaya devam eder */ })
        .finally(function() { loadModuleStates(); });
});
