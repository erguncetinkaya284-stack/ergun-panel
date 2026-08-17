        // ================= KRİPTO & YATIRIM TAKİBİ =================
        let yatirimCategories = [];
        let yatirimItems = []; // {id, category, amount, buyPrice, currentPrice}
        let yatirimItemIdCounter = 1;
        let yatirimNotes = '';

        function addYatirimCategory() {
            const input = document.getElementById('new-yatirim-category');
            const value = input.value.trim();
            if (!value) return;
            if (yatirimCategories.includes(value)) { input.value = ''; return; }
            yatirimCategories.push(value);
            input.value = '';
            renderYatirim();
        }

        function removeYatirimCategory(value) {
            yatirimCategories = yatirimCategories.filter(c => c !== value);
            renderYatirim();
        }

        function renderYatirimCategoryTags() {
            const wrap = document.getElementById('yatirim-category-list');
            wrap.innerHTML = yatirimCategories.length ? yatirimCategories.map(c => `
                <span class="category-tag lang-tag">${c}<button onclick="removeYatirimCategory('${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz varlık türü eklenmedi.</span>';

            const select = document.getElementById('yatirim-item-category');
            select.innerHTML = yatirimCategories.length
                ? yatirimCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce varlık türü ekle</option>';

            const catSet = new Set(yatirimCategories);
            yatirimItems.forEach(i => catSet.add(i.category));
            return Array.from(catSet);
        }

        function addYatirimItem() {
            const category = document.getElementById('yatirim-item-category').value;
            const amount = parseFloat(document.getElementById('yatirim-item-amount').value.replace(',', '.')) || 0;
            const buyPrice = parseFloat(document.getElementById('yatirim-item-buy-price').value.replace(/\./g, '').replace(',', '.')) || 0;
            const currentPrice = parseFloat(document.getElementById('yatirim-item-current-price').value.replace(/\./g, '').replace(',', '.')) || 0;

            if (!category) { alert('Önce bir varlık türü seç.'); return; }
            if (!amount) { alert('Miktar girmelisin.'); return; }
            if (!buyPrice) { alert('Alış fiyatı girmelisin.'); return; }

            yatirimItems.push({ id: yatirimItemIdCounter++, category, amount, buyPrice, currentPrice: currentPrice || buyPrice });
            document.getElementById('yatirim-item-amount').value = '';
            document.getElementById('yatirim-item-buy-price').value = '';
            document.getElementById('yatirim-item-current-price').value = '';
            renderYatirim();
        }

        function removeYatirimItem(id) {
            yatirimItems = yatirimItems.filter(i => i.id !== id);
            renderYatirim();
        }

        function updateYatirimCurrentPrice(id) {
            const input = document.getElementById('yatirim-update-price-' + id);
            const price = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
            if (!price) { alert('Geçerli bir fiyat gir.'); return; }
            const item = yatirimItems.find(i => i.id === id);
            if (!item) return;
            item.currentPrice = price;
            renderYatirim();
        }

        function renderYatirimItemCard(item) {
            const cost = item.amount * item.buyPrice;
            const currentValue = item.amount * item.currentPrice;
            const profit = currentValue - cost;
            const profitPct = cost ? (profit / cost * 100) : 0;
            const isProfit = profit >= 0;
            return `
            <div class="prayer-card">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                    <strong>${item.category}</strong>
                    <span class="category-tag" style="background:${isProfit ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)'}; border-color:${isProfit ? 'rgba(46,204,113,0.4)' : 'rgba(231,76,60,0.4)'}; color:${isProfit ? 'var(--accent-green)' : 'var(--accent-red)'};">${isProfit ? '+' : ''}${profit.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺ (${isProfit ? '+' : ''}${profitPct.toFixed(1)}%)</span>
                </div>
                <div style="font-size:0.85rem; display:flex; flex-wrap:wrap; gap:10px; margin-top:4px;">
                    <span>Miktar: ${item.amount.toLocaleString('tr-TR')}</span>
                    <span>Alış: ${item.buyPrice.toLocaleString('tr-TR')} ₺</span>
                    <span>Güncel: ${item.currentPrice.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div class="form-row" style="margin-top:8px;">
                    <input type="text" id="yatirim-update-price-${item.id}" placeholder="Yeni güncel fiyat">
                    <button class="btn-action" onclick="updateYatirimCurrentPrice(${item.id})">Fiyatı Güncelle</button>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeYatirimItem(${item.id})">Sil</button>
                </div>
            </div>`;
        }

        function renderYatirimList(allCategories) {
            const wrap = document.getElementById('yatirim-list');
            wrap.innerHTML = allCategories.length ? allCategories.map(cat => {
                const items = yatirimItems.filter(i => i.category === cat);
                return `
                <div style="margin-bottom:16px;">
                    <h4 style="font-size:0.95rem; margin-bottom:8px; color:var(--accent-blue);">${cat}</h4>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${items.length ? items.map(renderYatirimItemCard).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Bu türde henüz yatırım eklenmedi.</span>'}
                    </div>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz varlık türü eklenmedi.</span>';
        }

        function saveYatirimNotes(value) {
            yatirimNotes = value;
            scheduleSave();
        }

        function renderYatirim() {
            const allCategories = renderYatirimCategoryTags();
            renderYatirimList(allCategories);

            const totalCost = yatirimItems.reduce((s, i) => s + i.amount * i.buyPrice, 0);
            const totalValue = yatirimItems.reduce((s, i) => s + i.amount * i.currentPrice, 0);
            const totalProfit = totalValue - totalCost;
            const isProfit = totalProfit >= 0;

            document.getElementById('yatirim-total').innerHTML =
                `Toplam Maliyet: ${totalCost.toLocaleString('tr-TR')} ₺ — Güncel Değer: ${totalValue.toLocaleString('tr-TR')} ₺ — Kâr/Zarar: <span style="color:${isProfit ? 'var(--accent-green)' : 'var(--accent-red)'}">${isProfit ? '+' : ''}${totalProfit.toLocaleString('tr-TR')} ₺</span>`;
            document.getElementById('yatirim-count').innerText = `${yatirimItems.length} varlık`;

            const notesEl = document.getElementById('yatirim-notes');
            if (notesEl && document.activeElement !== notesEl) notesEl.value = yatirimNotes || '';
        }

