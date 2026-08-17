        // ================= TEKSTİL STOK TAKİBİ =================
        let tekstilBrands = [];
        let tekstilSizes = [];
        let tekstilSeasons = [];
        let tekstilVariants = [];
        let tekstilProducts = []; // {id, brand, size, season, variant, price, stock}
        let tekstilIdCounter = 1;

        const TEKSTIL_CAT_CONFIG = {
            brand: { input: 'new-tekstil-brand', list: 'tekstil-brand-list', select: 'tekstil-brand', tagClass: 'lang-tag' },
            size: { input: 'new-tekstil-size', list: 'tekstil-size-list', select: 'tekstil-size', tagClass: 'type-tag' },
            season: { input: 'new-tekstil-season', list: 'tekstil-season-list', select: 'tekstil-season', tagClass: '' },
            variant: { input: 'new-tekstil-variant', list: 'tekstil-variant-list', select: 'tekstil-variant', tagClass: 'lang-tag' }
        };

        function getTekstilList(kind) {
            if (kind === 'brand') return tekstilBrands;
            if (kind === 'size') return tekstilSizes;
            if (kind === 'season') return tekstilSeasons;
            return tekstilVariants;
        }

        function setTekstilList(kind, list) {
            if (kind === 'brand') tekstilBrands = list;
            else if (kind === 'size') tekstilSizes = list;
            else if (kind === 'season') tekstilSeasons = list;
            else tekstilVariants = list;
        }

        function addTekstilCategory(kind) {
            const cfg = TEKSTIL_CAT_CONFIG[kind];
            const input = document.getElementById(cfg.input);
            const value = input.value.trim();
            if (!value) return;
            const list = getTekstilList(kind);
            if (list.includes(value)) { input.value = ''; return; }
            list.push(value);
            input.value = '';
            renderTekstilCategories();
            renderTekstilCategoryOptions();
        }

        function removeTekstilCategory(kind, value) {
            const list = getTekstilList(kind).filter(c => c !== value);
            setTekstilList(kind, list);
            renderTekstilCategories();
            renderTekstilCategoryOptions();
        }

        function renderTekstilCategories() {
            Object.keys(TEKSTIL_CAT_CONFIG).forEach(kind => {
                const cfg = TEKSTIL_CAT_CONFIG[kind];
                const list = getTekstilList(kind);
                const wrap = document.getElementById(cfg.list);
                wrap.innerHTML = list.map(c => `
                    <span class="category-tag ${cfg.tagClass}">${c}<button onclick="removeTekstilCategory('${kind}', '${c.replace(/'/g, "\\'")}')">✕</button></span>
                `).join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz eklenmedi.</span>';
            });
        }

        function renderTekstilCategoryOptions() {
            Object.keys(TEKSTIL_CAT_CONFIG).forEach(kind => {
                const cfg = TEKSTIL_CAT_CONFIG[kind];
                const list = getTekstilList(kind);
                const select = document.getElementById(cfg.select);
                select.innerHTML = list.length
                    ? list.map(c => `<option value="${c}">${c}</option>`).join('')
                    : '<option value="">Önce kategori ekle</option>';
            });
        }

        function addTekstilProduct() {
            const brand = document.getElementById('tekstil-brand').value;
            const size = document.getElementById('tekstil-size').value;
            const season = document.getElementById('tekstil-season').value;
            const variant = document.getElementById('tekstil-variant').value;
            const price = parseFloat(document.getElementById('tekstil-price').value.replace(',', '.')) || 0;
            const stock = parseInt(document.getElementById('tekstil-stock').value) || 0;

            if (!variant) { alert('Önce bir varyant kategorisi seç (Şapka, Çorap...).'); return; }
            if (!price) { alert('Fiyat girmelisin.'); return; }

            tekstilProducts.push({ id: tekstilIdCounter++, brand, size, season, variant, price, stock });

            document.getElementById('tekstil-price').value = '';
            document.getElementById('tekstil-stock').value = '1';
            renderTekstil();
        }

        function changeTekstilStock(id, change) {
            const p = tekstilProducts.find(x => x.id === id);
            if (!p) return;
            p.stock = Math.max(0, p.stock + change);
            renderTekstil();
        }

        function removeTekstilProduct(id) {
            tekstilProducts = tekstilProducts.filter(p => p.id !== id);
            renderTekstil();
        }

        function renderTekstilProductCard(p) {
            const value = p.price * p.stock;
            const catsHtml = [
                p.brand ? `<span class="category-tag lang-tag">${p.brand}</span>` : '',
                p.size ? `<span class="category-tag type-tag">${p.size}</span>` : '',
                p.season ? `<span class="category-tag">${p.season}</span>` : ''
            ].join('');

            return `
            <div class="prayer-card">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
                    <strong>${p.variant}</strong>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeTekstilProduct(${p.id})">Sil</button>
                </div>
                <div class="recipe-cats">${catsHtml}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <span style="font-size:0.85rem;">Fiyat: ${p.price.toLocaleString('tr-TR')} ₺</span>
                    <div class="counter-group">
                        <button class="btn-ctrl btn-minus" onclick="changeTekstilStock(${p.id}, -1)">-</button>
                        <span class="counter-value">${p.stock}</span>
                        <button class="btn-ctrl btn-plus" onclick="changeTekstilStock(${p.id}, 1)">+</button>
                    </div>
                </div>
                <div style="text-align:right; font-weight:600; font-size:0.9rem;">Stok Değeri: ${value.toLocaleString('tr-TR')} ₺</div>
            </div>`;
        }

        function renderTekstil() {
            renderTekstilCategories();
            renderTekstilCategoryOptions();

            const listWrap = document.getElementById('tekstil-list');
            listWrap.innerHTML = tekstilProducts.length
                ? tekstilProducts.map(renderTekstilProductCard).join('')
                : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz ürün eklenmedi.</span>';

            const brandMap = {};
            tekstilProducts.forEach(p => {
                const key = p.brand || 'Markasız';
                if (!brandMap[key]) brandMap[key] = { count: 0, value: 0 };
                brandMap[key].count += p.stock;
                brandMap[key].value += p.price * p.stock;
            });
            const brandKeys = Object.keys(brandMap);
            const summaryWrap = document.getElementById('tekstil-brand-summary');
            summaryWrap.innerHTML = brandKeys.length ? brandKeys.map(b => `
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding:5px 0; border-bottom:1px solid var(--border-color);">
                    <span>${b}</span>
                    <span>${brandMap[b].count.toLocaleString('tr-TR')} adet — ${brandMap[b].value.toLocaleString('tr-TR')} ₺</span>
                </div>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz ürün eklenmedi.</span>';

            const totalCount = tekstilProducts.reduce((s, p) => s + p.stock, 0);
            const totalValue = tekstilProducts.reduce((s, p) => s + p.price * p.stock, 0);
            document.getElementById('tekstil-total').innerText = `Toplam Ürün: ${totalCount.toLocaleString('tr-TR')} adet — Toplam Değer: ${totalValue.toLocaleString('tr-TR')} ₺`;
            document.getElementById('tekstil-count').innerText = `${tekstilProducts.length} çeşit, ${totalCount.toLocaleString('tr-TR')} adet`;
        }

