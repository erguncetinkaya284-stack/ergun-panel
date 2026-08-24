        // ================= ŞİİR =================
        let siirler = []; // {id, title, tag, content, createdAt}
        let siirIdCounter = 1;
        let editingSiirId = null;

        function saveSiir() {
            const title = document.getElementById('siir-title').value.trim();
            const tag = document.getElementById('siir-tag').value.trim();
            const content = document.getElementById('siir-content').value.trim();

            if (!title) { alert('Başlık boş olamaz.'); return; }
            if (!content) { alert('Şiir metni boş olamaz.'); return; }

            if (editingSiirId !== null) {
                const s = siirler.find(x => x.id === editingSiirId);
                if (s) { s.title = title; s.tag = tag; s.content = content; }
                editingSiirId = null;
                document.getElementById('siir-save-btn').innerText = 'Kaydet';
            } else {
                siirler.push({ id: siirIdCounter++, title, tag, content, createdAt: todayStr() });
            }

            document.getElementById('siir-title').value = '';
            document.getElementById('siir-tag').value = '';
            document.getElementById('siir-content').value = '';
            renderSiirList();
        }

        function editSiir(id) {
            const s = siirler.find(x => x.id === id);
            if (!s) return;
            document.getElementById('siir-title').value = s.title;
            document.getElementById('siir-tag').value = s.tag || '';
            document.getElementById('siir-content').value = s.content;
            editingSiirId = id;
            document.getElementById('siir-save-btn').innerText = 'Güncelle';
            document.querySelector('.recipe-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function deleteSiir(id) {
            if (!confirm('Bu şiiri silmek istediğine emin misin?')) return;
            siirler = siirler.filter(x => x.id !== id);
            if (editingSiirId === id) {
                editingSiirId = null;
                document.getElementById('siir-save-btn').innerText = 'Kaydet';
            }
            renderSiirList();
        }

        function renderSiirList() {
            const wrap = document.getElementById('siir-list');
            const countEl = document.getElementById('siir-count');
            if (!wrap) return;

            countEl.innerText = siirler.length + ' şiir';

            const query = (document.getElementById('siir-search').value || '').trim().toLowerCase();
            const filtered = query
                ? siirler.filter(s => s.title.toLowerCase().includes(query) || (s.tag || '').toLowerCase().includes(query))
                : siirler;

            if (!filtered.length) {
                wrap.innerHTML = `<span style="color:var(--text-muted); font-size:0.85rem;">${siirler.length ? 'Aramanla eşleşen şiir yok.' : 'Henüz şiir eklenmedi.'}</span>`;
                return;
            }

            const sorted = [...filtered].sort((a, b) => b.id - a.id);

            wrap.innerHTML = sorted.map(s => `
                <div class="recipe-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                        <h3 style="margin:0;">${s.title.replace(/</g, '&lt;')}</h3>
                        ${s.tag ? `<span class="category-tag">${s.tag.replace(/</g, '&lt;')}</span>` : ''}
                    </div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${s.createdAt || ''}</div>
                    <div class="recipe-content" style="white-space:pre-wrap; font-style:italic; line-height:1.7; margin-top:8px;">${s.content.replace(/</g, '&lt;')}</div>
                    <div class="recipe-actions">
                        <button class="btn-action" onclick="editSiir(${s.id})">Düzenle</button>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="deleteSiir(${s.id})">Sil</button>
                    </div>
                </div>
            `).join('');
        }
