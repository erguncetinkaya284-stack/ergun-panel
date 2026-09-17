    // ================= OYUN HAVALARI & MÜZİK =================
    let oyunHavalari = [];
    let oyunIdCounter = 1;
    let editingOyunId = null;

    function escapeOyunText(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function saveOyunHavasi() {
        const title = document.getElementById('oyun-title').value.trim();
        const region = document.getElementById('oyun-region').value.trim();
        const type = document.getElementById('oyun-type').value.trim();
        const youtube = document.getElementById('oyun-youtube').value.trim();
        const status = document.getElementById('oyun-status').value;

        if (!title) { alert('Oyun havası adı boş olamaz.'); return; }

        if (editingOyunId !== null) {
            const item = oyunHavalari.find(song => song.id === editingOyunId);
            if (item) Object.assign(item, { title, region, type, youtube, status });
            editingOyunId = null;
            document.getElementById('oyun-save-btn').innerText = 'Kaydet';
        } else {
            oyunHavalari.push({
                id: oyunIdCounter++, title, region, type, youtube, status,
                favorite: false,
                listenedDate: null
            });
        }

        clearOyunForm();
        renderOyunHavalari();
    }

    function clearOyunForm() {
        document.getElementById('oyun-title').value = '';
        document.getElementById('oyun-region').value = '';
        document.getElementById('oyun-type').value = '';
        document.getElementById('oyun-youtube').value = '';
        document.getElementById('oyun-status').value = 'Dinlendi';
    }

    function editOyunHavasi(id) {
        const item = oyunHavalari.find(song => song.id === id);
        if (!item) return;
        document.getElementById('oyun-title').value = item.title || '';
        document.getElementById('oyun-region').value = item.region || '';
        document.getElementById('oyun-type').value = item.type || '';
        document.getElementById('oyun-youtube').value = item.youtube || '';
        document.getElementById('oyun-status').value = item.status || 'Dinlendi';
        editingOyunId = id;
        document.getElementById('oyun-save-btn').innerText = 'Güncelle';
        document.getElementById('oyun-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function deleteOyunHavasi(id) {
        if (!confirm('Bu oyun havası silinecek. Emin misin?')) return;
        oyunHavalari = oyunHavalari.filter(song => song.id !== id);
        if (editingOyunId === id) {
            editingOyunId = null;
            document.getElementById('oyun-save-btn').innerText = 'Kaydet';
            clearOyunForm();
        }
        renderOyunHavalari();
    }

    function toggleOyunFavorite(id) {
        const item = oyunHavalari.find(song => song.id === id);
        if (!item) return;
        item.favorite = !item.favorite;
        renderOyunHavalari();
    }

    function markOyunListened(id) {
        const item = oyunHavalari.find(song => song.id === id);
        if (!item) return;
        item.listenedDate = todayStr();
        renderOyunHavalari();
    }

    function addOyunToDailyProgram(id) {
        const item = oyunHavalari.find(song => song.id === id);
        if (item) addToDailyProgram(item.title);
    }

    function renderOyunHavalari() {
        const wrap = document.getElementById('oyun-list');
        if (!wrap) return;

        const search = (document.getElementById('oyun-search')?.value || '').trim().toLocaleLowerCase('tr-TR');
        const filter = document.getElementById('oyun-filter')?.value || 'all';
        const today = todayStr();
        const filtered = oyunHavalari.filter(item => {
            const searchable = `${item.title} ${item.region || ''} ${item.type || ''}`.toLocaleLowerCase('tr-TR');
            const matchesSearch = !search || searchable.includes(search);
            const matchesFilter = filter === 'all'
                || (filter === 'favorites' && item.favorite)
                || item.status === filter;
            return matchesSearch && matchesFilter;
        });

        document.getElementById('oyun-count').innerText = oyunHavalari.length + ' kayıt';
        if (!filtered.length) {
            wrap.innerHTML = oyunHavalari.length
                ? '<span style="color:var(--text-muted); font-size:0.85rem;">Filtreye uygun kayıt bulunamadı.</span>'
                : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz oyun havası eklenmedi.</span>';
            return;
        }

        wrap.innerHTML = filtered.map(item => {
            const listenedToday = item.listenedDate === today;
            const meta = [item.region, item.type].filter(Boolean).map(escapeOyunText).join(' · ');
            const youtube = item.youtube
                ? `<a class="btn-action" href="${escapeOyunText(item.youtube)}" target="_blank" rel="noopener">▶ YouTube</a>`
                : '';
            return `
                <div class="prayer-card oyun-card ${listenedToday ? 'done-today' : ''}">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                        <strong>${escapeOyunText(item.title)}</strong>
                        <button class="btn-action oyun-favorite" onclick="toggleOyunFavorite(${item.id})" aria-label="Favori">${item.favorite ? '★' : '☆'}</button>
                    </div>
                    ${meta ? `<div class="oyun-card-meta">${meta}</div>` : ''}
                    <div class="oyun-card-meta"><span class="category-tag">${escapeOyunText(item.status || 'Dinlendi')}</span></div>
                    <div class="oyun-card-actions">
                        ${youtube}
                        <button class="btn-action" onclick="markOyunListened(${item.id})">${listenedToday ? '✓ Bugün dinlendi' : 'Bugün dinledim'}</button>
                        <button class="btn-action" onclick="addOyunToDailyProgram(${item.id})">📅 Günlük Programa Ekle</button>
                        <button class="btn-action" onclick="editOyunHavasi(${item.id})">Düzenle</button>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="deleteOyunHavasi(${item.id})">Sil</button>
                    </div>
                </div>`;
        }).join('');
    }

