        // ================= KIRAATHANE & SATIŞ YÖNETİMİ =================
        let productCatalog = [
            { id: 1, name: 'Çay', price: 10 },
            { id: 2, name: 'Kahve', price: 30 }
        ];
        let catalogIdCounter = 3;

        let salesTables = [];
        let tableIdCounter = 1;

        let salesTabs = []; // {id, name, tableId: null|id, items: [{id, name, price, qty}]}
        let tabIdCounter = 1;
        let itemIdCounter = 1;

        let kiraathaneUndoStack = [];

        function snapshotKiraathane() {
            kiraathaneUndoStack.push(JSON.stringify({ productCatalog, salesTables, salesTabs }));
            if (kiraathaneUndoStack.length > 30) kiraathaneUndoStack.shift();
        }

        function undoLastAction() {
            if (!kiraathaneUndoStack.length) { alert('Geri alınacak işlem yok.'); return; }
            const prev = JSON.parse(kiraathaneUndoStack.pop());
            productCatalog = prev.productCatalog;
            salesTables = prev.salesTables;
            salesTabs = prev.salesTabs;
            renderKiraathane();
        }

        function startNewDay() {
            if (!confirm('Yeni güne geçilsin mi? Ayakta müşteriler ve masalardaki tüm hesaplar silinecek (ürün kataloğu kalır).')) return;
            snapshotKiraathane();
            salesTabs = [];
            salesTables = [];
            renderKiraathane();
        }

        function addCatalogProduct() {
            const nameInput = document.getElementById('catalog-name');
            const priceInput = document.getElementById('catalog-price');
            const name = nameInput.value.trim();
            const price = parseFloat(priceInput.value.replace(',', '.')) || 0;
            if (!name) { alert('Ürün adı boş olamaz.'); return; }
            snapshotKiraathane();
            productCatalog.push({ id: catalogIdCounter++, name, price });
            nameInput.value = '';
            priceInput.value = '';
            renderKiraathane();
        }

        function removeCatalogProduct(id) {
            snapshotKiraathane();
            productCatalog = productCatalog.filter(p => p.id !== id);
            renderKiraathane();
        }

        function addStandingTab() {
            const input = document.getElementById('new-standing-name');
            const name = input.value.trim();
            if (!name) { alert('Müşteri adı boş olamaz.'); return; }
            snapshotKiraathane();
            salesTabs.push({ id: tabIdCounter++, name, tableId: null, items: [] });
            input.value = '';
            renderKiraathane();
        }

        function addTable() {
            const input = document.getElementById('new-table-name');
            const name = input.value.trim();
            if (!name) { alert('Masa adı boş olamaz.'); return; }
            snapshotKiraathane();
            salesTables.push({ id: tableIdCounter++, name });
            input.value = '';
            renderKiraathane();
        }

        function removeTable(id) {
            snapshotKiraathane();
            salesTables = salesTables.filter(t => t.id !== id);
            salesTabs.forEach(tab => { if (tab.tableId === id) tab.tableId = null; });
            renderKiraathane();
        }

        function removeTab(tabId) {
            snapshotKiraathane();
            salesTabs = salesTabs.filter(t => t.id !== tabId);
            renderKiraathane();
        }

        function transferTab(tabId, tableIdValue) {
            snapshotKiraathane();
            const tab = salesTabs.find(t => t.id === tabId);
            if (!tab) return;
            tab.tableId = tableIdValue === '' ? null : parseInt(tableIdValue);
            renderKiraathane();
        }

        function addItemToTab(tabId) {
            const nameInput = document.getElementById('item-name-' + tabId);
            const priceInput = document.getElementById('item-price-' + tabId);
            const qtyInput = document.getElementById('item-qty-' + tabId);
            const name = nameInput.value.trim();
            const price = parseFloat(priceInput.value.replace(',', '.')) || 0;
            const qty = parseInt(qtyInput.value) || 1;
            if (!name) { alert('Ürün adı boş olamaz.'); return; }
            snapshotKiraathane();
            const tab = salesTabs.find(t => t.id === tabId);
            if (!tab) return;
            tab.items.push({ id: itemIdCounter++, name, price, qty });
            renderKiraathane();
        }

        function changeItemQty(tabId, itemId, change) {
            snapshotKiraathane();
            const tab = salesTabs.find(t => t.id === tabId);
            if (!tab) return;
            const item = tab.items.find(i => i.id === itemId);
            if (!item) return;
            item.qty = Math.max(0, item.qty + change);
            renderKiraathane();
        }

        function removeItem(tabId, itemId) {
            snapshotKiraathane();
            const tab = salesTabs.find(t => t.id === tabId);
            if (!tab) return;
            tab.items = tab.items.filter(i => i.id !== itemId);
            renderKiraathane();
        }

        function tabTotal(tab) {
            return tab.items.reduce((sum, i) => sum + i.price * i.qty, 0);
        }

        function renderTabCard(tab) {
            const total = tabTotal(tab);
            const tableOptions = ['<option value="">Ayakta</option>']
                .concat(salesTables.map(t => `<option value="${t.id}" ${tab.tableId === t.id ? 'selected' : ''}>${t.name}</option>`))
                .join('');

            const itemsHtml = tab.items.length ? tab.items.map(i => `
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:4px 0; border-bottom:1px solid var(--border-color); font-size:0.85rem;">
                    <span style="flex:1;">${i.name}</span>
                    <div class="counter-group">
                        <button class="btn-ctrl btn-minus" onclick="changeItemQty(${tab.id}, ${i.id}, -1)">-</button>
                        <span class="counter-value">${i.qty}</span>
                        <button class="btn-ctrl btn-plus" onclick="changeItemQty(${tab.id}, ${i.id}, 1)">+</button>
                    </div>
                    <span style="min-width:70px; text-align:right;">${(i.price * i.qty).toLocaleString('tr-TR')} ₺</span>
                    <button class="btn-action" style="color:var(--accent-red); padding:2px 8px;" onclick="removeItem(${tab.id}, ${i.id})">✕</button>
                </div>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz ürün eklenmedi.</span>';

            return `
            <div class="prayer-card">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
                    <strong>${tab.name}</strong>
                    <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                        <select onchange="transferTab(${tab.id}, this.value)" style="background:#121212; border:1px solid var(--border-color); color:var(--text-main); padding:6px 8px; border-radius:4px; font-size:0.8rem;">
                            ${tableOptions}
                        </select>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="removeTab(${tab.id})">Sil</button>
                    </div>
                </div>
                <div>${itemsHtml}</div>
                <div class="form-row">
                    <input type="text" id="item-name-${tab.id}" list="catalog-datalist" placeholder="Ürün adı">
                    <input type="text" id="item-price-${tab.id}" placeholder="Fiyat" style="max-width:90px;">
                    <input type="text" id="item-qty-${tab.id}" value="1" placeholder="Adet" style="max-width:70px;">
                    <button class="btn-action btn-primary" onclick="addItemToTab(${tab.id})">+ Ekle</button>
                </div>
                <div style="text-align:right; font-weight:600; font-size:0.9rem;">Toplam: ${total.toLocaleString('tr-TR')} ₺</div>
            </div>`;
        }

        function renderKiraathane() {
            const catalogWrap = document.getElementById('catalog-list');
            catalogWrap.innerHTML = productCatalog.map(p => `
                <span class="category-tag">${p.name} — ${p.price.toLocaleString('tr-TR')} ₺<button onclick="removeCatalogProduct(${p.id})">✕</button></span>
            `).join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz ürün eklenmedi.</span>';

            const datalist = document.getElementById('catalog-datalist');
            datalist.innerHTML = productCatalog.map(p => `<option value="${p.name}" data-price="${p.price}">`).join('');

            const standingWrap = document.getElementById('standing-list');
            const standingTabs = salesTabs.filter(t => t.tableId === null);
            standingWrap.innerHTML = standingTabs.length
                ? standingTabs.map(renderTabCard).join('')
                : '<span style="color:var(--text-muted); font-size:0.85rem;">Şu an ayakta müşteri yok.</span>';

            const tablesWrap = document.getElementById('tables-list');
            tablesWrap.innerHTML = salesTables.length ? salesTables.map(table => {
                const occupants = salesTabs.filter(t => t.tableId === table.id);
                const tableTotal = occupants.reduce((sum, t) => sum + tabTotal(t), 0);
                const occupantsHtml = occupants.length
                    ? occupants.map(renderTabCard).join('')
                    : '<span style="color:var(--text-muted); font-size:0.8rem;">Bu masada henüz kimse yok.</span>';
                return `
                <div class="prayer-card" style="border-color:var(--accent-blue);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong>🪑 ${table.name}</strong>
                        <div style="display:flex; gap:6px; align-items:center;">
                            <span style="font-size:0.85rem; color:var(--text-muted);">Masa Toplamı: ${tableTotal.toLocaleString('tr-TR')} ₺</span>
                            <button class="btn-action" style="color:var(--accent-red)" onclick="removeTable(${table.id})">Masayı Sil</button>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:10px;">${occupantsHtml}</div>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz masa eklenmedi.</span>';

            const grandTotal = salesTabs.reduce((sum, t) => sum + tabTotal(t), 0);
            document.getElementById('kiraathane-grand-total').innerText = grandTotal.toLocaleString('tr-TR') + ' ₺';
        }
