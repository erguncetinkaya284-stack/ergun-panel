        // ================= MOTORLU ARAÇ VE EKİPMAN TAKİBİ =================
        let aracCategories = [];
        let aracItems = []; // {id, category, name, brand, model, year, price, status, colorTag, hours, lastMaint, nextMaint, payment, debt, supplier}
        let aracItemIdCounter = 1;

        const ARAC_STATUS_LABELS = {
            sahip: { text: 'Elimde Olan', bg: 'rgba(46,204,113,0.15)', border: 'rgba(46,204,113,0.4)', color: 'var(--accent-green)' },
            hedef: { text: 'Hedef', bg: 'rgba(241,196,15,0.15)', border: 'rgba(241,196,15,0.4)', color: 'var(--accent-gold)' },
            bakimda: { text: 'Bakımda', bg: 'rgba(230,126,34,0.15)', border: 'rgba(230,126,34,0.4)', color: '#e67e22' },
            satildi: { text: 'Satıldı', bg: 'rgba(149,165,166,0.15)', border: 'rgba(149,165,166,0.4)', color: '#95a5a6' },
            kiralik: { text: 'Kiralık Verildi', bg: 'rgba(52,152,219,0.15)', border: 'rgba(52,152,219,0.4)', color: 'var(--accent-blue)' },
        };

        const ARAC_COLOR_LABELS = {
            'kirmizi-gri': '🔴 Kırmızı üst / Koyu gri alt',
            'siyah': '⚫ Siyah',
            'diger': 'Diğer renk',
        };

        function addAracCategory() {
            const input = document.getElementById('new-arac-category');
            const value = input.value.trim();
            if (!value) return;
            if (aracCategories.includes(value)) { input.value = ''; return; }
            aracCategories.push(value);
            input.value = '';
            renderArac();
        }

        function removeAracCategory(value) {
            aracCategories = aracCategories.filter(c => c !== value);
            renderArac();
        }

        function renderAracCategoryTags() {
            const wrap = document.getElementById('arac-category-list');
            wrap.innerHTML = aracCategories.length ? aracCategories.map(c => `
                <span class="category-tag lang-tag">${c}<button onclick="removeAracCategory('${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz kategori eklenmedi.</span>';

            const select = document.getElementById('arac-item-category');
            select.innerHTML = aracCategories.length
                ? aracCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce kategori ekle</option>';

            const catSet = new Set(aracCategories);
            aracItems.forEach(i => catSet.add(i.category));
            return Array.from(catSet);
        }

        function parseMoneyInput(id) {
            const raw = document.getElementById(id).value.trim();
            if (!raw) return 0;
            return parseFloat(raw.replace(/\./g, '').replace(',', '.')) || 0;
        }

        function addAracItem() {
            const category = document.getElementById('arac-item-category').value;
            const name = document.getElementById('arac-item-name').value.trim();
            const brand = document.getElementById('arac-item-brand').value.trim();
            const model = document.getElementById('arac-item-model').value.trim();
            const year = document.getElementById('arac-item-year').value.trim();
            const price = parseMoneyInput('arac-item-price');
            const status = document.getElementById('arac-item-status').value;
            const colorTag = document.getElementById('arac-item-color').value;
            const hours = parseFloat(document.getElementById('arac-item-hours').value) || 0;
            const lastMaint = document.getElementById('arac-item-last-maint').value;
            const nextMaint = document.getElementById('arac-item-next-maint').value;
            const payment = document.getElementById('arac-item-payment').value;
            const debt = parseMoneyInput('arac-item-debt');
            const supplier = document.getElementById('arac-item-supplier').value.trim();

            if (!category) { alert('Önce bir kategori seç.'); return; }
            if (!name) { alert('Araç/ekipman adı gir.'); return; }
            if (!price) { alert('Fiyat girmelisin.'); return; }

            aracItems.push({
                id: aracItemIdCounter++, category, name, brand, model, year, price, status, colorTag,
                hours, lastMaint, nextMaint, payment, debt, supplier
            });

            ['arac-item-name','arac-item-brand','arac-item-model','arac-item-year','arac-item-price',
             'arac-item-hours','arac-item-last-maint','arac-item-next-maint','arac-item-debt','arac-item-supplier']
                .forEach(id => document.getElementById(id).value = '');

            renderArac();
        }

        function removeAracItem(id) {
            aracItems = aracItems.filter(i => i.id !== id);
            renderArac();
        }

        function isMaintDue(item) {
            if (!item.nextMaint) return false;
            const today = new Date().toISOString().slice(0, 10);
            return item.nextMaint <= today;
        }

        function renderAracItemCard(item) {
            const statusInfo = ARAC_STATUS_LABELS[item.status] || ARAC_STATUS_LABELS.sahip;
            const subtitle = [item.brand, item.model, item.year].filter(Boolean).join(' • ');
            const colorLabel = item.colorTag ? ARAC_COLOR_LABELS[item.colorTag] : '';
            const maintDue = isMaintDue(item);

            const detailRows = [];
            if (item.hours) detailRows.push(`⏱️ Çalışma saati: <strong>${item.hours.toLocaleString('tr-TR')} sa</strong>`);
            if (item.lastMaint) detailRows.push(`🔧 Son bakım: ${item.lastMaint}`);
            if (item.nextMaint) detailRows.push(`${maintDue ? '⚠️' : '📅'} Sonraki bakım: ${item.nextMaint}${maintDue ? ' — VAKTİ GELDİ' : ''}`);
            if (item.payment === 'taksit') detailRows.push(`💳 Taksitli — Kalan borç: <strong>${(item.debt||0).toLocaleString('tr-TR')} ₺</strong>`);
            else detailRows.push('💰 Peşin ödendi');
            if (item.supplier) detailRows.push(`🏪 Bayi: ${item.supplier}`);
            if (colorLabel) detailRows.push(colorLabel);

            return `
            <div class="prayer-card" style="${maintDue ? 'border-color:rgba(230,126,34,0.6);' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                    <strong>${item.name}</strong>
                    <span class="category-tag" style="background:${statusInfo.bg}; border-color:${statusInfo.border}; color:${statusInfo.color};">${statusInfo.text}</span>
                </div>
                ${subtitle ? `<div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">${subtitle}</div>` : ''}
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:6px; display:flex; flex-direction:column; gap:2px;">
                    ${detailRows.map(r => `<span>${r}</span>`).join('')}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:8px;">
                    <span style="font-size:0.85rem;">Fiyat: ${item.price.toLocaleString('tr-TR')} ₺</span>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeAracItem(${item.id})">Sil</button>
                </div>
            </div>`;
        }

        function renderAracList(allCategories) {
            const wrap = document.getElementById('arac-list');
            wrap.innerHTML = allCategories.length ? allCategories.map(cat => {
                const items = aracItems.filter(i => i.category === cat);
                return `
                <div style="margin-bottom:16px;">
                    <h4 style="font-size:0.95rem; margin-bottom:8px; color:var(--accent-blue);">${cat}</h4>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${items.length ? items.map(renderAracItemCard).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Bu kategoride henüz araç/ekipman eklenmedi.</span>'}
                    </div>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz kategori eklenmedi.</span>';
        }

        function renderAracCategorySummary(allCategories) {
            const wrap = document.getElementById('arac-category-summary');
            wrap.innerHTML = allCategories.length ? allCategories.map(cat => {
                const items = aracItems.filter(i => i.category === cat);
                const sahipItems = items.filter(i => i.status === 'sahip');
                const hedefItems = items.filter(i => i.status === 'hedef');
                const sahipValue = sahipItems.reduce((s, i) => s + i.price, 0);
                const hedefValue = hedefItems.reduce((s, i) => s + i.price, 0);
                return `
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; padding:6px 0; border-bottom:1px solid var(--border-color); flex-wrap:wrap; gap:4px;">
                    <span><strong>${cat}</strong></span>
                    <span>Elimde Olan: ${sahipItems.length} adet — ${sahipValue.toLocaleString('tr-TR')} ₺ &nbsp;|&nbsp; Hedef: ${hedefItems.length} adet — ${hedefValue.toLocaleString('tr-TR')} ₺</span>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz araç/ekipman eklenmedi.</span>';
        }

        function renderAracMaintenanceAlerts() {
            let el = document.getElementById('arac-maint-alerts');
            if (!el) {
                el = document.createElement('div');
                el.id = 'arac-maint-alerts';
                el.style.marginTop = '10px';
                document.getElementById('arac-list').insertAdjacentElement('beforebegin', el);
            }
            const due = aracItems.filter(isMaintDue);
            el.innerHTML = due.length ? `
                <div style="background:rgba(230,126,34,0.12); border:1px solid rgba(230,126,34,0.4); border-radius:8px; padding:8px 12px; margin-bottom:10px; font-size:0.85rem;">
                    ⚠️ <strong>${due.length} ekipmanın bakım vakti geldi:</strong> ${due.map(i => i.name).join(', ')}
                </div>` : '';
        }

        function renderArac() {
            const allCategories = renderAracCategoryTags();
            renderAracMaintenanceAlerts();
            renderAracList(allCategories);
            renderAracCategorySummary(allCategories);

            const sahipItems = aracItems.filter(i => i.status === 'sahip');
            const hedefItems = aracItems.filter(i => i.status === 'hedef');
            const sahipValue = sahipItems.reduce((s, i) => s + i.price, 0);
            const hedefValue = hedefItems.reduce((s, i) => s + i.price, 0);
            const totalDebt = aracItems.filter(i => i.payment === 'taksit').reduce((s, i) => s + (i.debt || 0), 0);

            document.getElementById('arac-total').innerText =
                `Elimde Olan Toplam Değer: ${sahipValue.toLocaleString('tr-TR')} ₺ (${sahipItems.length} adet) — Hedef Toplam Değer: ${hedefValue.toLocaleString('tr-TR')} ₺ (${hedefItems.length} adet)${totalDebt ? ` — Toplam Kalan Borç: ${totalDebt.toLocaleString('tr-TR')} ₺` : ''}`;
            document.getElementById('arac-count').innerText = `${aracItems.length} araç`;
        }
