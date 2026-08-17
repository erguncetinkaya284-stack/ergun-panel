        // ================= TEKNOLOJİ ÇANTASI =================
        let teknolojiCategories = [];
        let teknolojiItems = []; // {id, category, name, price, status: 'sahip' | 'hedef'}
        let teknolojiItemIdCounter = 1;

        function addTeknolojiCategory() {
            const input = document.getElementById('new-teknoloji-category');
            const value = input.value.trim();
            if (!value) return;
            if (teknolojiCategories.includes(value)) { input.value = ''; return; }
            teknolojiCategories.push(value);
            input.value = '';
            renderTeknoloji();
        }

        function removeTeknolojiCategory(value) {
            teknolojiCategories = teknolojiCategories.filter(c => c !== value);
            renderTeknoloji();
        }

        function renderTeknolojiCategoryTags() {
            const wrap = document.getElementById('teknoloji-category-list');
            wrap.innerHTML = teknolojiCategories.length ? teknolojiCategories.map(c => `
                <span class="category-tag lang-tag">${c}<button onclick="removeTeknolojiCategory('${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz kategori eklenmedi.</span>';

            const select = document.getElementById('teknoloji-item-category');
            select.innerHTML = teknolojiCategories.length
                ? teknolojiCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce kategori ekle</option>';

            const catSet = new Set(teknolojiCategories);
            teknolojiItems.forEach(i => catSet.add(i.category));
            return Array.from(catSet);
        }

        function addTeknolojiItem() {
            const category = document.getElementById('teknoloji-item-category').value;
            const name = document.getElementById('teknoloji-item-name').value.trim();
            const price = parseFloat(document.getElementById('teknoloji-item-price').value.replace(/\./g, '').replace(',', '.')) || 0;
            const status = document.getElementById('teknoloji-item-status').value;
            if (!category) { alert('Önce bir kategori seç.'); return; }
            if (!name) { alert('Cihaz adı boş olamaz.'); return; }
            teknolojiItems.push({ id: teknolojiItemIdCounter++, category, name, price, status });
            document.getElementById('teknoloji-item-name').value = '';
            document.getElementById('teknoloji-item-price').value = '';
            renderTeknoloji();
        }

        function removeTeknolojiItem(id) {
            teknolojiItems = teknolojiItems.filter(i => i.id !== id);
            renderTeknoloji();
        }

        function renderTeknolojiItemCard(item) {
            const isSahip = item.status === 'sahip';
            return `
            <div class="prayer-card">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                    <strong>${item.name}</strong>
                    <span class="category-tag" style="background:${isSahip ? 'rgba(46,204,113,0.15)' : 'rgba(241,196,15,0.15)'}; border-color:${isSahip ? 'rgba(46,204,113,0.4)' : 'rgba(241,196,15,0.4)'}; color:${isSahip ? 'var(--accent-green)' : 'var(--accent-gold)'};">${isSahip ? 'Elimde Olan' : 'Hedef'}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <span style="font-size:0.85rem;">Fiyat: ${item.price.toLocaleString('tr-TR')} ₺</span>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeTeknolojiItem(${item.id})">Sil</button>
                </div>
            </div>`;
        }

        function renderTeknolojiList(allCategories) {
            const wrap = document.getElementById('teknoloji-list');
            wrap.innerHTML = allCategories.length ? allCategories.map(cat => {
                const items = teknolojiItems.filter(i => i.category === cat);
                return `
                <div style="margin-bottom:16px;">
                    <h4 style="font-size:0.95rem; margin-bottom:8px; color:var(--accent-blue);">${cat}</h4>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${items.length ? items.map(renderTeknolojiItemCard).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Bu kategoride henüz cihaz eklenmedi.</span>'}
                    </div>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz kategori eklenmedi.</span>';
        }

        function renderTeknolojiCategorySummary(allCategories) {
            const wrap = document.getElementById('teknoloji-category-summary');
            wrap.innerHTML = allCategories.length ? allCategories.map(cat => {
                const items = teknolojiItems.filter(i => i.category === cat);
                const sahipItems = items.filter(i => i.status === 'sahip');
                const hedefItems = items.filter(i => i.status === 'hedef');
                const sahipValue = sahipItems.reduce((s, i) => s + i.price, 0);
                const hedefValue = hedefItems.reduce((s, i) => s + i.price, 0);
                return `
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; padding:6px 0; border-bottom:1px solid var(--border-color); flex-wrap:wrap; gap:4px;">
                    <span><strong>${cat}</strong></span>
                    <span>Elimde Olan: ${sahipItems.length} adet — ${sahipValue.toLocaleString('tr-TR')} ₺ &nbsp;|&nbsp; Hedef: ${hedefItems.length} adet — ${hedefValue.toLocaleString('tr-TR')} ₺</span>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz cihaz eklenmedi.</span>';
        }

        function renderTeknoloji() {
            const allCategories = renderTeknolojiCategoryTags();
            renderTeknolojiList(allCategories);
            renderTeknolojiCategorySummary(allCategories);

            const sahipItems = teknolojiItems.filter(i => i.status === 'sahip');
            const hedefItems = teknolojiItems.filter(i => i.status === 'hedef');
            const sahipValue = sahipItems.reduce((s, i) => s + i.price, 0);
            const hedefValue = hedefItems.reduce((s, i) => s + i.price, 0);

            document.getElementById('teknoloji-total').innerText =
                `Elimde Olan Toplam Değer: ${sahipValue.toLocaleString('tr-TR')} ₺ (${sahipItems.length} adet) — Hedef Toplam Değer: ${hedefValue.toLocaleString('tr-TR')} ₺ (${hedefItems.length} adet)`;
            document.getElementById('teknoloji-count').innerText = `${teknolojiItems.length} cihaz`;
        }

