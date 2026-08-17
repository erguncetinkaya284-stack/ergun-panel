        // ================= MANAV STOK VE SATIŞ TAKİBİ =================
        let manavTypes = [];
        let manavStockMap = {}; // { tür: toplam alınan kg }
        let manavPriceMap = {}; // { tür: ₺/kg fiyat }
        let manavSales = []; // {id, type, customer, kg}
        let manavSaleIdCounter = 1;

        function addManavType() {
            const input = document.getElementById('new-manav-type');
            const value = input.value.trim();
            if (!value) return;
            if (manavTypes.includes(value)) { input.value = ''; return; }
            manavTypes.push(value);
            input.value = '';
            renderManav();
        }

        function removeManavType(value) {
            manavTypes = manavTypes.filter(t => t !== value);
            renderManav();
        }

        function renderManavTypeTags() {
            const wrap = document.getElementById('manav-type-list');
            wrap.innerHTML = manavTypes.length ? manavTypes.map(t => `
                <span class="category-tag lang-tag">${t}<button onclick="removeManavType('${t.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz ürün türü eklenmedi.</span>';

            const allTypesSet = new Set(manavTypes);
            Object.keys(manavStockMap).forEach(t => allTypesSet.add(t));
            manavSales.forEach(s => allTypesSet.add(s.type));
            const allTypes = Array.from(allTypesSet);

            const stockSelect = document.getElementById('manav-stock-type');
            const saleSelect = document.getElementById('manav-sale-type');
            const priceSelect = document.getElementById('manav-price-type');
            const options = manavTypes.length
                ? manavTypes.map(t => `<option value="${t}">${t}</option>`).join('')
                : '<option value="">Önce ürün türü ekle</option>';
            stockSelect.innerHTML = options;
            saleSelect.innerHTML = options;
            priceSelect.innerHTML = options;

            return allTypes;
        }

        function setManavPrice() {
            const type = document.getElementById('manav-price-type').value;
            const price = parseFloat(document.getElementById('manav-price-value').value.replace(',', '.')) || 0;
            if (!type) { alert('Önce bir ürün türü seç.'); return; }
            if (!price || price <= 0) { alert('Geçerli bir fiyat gir.'); return; }
            manavPriceMap[type] = price;
            document.getElementById('manav-price-value').value = '';
            renderManav();
        }

        function manavSoldFor(type) {
            return manavSales.filter(s => s.type === type).reduce((sum, s) => sum + s.kg, 0);
        }

        function manavRemainingFor(type) {
            return (manavStockMap[type] || 0) - manavSoldFor(type);
        }

        function addManavStock() {
            const type = document.getElementById('manav-stock-type').value;
            const kg = parseFloat(document.getElementById('manav-stock-kg').value.replace(',', '.')) || 0;
            if (!type) { alert('Önce bir ürün türü seç.'); return; }
            if (!kg || kg <= 0) { alert('Geçerli bir kg değeri gir.'); return; }
            manavStockMap[type] = (manavStockMap[type] || 0) + kg;
            document.getElementById('manav-stock-kg').value = '';
            renderManav();
        }

        function addManavSale() {
            const type = document.getElementById('manav-sale-type').value;
            const customer = document.getElementById('manav-sale-customer').value.trim();
            const kg = parseFloat(document.getElementById('manav-sale-kg').value.replace(',', '.')) || 0;
            if (!type) { alert('Önce bir ürün türü seç.'); return; }
            if (!customer) { alert('Müşteri adı gir.'); return; }
            if (!kg || kg <= 0) { alert('Geçerli bir kg değeri gir.'); return; }
            const remaining = manavRemainingFor(type);
            if (kg > remaining) {
                if (!confirm(`Stokta ${remaining.toLocaleString('tr-TR')} kg ${type} var. Yine de ${kg.toLocaleString('tr-TR')} kg satış eklensin mi?`)) return;
            }
            manavSales.push({ id: manavSaleIdCounter++, type, customer, kg });
            document.getElementById('manav-sale-customer').value = '';
            document.getElementById('manav-sale-kg').value = '';
            renderManav();
        }

        function removeManavSale(id) {
            manavSales = manavSales.filter(s => s.id !== id);
            renderManav();
        }

        function renderManavSummary(allTypes) {
            const wrap = document.getElementById('manav-type-summary');
            wrap.innerHTML = allTypes.length ? allTypes.map(t => {
                const sold = manavSoldFor(t);
                const remaining = manavRemainingFor(t);
                const price = manavPriceMap[t] || 0;
                const stockValue = remaining * price;
                const salesValue = sold * price;
                return `
                <div class="prayer-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                        <strong>${t}</strong>
                        <span style="font-size:0.85rem;">Fiyat: ${price.toLocaleString('tr-TR')} ₺/kg</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; flex-wrap:wrap; gap:6px;">
                        <span>Satılan: ${sold.toLocaleString('tr-TR')} kg</span>
                        <span>Stokta Kalan: <span style="color:${remaining < 0 ? 'var(--accent-red)' : 'var(--accent-green)'}">${remaining.toLocaleString('tr-TR')} kg</span></span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600; border-top:1px solid var(--border-color); padding-top:8px;">
                        <span>Stok Değeri: ${stockValue.toLocaleString('tr-TR')} ₺</span>
                        <span>Satış Tutarı: ${salesValue.toLocaleString('tr-TR')} ₺</span>
                    </div>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz stok veya satış girilmedi.</span>';
        }

        function renderManavSalesList() {
            const wrap = document.getElementById('manav-sales-list');
            const recent = manavSales.slice().reverse().slice(0, 20);
            wrap.innerHTML = recent.length ? recent.map(s => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-hover); padding:8px 10px; border-radius:6px; font-size:0.85rem; flex-wrap:wrap; gap:6px;">
                    <span>👤 ${s.customer} — <span class="category-tag" style="padding:2px 8px;">${s.type}</span> ${s.kg.toLocaleString('tr-TR')} kg</span>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeManavSale(${s.id})">Sil</button>
                </div>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz satış eklenmedi.</span>';
        }

        function renderManav() {
            const allTypes = renderManavTypeTags();
            renderManavSummary(allTypes);
            renderManavSalesList();

            const totalStock = allTypes.reduce((sum, t) => sum + (manavStockMap[t] || 0), 0);
            const totalSold = allTypes.reduce((sum, t) => sum + manavSoldFor(t), 0);
            const totalRemaining = totalStock - totalSold;
            const totalStockValue = allTypes.reduce((sum, t) => sum + manavRemainingFor(t) * (manavPriceMap[t] || 0), 0);
            const totalSalesValue = allTypes.reduce((sum, t) => sum + manavSoldFor(t) * (manavPriceMap[t] || 0), 0);

            document.getElementById('manav-total').innerText =
                `Toplam Alınan: ${totalStock.toLocaleString('tr-TR')} kg — Toplam Satılan: ${totalSold.toLocaleString('tr-TR')} kg — Toplam Kalan Stok: ${totalRemaining.toLocaleString('tr-TR')} kg — Stok Değeri: ${totalStockValue.toLocaleString('tr-TR')} ₺ — Satış Tutarı: ${totalSalesValue.toLocaleString('tr-TR')} ₺`;
            document.getElementById('manav-count').innerText = `${totalRemaining.toLocaleString('tr-TR')} kg stok`;
        }

