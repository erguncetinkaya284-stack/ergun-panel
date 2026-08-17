        // ================= SÜT STOK VE SATIŞ TAKİBİ (Manav/Et modülleriyle aynı mantık, birim: Litre) =================
        let sutTypes = [];
        let sutStockMap = {}; // { tür: toplam alınan L }
        let sutPriceMap = {}; // { tür: ₺/L fiyat }
        let sutSales = []; // {id, type, customer, litre}
        let sutSaleIdCounter = 1;

        function addSutType() {
            const input = document.getElementById('new-sut-type');
            const value = input.value.trim();
            if (!value) return;
            if (sutTypes.includes(value)) { input.value = ''; return; }
            sutTypes.push(value);
            input.value = '';
            renderSut();
        }

        function removeSutType(value) {
            sutTypes = sutTypes.filter(t => t !== value);
            renderSut();
        }

        function renderSutTypeTags() {
            const wrap = document.getElementById('sut-type-list');
            wrap.innerHTML = sutTypes.length ? sutTypes.map(t => `
                <span class="category-tag lang-tag">${t}<button onclick="removeSutType('${t.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz ürün türü eklenmedi.</span>';

            const allTypesSet = new Set(sutTypes);
            Object.keys(sutStockMap).forEach(t => allTypesSet.add(t));
            sutSales.forEach(s => allTypesSet.add(s.type));
            const allTypes = Array.from(allTypesSet);

            const stockSelect = document.getElementById('sut-stock-type');
            const saleSelect = document.getElementById('sut-sale-type');
            const priceSelect = document.getElementById('sut-price-type');
            const options = sutTypes.length
                ? sutTypes.map(t => `<option value="${t}">${t}</option>`).join('')
                : '<option value="">Önce ürün türü ekle</option>';
            stockSelect.innerHTML = options;
            saleSelect.innerHTML = options;
            priceSelect.innerHTML = options;

            return allTypes;
        }

        function setSutPrice() {
            const type = document.getElementById('sut-price-type').value;
            const price = parseFloat(document.getElementById('sut-price-value').value.replace(',', '.')) || 0;
            if (!type) { alert('Önce bir ürün türü seç.'); return; }
            if (!price || price <= 0) { alert('Geçerli bir fiyat gir.'); return; }
            sutPriceMap[type] = price;
            document.getElementById('sut-price-value').value = '';
            renderSut();
        }

        function sutSoldFor(type) {
            return sutSales.filter(s => s.type === type).reduce((sum, s) => sum + s.litre, 0);
        }

        function sutRemainingFor(type) {
            return (sutStockMap[type] || 0) - sutSoldFor(type);
        }

        function addSutStock() {
            const type = document.getElementById('sut-stock-type').value;
            const litre = parseFloat(document.getElementById('sut-stock-litre').value.replace(',', '.')) || 0;
            if (!type) { alert('Önce bir ürün türü seç.'); return; }
            if (!litre || litre <= 0) { alert('Geçerli bir litre değeri gir.'); return; }
            sutStockMap[type] = (sutStockMap[type] || 0) + litre;
            document.getElementById('sut-stock-litre').value = '';
            renderSut();
        }

        function addSutSale() {
            const type = document.getElementById('sut-sale-type').value;
            const customer = document.getElementById('sut-sale-customer').value.trim();
            const litre = parseFloat(document.getElementById('sut-sale-litre').value.replace(',', '.')) || 0;
            if (!type) { alert('Önce bir ürün türü seç.'); return; }
            if (!customer) { alert('Müşteri adı gir.'); return; }
            if (!litre || litre <= 0) { alert('Geçerli bir litre değeri gir.'); return; }
            const remaining = sutRemainingFor(type);
            if (litre > remaining) {
                if (!confirm(`Stokta ${remaining.toLocaleString('tr-TR')} L ${type} var. Yine de ${litre.toLocaleString('tr-TR')} L satış eklensin mi?`)) return;
            }
            sutSales.push({ id: sutSaleIdCounter++, type, customer, litre });
            document.getElementById('sut-sale-customer').value = '';
            document.getElementById('sut-sale-litre').value = '';
            renderSut();
        }

        function removeSutSale(id) {
            sutSales = sutSales.filter(s => s.id !== id);
            renderSut();
        }

        function renderSutSummary(allTypes) {
            const wrap = document.getElementById('sut-type-summary');
            wrap.innerHTML = allTypes.length ? allTypes.map(t => {
                const sold = sutSoldFor(t);
                const remaining = sutRemainingFor(t);
                const price = sutPriceMap[t] || 0;
                const stockValue = remaining * price;
                const salesValue = sold * price;
                return `
                <div class="prayer-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                        <strong>${t}</strong>
                        <span style="font-size:0.85rem;">Fiyat: ${price.toLocaleString('tr-TR')} ₺/L</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; flex-wrap:wrap; gap:6px;">
                        <span>Satılan: ${sold.toLocaleString('tr-TR')} L</span>
                        <span>Stokta Kalan: <span style="color:${remaining < 0 ? 'var(--accent-red)' : 'var(--accent-green)'}">${remaining.toLocaleString('tr-TR')} L</span></span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600; border-top:1px solid var(--border-color); padding-top:8px;">
                        <span>Stok Değeri: ${stockValue.toLocaleString('tr-TR')} ₺</span>
                        <span>Satış Tutarı: ${salesValue.toLocaleString('tr-TR')} ₺</span>
                    </div>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz stok veya satış girilmedi.</span>';
        }

        function renderSutSalesList() {
            const wrap = document.getElementById('sut-sales-list');
            const recent = sutSales.slice().reverse().slice(0, 20);
            wrap.innerHTML = recent.length ? recent.map(s => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-hover); padding:8px 10px; border-radius:6px; font-size:0.85rem; flex-wrap:wrap; gap:6px;">
                    <span>👤 ${s.customer} — <span class="category-tag" style="padding:2px 8px;">${s.type}</span> ${s.litre.toLocaleString('tr-TR')} L</span>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeSutSale(${s.id})">Sil</button>
                </div>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz satış eklenmedi.</span>';
        }

        function renderSut() {
            const allTypes = renderSutTypeTags();
            renderSutSummary(allTypes);
            renderSutSalesList();

            const totalStock = allTypes.reduce((sum, t) => sum + (sutStockMap[t] || 0), 0);
            const totalSold = allTypes.reduce((sum, t) => sum + sutSoldFor(t), 0);
            const totalRemaining = totalStock - totalSold;
            const totalStockValue = allTypes.reduce((sum, t) => sum + sutRemainingFor(t) * (sutPriceMap[t] || 0), 0);
            const totalSalesValue = allTypes.reduce((sum, t) => sum + sutSoldFor(t) * (sutPriceMap[t] || 0), 0);

            document.getElementById('sut-total').innerText =
                `Toplam Alınan: ${totalStock.toLocaleString('tr-TR')} L — Toplam Satılan: ${totalSold.toLocaleString('tr-TR')} L — Toplam Kalan Stok: ${totalRemaining.toLocaleString('tr-TR')} L — Stok Değeri: ${totalStockValue.toLocaleString('tr-TR')} ₺ — Satış Tutarı: ${totalSalesValue.toLocaleString('tr-TR')} ₺`;
            document.getElementById('sut-count').innerText = `${totalRemaining.toLocaleString('tr-TR')} L stok`;
        }

