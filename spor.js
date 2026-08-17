        // ================= SPOR TAKİBİ =================
        let sporVariants = [];
        let sporItems = []; // {id, title, variant, sets, note}
        let editingSporId = null;
        let sporIdCounter = 1;

        function addSporVariant() {
            const input = document.getElementById('new-spor-variant');
            const value = input.value.trim();
            if (!value) return;
            if (sporVariants.includes(value)) { input.value = ''; return; }
            sporVariants.push(value);
            input.value = '';
            renderSporVariants();
        }

        function removeSporVariant(value) {
            sporVariants = sporVariants.filter(v => v !== value);
            renderSporVariants();
        }

        function renderSporVariants() {
            const wrap = document.getElementById('spor-variant-list');
            wrap.innerHTML = sporVariants.length ? sporVariants.map(v => `
                <span class="category-tag">${v}<button onclick="removeSporVariant('${v.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz varyant eklenmedi.</span>';

            const select = document.getElementById('spor-variant');
            select.innerHTML = sporVariants.length
                ? sporVariants.map(v => `<option value="${v}">${v}</option>`).join('')
                : '<option value="">Önce varyant ekle</option>';
        }

        function saveSporItem() {
            const title = document.getElementById('spor-title').value.trim();
            const variant = document.getElementById('spor-variant').value;
            const note = document.getElementById('spor-note').value.trim();

            if (!title) { alert('Antrenman adı gir.'); return; }

            if (editingSporId !== null) {
                const item = sporItems.find(i => i.id === editingSporId);
                if (item) {
                    item.title = title;
                    item.variant = variant;
                    item.note = note;
                }
                editingSporId = null;
                document.getElementById('spor-save-btn').innerText = 'Kaydet';
            } else {
                sporItems.push({
                    id: sporIdCounter++,
                    title,
                    variant,
                    sets: 1,
                    note
                });
            }

            document.getElementById('spor-title').value = '';
            document.getElementById('spor-note').value = '';
            renderSporItems();
        }

        function editSporItem(id) {
            const item = sporItems.find(i => i.id === id);
            if (!item) return;
            document.getElementById('spor-title').value = item.title;
            document.getElementById('spor-variant').value = item.variant;
            document.getElementById('spor-note').value = item.note;
            editingSporId = id;
            document.getElementById('spor-save-btn').innerText = 'Güncelle';
            document.getElementById('module-spor').querySelector('.recipe-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function deleteSporItem(id) {
            sporItems = sporItems.filter(i => i.id !== id);
            if (editingSporId === id) {
                editingSporId = null;
                document.getElementById('spor-save-btn').innerText = 'Kaydet';
            }
            renderSporItems();
        }

        function changeSporSets(id, change) {
            const item = sporItems.find(i => i.id === id);
            if (!item) return;
            item.sets = Math.max(0, item.sets + change);
            renderSporItems();
        }

        function renderSporItems() {
            const wrap = document.getElementById('spor-list');
            document.getElementById('spor-count').innerText = sporItems.length + ' antrenman';

            wrap.innerHTML = sporItems.length ? sporItems.map(i => {
                const catHtml = i.variant ? `<span class="category-tag">${i.variant}</span>` : '';
                const noteHtml = i.note ? `<div style="font-size:0.85rem; color:var(--text-muted); white-space:pre-wrap;">${i.note.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</div>` : '';
                return `
                <div class="prayer-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                        <strong>${i.title}</strong>
                        ${catHtml}
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <span style="font-size:0.85rem;">Set Sayısı:</span>
                        <div class="counter-group">
                            <button class="btn-ctrl btn-minus" onclick="changeSporSets(${i.id}, -1)">-</button>
                            <span class="counter-value">${i.sets}</span>
                            <button class="btn-ctrl btn-plus" onclick="changeSporSets(${i.id}, 1)">+</button>
                        </div>
                    </div>
                    ${noteHtml}
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button class="btn-action" onclick="addToDailyProgram('${i.title.replace(/'/g, "\\'")}')">📅 Günlük Programa Ekle</button>
                        <button class="btn-action" onclick="editSporItem(${i.id})">Düzenle</button>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="deleteSporItem(${i.id})">Sil</button>
                    </div>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz antrenman eklenmedi.</span>';
        }

        function renderSpor() {
            renderSporVariants();
            renderSporItems();
        }

