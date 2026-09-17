        // ================= TARIM TAKİBİ =================
        let tarlalar = []; // {id, name, alan, urun}
        let tarlaIdCounter = 1;
        let hasatlar = []; // {id, tarlaId, yil, miktarKg, fiyat, masraf}
        let hasatIdCounter = 1;
        let sulamaMap = {}; // { tarlaId: 'YYYY-MM-DD' }
        let tohumTypes = [];
        let tohumStockMap = {};
        let tohumUseMap = {};
        let belgeler = []; // {id, name, tarih}
        let belgeIdCounter = 1;
        let havaNotlari = []; // {id, date, note}
        let havaNoteIdCounter = 1;
        let tarimMachines = []; // {id, name, type, pricing}
        let tarimMachineIdCounter = 1;
        let tarimServiceJobs = [];
        let tarimServiceJobIdCounter = 1;

        function tarimNumber(id) {
            return parseFloat((document.getElementById(id)?.value || '').replace(',', '.')) || 0;
        }

        function formatTarimMoney(value) {
            return `${Number(value || 0).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺`;
        }

        function tarimJobTotals(values) {
            const serviceTotal = values.quantity * values.unitPrice;
            const productTotal = values.productQuantity * values.productPrice;
            const expenses = values.fuel + values.labor + values.transport;
            const net = productTotal - serviceTotal - expenses;
            return { serviceTotal, productTotal, expenses, net };
        }

        function getTarimJobFormValues() {
            const values = {
                customer: document.getElementById('tarim-job-customer').value.trim(),
                fieldId: parseInt(document.getElementById('tarim-job-field').value) || null,
                date: document.getElementById('tarim-job-date').value || todayStr(),
                machineId: parseInt(document.getElementById('tarim-job-machine').value) || null,
                work: document.getElementById('tarim-job-work').value.trim(),
                quantity: tarimNumber('tarim-job-quantity'),
                unitPrice: tarimNumber('tarim-job-unit-price'),
                fuel: tarimNumber('tarim-job-fuel'),
                labor: tarimNumber('tarim-job-labor'),
                transport: tarimNumber('tarim-job-transport'),
                product: document.getElementById('tarim-job-product').value.trim(),
                productQuantity: tarimNumber('tarim-job-product-quantity'),
                productUnit: document.getElementById('tarim-job-product-unit').value.trim(),
                productPrice: tarimNumber('tarim-job-product-price'),
                status: document.getElementById('tarim-job-status').value,
                note: document.getElementById('tarim-job-note').value.trim()
            };
            return { ...values, ...tarimJobTotals(values) };
        }

        function tarimJobResultText(net) {
            if (net > 0) return `Müşteri sana ${formatTarimMoney(net)} ödeyecek`;
            if (net < 0) return `Sen müşteriye ${formatTarimMoney(Math.abs(net))} ödeyeceksin`;
            return 'Hesap kapandı';
        }

        function updateTarimJobPreview() {
            const preview = document.getElementById('tarim-job-preview');
            if (!preview) return;
            const values = getTarimJobFormValues();
            preview.innerHTML = `Hizmet: ${formatTarimMoney(values.serviceTotal)} · Ürün: ${formatTarimMoney(values.productTotal)} · Gider: ${formatTarimMoney(values.expenses)} · <strong>${tarimJobResultText(values.net)}</strong>`;
        }

        function addTarimMachine() {
            const name = document.getElementById('tarim-machine-name').value.trim();
            const type = document.getElementById('tarim-machine-type').value.trim();
            const pricing = document.getElementById('tarim-machine-pricing').value;
            if (!name) { alert('Makine adı boş olamaz.'); return; }
            tarimMachines.push({ id: tarimMachineIdCounter++, name, type, pricing });
            document.getElementById('tarim-machine-name').value = '';
            document.getElementById('tarim-machine-type').value = '';
            renderTarim();
        }

        function removeTarimMachine(id) {
            if (!confirm('Bu makine silinecek. Eski iş kayıtları korunur. Emin misin?')) return;
            tarimMachines = tarimMachines.filter(machine => machine.id !== id);
            renderTarim();
        }

        function resetTarimServiceForm() {
            ['tarim-job-customer', 'tarim-job-work', 'tarim-job-quantity', 'tarim-job-unit-price', 'tarim-job-fuel', 'tarim-job-labor', 'tarim-job-transport', 'tarim-job-product', 'tarim-job-product-quantity', 'tarim-job-product-unit', 'tarim-job-product-price', 'tarim-job-note'].forEach(id => { document.getElementById(id).value = ''; });
            document.getElementById('tarim-job-date').value = todayStr();
            document.getElementById('tarim-job-status').value = 'Bekliyor';
            updateTarimJobPreview();
        }

        function addTarimServiceJob() {
            const values = getTarimJobFormValues();
            if (!values.customer) { alert('İş sahibi / müşteri gir.'); return; }
            if (!values.work) { alert('Yapılan işi gir.'); return; }
            if (!values.quantity || !values.unitPrice) { alert('Hizmet miktarı ve birim fiyatı gir.'); return; }
            const job = { id: tarimServiceJobIdCounter++, ...values, cariSynced: false };
            tarimServiceJobs.push(job);
            resetTarimServiceForm();
            renderTarim();
        }

        function removeTarimServiceJob(id) {
            tarimServiceJobs = tarimServiceJobs.filter(job => job.id !== id);
            renderTarim();
        }

        function addTarimJobToDailyProgram(id) {
            const job = tarimServiceJobs.find(item => item.id === id);
            if (!job || typeof addToDailyProgram !== 'function') return;
            addToDailyProgram(`${job.work} işi - ${job.customer}`);
        }

        async function syncTarimJobToCari(id) {
            const job = tarimServiceJobs.find(item => item.id === id);
            if (!job || job.cariSynced) return;
            const raw = await persistGet('app-full-data');
            const snapshot = raw ? JSON.parse(raw) : {};
            snapshot.cariCustomers = Array.isArray(snapshot.cariCustomers) ? snapshot.cariCustomers : [];
            snapshot.cariCustomerIdCounter = snapshot.cariCustomerIdCounter || 1;
            snapshot.cariTx = Array.isArray(snapshot.cariTx) ? snapshot.cariTx : [];
            snapshot.cariTxIdCounter = snapshot.cariTxIdCounter || 1;
            let customer = snapshot.cariCustomers.find(item => item.name === job.customer);
            if (!customer) {
                customer = { id: snapshot.cariCustomerIdCounter++, name: job.customer };
                snapshot.cariCustomers.push(customer);
            }
            snapshot.cariTx.push({ id: snapshot.cariTxIdCounter++, customerId: customer.id, type: job.net >= 0 ? 'borc' : 'tahsilat', amount: Math.abs(job.net), note: `Tarım mahsup: ${job.work} (${job.date})` });
            await persistSet('app-full-data', JSON.stringify(snapshot));
            job.cariSynced = true;
            renderTarimServiceJobs();
            alert('Cari Hesap modülüne kayıt aktarıldı.');
        }

        function addTarla() {
            const name = document.getElementById('tarla-name').value.trim();
            const alan = document.getElementById('tarla-alan').value.trim();
            const urun = document.getElementById('tarla-urun').value.trim();
            if (!name) { alert('Tarla adı boş olamaz.'); return; }
            tarlalar.push({ id: tarlaIdCounter++, name, alan, urun });
            document.getElementById('tarla-name').value = '';
            document.getElementById('tarla-alan').value = '';
            document.getElementById('tarla-urun').value = '';
            renderTarim();
        }

        function removeTarla(id) {
            if (!confirm('Bu tarla silinecek. Hasat ve sulama kayıtları da silinecek. Emin misin?')) return;
            tarlalar = tarlalar.filter(t => t.id !== id);
            hasatlar = hasatlar.filter(h => h.tarlaId !== id);
            delete sulamaMap[id];
            renderTarim();
        }

        function renderTarlaList() {
            const wrap = document.getElementById('tarla-list');
            wrap.innerHTML = tarlalar.length ? tarlalar.map(t => `
                <div class="prayer-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                        <strong>🗺️ ${t.name}</strong>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="removeTarla(${t.id})">Sil</button>
                    </div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${t.alan ? t.alan + ' dönüm — ' : ''}${t.urun || 'Ürün belirtilmedi'}</div>
                </div>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz tarla eklenmedi.</span>';

            const select = document.getElementById('hasat-tarla');
            select.innerHTML = tarlalar.length
                ? tarlalar.map(t => `<option value="${t.id}">${t.name}</option>`).join('')
                : '<option value="">Önce tarla ekle</option>';
        }

        function addHasat() {
            const tarlaId = parseInt(document.getElementById('hasat-tarla').value);
            const yil = document.getElementById('hasat-yil').value.trim();
            const miktarKg = parseFloat(document.getElementById('hasat-miktar').value.replace(',', '.')) || 0;
            const fiyat = parseFloat(document.getElementById('hasat-fiyat').value.replace(',', '.')) || 0;
            const masraf = parseFloat(document.getElementById('hasat-masraf').value.replace(',', '.')) || 0;
            if (!tarlaId) { alert('Önce bir tarla seç.'); return; }
            if (!yil) { alert('Yıl gir.'); return; }
            if (!miktarKg || miktarKg <= 0) { alert('Geçerli bir hasat miktarı gir.'); return; }
            hasatlar.push({ id: hasatIdCounter++, tarlaId, yil, miktarKg, fiyat, masraf });
            document.getElementById('hasat-yil').value = '';
            document.getElementById('hasat-miktar').value = '';
            document.getElementById('hasat-fiyat').value = '';
            document.getElementById('hasat-masraf').value = '';
            renderTarim();
        }

        function removeHasat(id) {
            hasatlar = hasatlar.filter(h => h.id !== id);
            renderTarim();
        }

        function renderHasatList() {
            const wrap = document.getElementById('hasat-list');
            const sorted = hasatlar.slice().reverse();
            wrap.innerHTML = sorted.length ? sorted.map(h => {
                const tarla = tarlalar.find(t => t.id === h.tarlaId);
                const gelir = h.miktarKg * h.fiyat;
                const kar = gelir - h.masraf;
                return `
                <div style="background:var(--surface-hover); padding:8px 10px; border-radius:6px; font-size:0.85rem;">
                    <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px;">
                        <span><strong>${tarla ? tarla.name : 'Silinmiş Tarla'}</strong> — ${h.yil}</span>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="removeHasat(${h.id})">Sil</button>
                    </div>
                    <div style="margin-top:4px;">Hasat: ${h.miktarKg.toLocaleString('tr-TR')} kg × ${h.fiyat.toLocaleString('tr-TR')} ₺/kg = ${gelir.toLocaleString('tr-TR')} ₺${h.masraf ? (' — Masraf: ' + h.masraf.toLocaleString('tr-TR') + ' ₺') : ''}</div>
                    <div style="font-weight:600; color:${kar >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">${kar >= 0 ? 'Kâr' : 'Zarar'}: ${Math.abs(kar).toLocaleString('tr-TR')} ₺</div>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz hasat kaydı eklenmedi.</span>';

            const totalGelir = hasatlar.reduce((s, h) => s + h.miktarKg * h.fiyat, 0);
            const totalMasraf = hasatlar.reduce((s, h) => s + h.masraf, 0);
            const totalKar = totalGelir - totalMasraf;
            document.getElementById('hasat-total').innerText =
                `Toplam Gelir: ${totalGelir.toLocaleString('tr-TR')} ₺ — Toplam Masraf: ${totalMasraf.toLocaleString('tr-TR')} ₺ — Net ${totalKar >= 0 ? 'Kâr' : 'Zarar'}: ${Math.abs(totalKar).toLocaleString('tr-TR')} ₺`;
        }

        function sulamaBugun(tarlaId) {
            sulamaMap[tarlaId] = new Date().toISOString().slice(0, 10);
            renderTarim();
        }

        function sulamaTarihGuncelle(tarlaId, value) {
            if (!value) return;
            sulamaMap[tarlaId] = value;
            renderTarim();
        }

        function renderSulamaList() {
            const wrap = document.getElementById('sulama-list');
            wrap.innerHTML = tarlalar.length ? tarlalar.map(t => {
                const lastDate = sulamaMap[t.id];
                let daysAgo = null;
                if (lastDate) {
                    const diffMs = new Date().setHours(0,0,0,0) - new Date(lastDate).setHours(0,0,0,0);
                    daysAgo = Math.round(diffMs / 86400000);
                }
                const warn = daysAgo !== null && daysAgo >= 7;
                return `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-hover); padding:8px 10px; border-radius:6px; font-size:0.85rem; flex-wrap:wrap; gap:8px;">
                    <span><strong>${t.name}</strong> — ${lastDate ? ('Son sulama: ' + lastDate + ' (' + daysAgo + ' gün önce)') : 'Hiç sulanmadı'}${warn ? ' <span style="color:var(--accent-red);">⚠️ Sulama zamanı geldi</span>' : ''}</span>
                    <div style="display:flex; gap:6px; align-items:center;">
                        <input type="date" id="sulama-date-${t.id}" onchange="sulamaTarihGuncelle(${t.id}, this.value)" style="background:#121212; border:1px solid var(--border-color); color:var(--text-main); border-radius:4px; padding:4px;">
                        <button class="btn-action btn-primary" onclick="sulamaBugun(${t.id})">💧 Bugün Sulandı</button>
                    </div>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Önce tarla ekle.</span>';
        }

        function addTohumType() {
            const input = document.getElementById('new-tohum-type');
            const value = input.value.trim();
            if (!value) return;
            if (tohumTypes.includes(value)) { input.value = ''; return; }
            tohumTypes.push(value);
            input.value = '';
            renderTarim();
        }

        function removeTohumType(value) {
            tohumTypes = tohumTypes.filter(t => t !== value);
            renderTarim();
        }

        function renderTohumTypeTags() {
            const wrap = document.getElementById('tohum-type-list');
            wrap.innerHTML = tohumTypes.length ? tohumTypes.map(t => `
                <span class="category-tag lang-tag">${t}<button onclick="removeTohumType('${t.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz çeşit eklenmedi.</span>';

            const allSet = new Set(tohumTypes);
            Object.keys(tohumStockMap).forEach(t => allSet.add(t));
            const allTypes = Array.from(allSet);

            const options = tohumTypes.length
                ? tohumTypes.map(t => `<option value="${t}">${t}</option>`).join('')
                : '<option value="">Önce çeşit ekle</option>';
            document.getElementById('tohum-stock-type').innerHTML = options;
            document.getElementById('tohum-use-type').innerHTML = options;
            return allTypes;
        }

        function addTohumStock() {
            const type = document.getElementById('tohum-stock-type').value;
            const miktar = parseFloat(document.getElementById('tohum-stock-miktar').value.replace(',', '.')) || 0;
            if (!type) { alert('Önce bir çeşit seç.'); return; }
            if (!miktar || miktar <= 0) { alert('Geçerli bir miktar gir.'); return; }
            tohumStockMap[type] = (tohumStockMap[type] || 0) + miktar;
            document.getElementById('tohum-stock-miktar').value = '';
            renderTarim();
        }

        function addTohumUse() {
            const type = document.getElementById('tohum-use-type').value;
            const miktar = parseFloat(document.getElementById('tohum-use-miktar').value.replace(',', '.')) || 0;
            if (!type) { alert('Önce bir çeşit seç.'); return; }
            if (!miktar || miktar <= 0) { alert('Geçerli bir miktar gir.'); return; }
            const remaining = (tohumStockMap[type] || 0) - (tohumUseMap[type] || 0);
            if (miktar > remaining) {
                if (!confirm(`Stokta ${remaining.toLocaleString('tr-TR')} birim ${type} var. Yine de ${miktar.toLocaleString('tr-TR')} kullanılsın mı?`)) return;
            }
            tohumUseMap[type] = (tohumUseMap[type] || 0) + miktar;
            document.getElementById('tohum-use-miktar').value = '';
            renderTarim();
        }

        function renderTohumSummary(allTypes) {
            const wrap = document.getElementById('tohum-summary');
            wrap.innerHTML = allTypes.length ? allTypes.map(t => {
                const stock = tohumStockMap[t] || 0;
                const used = tohumUseMap[t] || 0;
                const remaining = stock - used;
                return `
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding:6px 0; border-bottom:1px solid var(--border-color); flex-wrap:wrap; gap:4px;">
                    <span><strong>${t}</strong></span>
                    <span>Alınan: ${stock.toLocaleString('tr-TR')} — Kullanılan: ${used.toLocaleString('tr-TR')} — Kalan: <span style="color:${remaining < 0 ? 'var(--accent-red)' : 'var(--accent-green)'}">${remaining.toLocaleString('tr-TR')}</span></span>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz stok girilmedi.</span>';
        }

        function addBelge() {
            const name = document.getElementById('belge-name').value.trim();
            const tarih = document.getElementById('belge-tarih').value;
            if (!name) { alert('Belge adı boş olamaz.'); return; }
            if (!tarih) { alert('Bitiş/geçerlilik tarihi seç.'); return; }
            belgeler.push({ id: belgeIdCounter++, name, tarih });
            document.getElementById('belge-name').value = '';
            document.getElementById('belge-tarih').value = '';
            renderTarim();
        }

        function removeBelge(id) {
            belgeler = belgeler.filter(b => b.id !== id);
            renderTarim();
        }

        function renderBelgeList() {
            const wrap = document.getElementById('belge-list');
            const sorted = belgeler.slice().sort((a, b) => a.tarih.localeCompare(b.tarih));
            wrap.innerHTML = sorted.length ? sorted.map(b => {
                const daysLeft = Math.round((new Date(b.tarih).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
                const expired = daysLeft < 0;
                const soon = !expired && daysLeft <= 30;
                const color = expired ? 'var(--accent-red)' : (soon ? 'var(--accent-gold)' : 'var(--accent-green)');
                const statusText = expired ? `${Math.abs(daysLeft)} gün önce doldu ⚠️` : `${daysLeft} gün kaldı${soon ? ' ⚠️' : ''}`;
                return `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-hover); padding:8px 10px; border-radius:6px; font-size:0.85rem; flex-wrap:wrap; gap:6px;">
                    <span><strong>${b.name}</strong> — ${b.tarih} (<span style="color:${color}">${statusText}</span>)</span>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeBelge(${b.id})">Sil</button>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz belge eklenmedi.</span>';
        }

        function addHavaNote() {
            const input = document.getElementById('hava-note');
            const note = input.value.trim();
            if (!note) return;
            havaNotlari.push({ id: havaNoteIdCounter++, date: new Date().toISOString().slice(0, 10), note });
            input.value = '';
            renderTarim();
        }

        function removeHavaNote(id) {
            havaNotlari = havaNotlari.filter(n => n.id !== id);
            renderTarim();
        }

        function renderHavaList() {
            const wrap = document.getElementById('hava-list');
            const sorted = havaNotlari.slice().reverse();
            wrap.innerHTML = sorted.length ? sorted.map(n => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-hover); padding:6px 10px; border-radius:6px; font-size:0.85rem; flex-wrap:wrap; gap:6px;">
                    <span>🌡️ ${n.date} — ${n.note}</span>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeHavaNote(${n.id})">✕</button>
                </div>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz not eklenmedi.</span>';
        }

        function renderTarimMachineSection() {
            const list = document.getElementById('tarim-machine-list');
            const machineSelect = document.getElementById('tarim-job-machine');
            const fieldSelect = document.getElementById('tarim-job-field');
            if (!list || !machineSelect || !fieldSelect) return;
            list.innerHTML = tarimMachines.length ? tarimMachines.map(machine => `
                <span class="tarim-machine-tag">🚜 ${machine.name}${machine.type ? ` · ${machine.type}` : ''} · ${machine.pricing}<button class="btn-action" style="padding:1px 5px; color:var(--accent-red);" onclick="removeTarimMachine(${machine.id})">✕</button></span>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz makine eklenmedi.</span>';
            machineSelect.innerHTML = tarimMachines.length
                ? tarimMachines.map(machine => `<option value="${machine.id}">${machine.name} (${machine.pricing})</option>`).join('')
                : '<option value="">Önce makine ekle</option>';
            fieldSelect.innerHTML = tarlalar.length
                ? '<option value="">Tarla seç (opsiyonel)</option>' + tarlalar.map(field => `<option value="${field.id}">${field.name}</option>`).join('')
                : '<option value="">Önce tarla ekle</option>';
            const date = document.getElementById('tarim-job-date');
            if (date && !date.value) date.value = todayStr();
        }

        function renderTarimJobFilters() {
            const filters = [
                ['tarim-job-customer-filter', [...new Set(tarimServiceJobs.map(job => job.customer))]],
                ['tarim-job-machine-filter', [...new Set(tarimServiceJobs.map(job => tarimMachines.find(machine => machine.id === job.machineId)?.name).filter(Boolean))]],
                ['tarim-job-work-filter', [...new Set(tarimServiceJobs.map(job => job.work).filter(Boolean))]],
                ['tarim-job-status-filter', [...new Set(tarimServiceJobs.map(job => job.status).filter(Boolean))]]
            ];
            filters.forEach(([id, values]) => {
                const select = document.getElementById(id);
                if (!select) return;
                const selected = select.value;
                const label = id.includes('customer') ? 'Tüm müşteriler' : id.includes('machine') ? 'Tüm makineler' : id.includes('work') ? 'Tüm işler' : 'Tüm durumlar';
                select.innerHTML = `<option value="all">${label}</option>` + values.sort((a, b) => a.localeCompare(b, 'tr')).map(value => `<option value="${value.replace(/"/g, '&quot;')}">${value}</option>`).join('');
                select.value = values.includes(selected) ? selected : 'all';
            });
        }

        function renderTarimServiceJobs() {
            const wrap = document.getElementById('tarim-service-job-list');
            const statsWrap = document.getElementById('tarim-job-stats');
            if (!wrap || !statsWrap) return;
            renderTarimJobFilters();
            const search = (document.getElementById('tarim-job-search')?.value || '').trim().toLocaleLowerCase('tr-TR');
            const customer = document.getElementById('tarim-job-customer-filter')?.value || 'all';
            const machine = document.getElementById('tarim-job-machine-filter')?.value || 'all';
            const work = document.getElementById('tarim-job-work-filter')?.value || 'all';
            const status = document.getElementById('tarim-job-status-filter')?.value || 'all';
            const visible = tarimServiceJobs.slice().reverse().filter(job => {
                const machineName = tarimMachines.find(item => item.id === job.machineId)?.name || '';
                const searchable = `${job.customer} ${job.work} ${job.product} ${machineName} ${job.note}`.toLocaleLowerCase('tr-TR');
                return (!search || searchable.includes(search)) && (customer === 'all' || job.customer === customer) && (machine === 'all' || machineName === machine) && (work === 'all' || job.work === work) && (status === 'all' || job.status === status);
            });
            const totals = tarimServiceJobs.reduce((sum, job) => ({
                service: sum.service + job.serviceTotal,
                product: sum.product + job.productTotal,
                expenses: sum.expenses + job.expenses,
                receivable: sum.receivable + (['Ödendi', 'Mahsup edildi'].includes(job.status) ? 0 : Math.max(0, job.net)),
                payable: sum.payable + (['Ödendi', 'Mahsup edildi'].includes(job.status) ? 0 : Math.max(0, -job.net)),
                earnings: sum.earnings + job.serviceTotal - job.expenses
            }), { service: 0, product: 0, expenses: 0, receivable: 0, payable: 0, earnings: 0 });
            statsWrap.innerHTML = [['Hizmet geliri', totals.service], ['Ürün alımı', totals.product], ['Toplam gider', totals.expenses], ['Bekleyen alacak', totals.receivable], ['Net kazanç', totals.earnings]].map(([label, value]) => `<div class="tarim-job-stat"><strong>${formatTarimMoney(value)}</strong><span>${label}</span></div>`).join('');
            wrap.innerHTML = visible.length ? visible.map(job => {
                const machineName = tarimMachines.find(item => item.id === job.machineId)?.name || 'Makine belirtilmedi';
                const fieldName = tarlalar.find(field => field.id === job.fieldId)?.name || 'Tarla belirtilmedi';
                return `<div class="prayer-card tarim-job-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;"><strong>🚜 ${job.work} — ${job.customer}</strong><span class="category-tag">${job.status}</span></div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">${job.date} · ${fieldName} · ${machineName}</div>
                    <div style="font-size:0.82rem;">Hizmet: ${formatTarimMoney(job.serviceTotal)} · Ürün: ${formatTarimMoney(job.productTotal)} · Gider: ${formatTarimMoney(job.expenses)}</div>
                    <strong style="color:${job.net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">${tarimJobResultText(job.net)}</strong>
                    ${job.product ? `<div style="font-size:0.8rem; color:var(--text-muted);">Alınan: ${job.productQuantity} ${job.productUnit || 'birim'} ${job.product} × ${formatTarimMoney(job.productPrice)}</div>` : ''}
                    ${job.note ? `<div style="font-size:0.8rem;">${job.note.replace(/</g, '&lt;')}</div>` : ''}
                    <div style="display:flex; gap:6px; flex-wrap:wrap;"><button class="btn-action" onclick="syncTarimJobToCari(${job.id})">${job.cariSynced ? '✓ Cari Aktarıldı' : '📒 Cari Hesaba Aktar'}</button><button class="btn-action" onclick="addTarimJobToDailyProgram(${job.id})">📅 Günlük Programa Ekle</button><button class="btn-action" style="color:var(--accent-red)" onclick="removeTarimServiceJob(${job.id})">Sil</button></div>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Filtreye uygun iş kaydı yok.</span>';
        }

        function renderTarim() {
            renderTarlaList();
            renderHasatList();
            renderTarimMachineSection();
            renderTarimServiceJobs();
            renderSulamaList();
            const allTohumTypes = renderTohumTypeTags();
            renderTohumSummary(allTohumTypes);
            renderBelgeList();
            renderHavaList();
            document.getElementById('tarim-count').innerText = `${tarlalar.length} tarla`;
        }

