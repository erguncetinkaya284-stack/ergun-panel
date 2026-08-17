        // ================= ET STOK VE SATIŞ TAKİBİ =================
        let etTypes = ['Tavuk', 'Koyun', 'Keçi', 'Dana', 'İnek', 'Tosun'];
        let etMachines = []; // {id, name}
        let etMachineIdCounter = 1;
        let etStockMap = {}; // { tür: toplam alınan kg }
        let etPriceMap = {}; // { tür: ₺/kg fiyat }
        let etSales = []; // {id, type, customer, kg}
        let etSaleIdCounter = 1;

        function setEtPrice() {
            const type = document.getElementById('et-price-type').value;
            const price = parseFloat(document.getElementById('et-price-value').value.replace(',', '.')) || 0;
            if (!type) { alert('Önce bir et türü seç.'); return; }
            if (!price || price <= 0) { alert('Geçerli bir fiyat gir.'); return; }
            etPriceMap[type] = price;
            document.getElementById('et-price-value').value = '';
            renderEt();
        }

        function addEtType() {
            const input = document.getElementById('new-et-type');
            const value = input.value.trim();
            if (!value) return;
            if (etTypes.includes(value)) { input.value = ''; return; }
            etTypes.push(value);
            input.value = '';
            renderEt();
        }

        function removeEtType(value) {
            etTypes = etTypes.filter(t => t !== value);
            renderEt();
        }

        function renderEtTypeTags() {
            const wrap = document.getElementById('et-type-list');
            wrap.innerHTML = etTypes.length ? etTypes.map(t => `
                <span class="category-tag lang-tag">${t}<button onclick="removeEtType('${t.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz et türü eklenmedi.</span>';

            // Tüm türleri kapsa (stok/satış geçmişinde olup listeden silinmiş türler de dahil)
            const allTypesSet = new Set(etTypes);
            Object.keys(etStockMap).forEach(t => allTypesSet.add(t));
            etSales.forEach(s => allTypesSet.add(s.type));
            const allTypes = Array.from(allTypesSet);

            const stockSelect = document.getElementById('et-stock-type');
            const saleSelect = document.getElementById('et-sale-type');
            const priceSelect = document.getElementById('et-price-type');
            const options = etTypes.length
                ? etTypes.map(t => `<option value="${t}">${t}</option>`).join('')
                : '<option value="">Önce et türü ekle</option>';
            stockSelect.innerHTML = options;
            saleSelect.innerHTML = options;
            priceSelect.innerHTML = options;

            return allTypes;
        }

        function addEtMachine() {
            const input = document.getElementById('new-et-machine');
            const value = input.value.trim();
            if (!value) return;
            etMachines.push({ id: etMachineIdCounter++, name: value });
            input.value = '';
            renderEt();
        }

        function removeEtMachine(id) {
            etMachines = etMachines.filter(m => m.id !== id);
            renderEt();
        }

        function renderEtMachines() {
            const wrap = document.getElementById('et-machine-list');
            wrap.innerHTML = etMachines.length ? etMachines.map(m => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-hover); padding:6px 10px; border-radius:6px; font-size:0.85rem;">
                    <span>🔧 ${m.name}</span>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeEtMachine(${m.id})">✕</button>
                </div>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz makine eklenmedi.</span>';
        }

        function etSoldFor(type) {
            return etSales.filter(s => s.type === type).reduce((sum, s) => sum + s.kg, 0);
        }

        function etRemainingFor(type) {
            return (etStockMap[type] || 0) - etSoldFor(type);
        }

        function addEtStock() {
            const type = document.getElementById('et-stock-type').value;
            const kg = parseFloat(document.getElementById('et-stock-kg').value.replace(',', '.')) || 0;
            if (!type) { alert('Önce bir et türü seç.'); return; }
            if (!kg || kg <= 0) { alert('Geçerli bir kg değeri gir.'); return; }
            etStockMap[type] = (etStockMap[type] || 0) + kg;
            document.getElementById('et-stock-kg').value = '';
            renderEt();
        }

        function addEtSale() {
            const type = document.getElementById('et-sale-type').value;
            const customer = document.getElementById('et-sale-customer').value.trim();
            const kg = parseFloat(document.getElementById('et-sale-kg').value.replace(',', '.')) || 0;
            if (!type) { alert('Önce bir et türü seç.'); return; }
            if (!customer) { alert('Müşteri adı gir.'); return; }
            if (!kg || kg <= 0) { alert('Geçerli bir kg değeri gir.'); return; }
            const remaining = etRemainingFor(type);
            if (kg > remaining) {
                if (!confirm(`Stokta ${remaining.toLocaleString('tr-TR')} kg ${type} var. Yine de ${kg.toLocaleString('tr-TR')} kg satış eklensin mi?`)) return;
            }
            etSales.push({ id: etSaleIdCounter++, type, customer, kg });
            document.getElementById('et-sale-customer').value = '';
            document.getElementById('et-sale-kg').value = '';
            renderEt();
        }

        function removeEtSale(id) {
            etSales = etSales.filter(s => s.id !== id);
            renderEt();
        }

        function renderEtSummary(allTypes) {
            const wrap = document.getElementById('et-type-summary');
            wrap.innerHTML = allTypes.length ? allTypes.map(t => {
                const sold = etSoldFor(t);
                const remaining = etRemainingFor(t);
                const price = etPriceMap[t] || 0;
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

        function renderEtSalesList() {
            const wrap = document.getElementById('et-sales-list');
            const recent = etSales.slice().reverse().slice(0, 20);
            wrap.innerHTML = recent.length ? recent.map(s => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-hover); padding:8px 10px; border-radius:6px; font-size:0.85rem; flex-wrap:wrap; gap:6px;">
                    <span>👤 ${s.customer} — <span class="category-tag" style="padding:2px 8px;">${s.type}</span> ${s.kg.toLocaleString('tr-TR')} kg</span>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeEtSale(${s.id})">Sil</button>
                </div>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz satış eklenmedi.</span>';
        }

        function renderEt() {
            const allTypes = renderEtTypeTags();
            renderEtMachines();
            renderEtSummary(allTypes);
            renderEtSalesList();

            const totalStock = allTypes.reduce((sum, t) => sum + (etStockMap[t] || 0), 0);
            const totalSold = allTypes.reduce((sum, t) => sum + etSoldFor(t), 0);
            const totalRemaining = totalStock - totalSold;
            const totalStockValue = allTypes.reduce((sum, t) => sum + etRemainingFor(t) * (etPriceMap[t] || 0), 0);
            const totalSalesValue = allTypes.reduce((sum, t) => sum + etSoldFor(t) * (etPriceMap[t] || 0), 0);

            document.getElementById('et-total').innerText =
                `Toplam Alınan: ${totalStock.toLocaleString('tr-TR')} kg — Toplam Satılan: ${totalSold.toLocaleString('tr-TR')} kg — Toplam Kalan Stok: ${totalRemaining.toLocaleString('tr-TR')} kg — Stok Değeri: ${totalStockValue.toLocaleString('tr-TR')} ₺ — Satış Tutarı: ${totalSalesValue.toLocaleString('tr-TR')} ₺`;
            document.getElementById('et-count').innerText = `${totalRemaining.toLocaleString('tr-TR')} kg stok`;
        }

