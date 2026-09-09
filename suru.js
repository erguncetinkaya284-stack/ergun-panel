        // ================= SÜRÜ / BESİ TAKİBİ =================
        let suruItems = []; // {id, kupeNo, tur, irk, girisTarihi, alisFiyati, cikisTarihi, cikisFiyati, durum, kiloLog:[{tarih,kg}], yemLog:[{tarih,kg,maliyet}], vetLog:[{tarih,not}]}
        let suruIdCounter = 1;
        let suruTypes = ['Tosun', 'Dana', 'İnek', 'Koyun', 'Keçi'];

        function addSuruType() {
            const input = document.getElementById('new-suru-type');
            const value = input.value.trim();
            if (!value) return;
            if (suruTypes.includes(value)) { input.value = ''; return; }
            suruTypes.push(value);
            input.value = '';
            renderSuru();
        }

        function removeSuruType(value) {
            suruTypes = suruTypes.filter(t => t !== value);
            renderSuru();
        }

        function renderSuruTypeTags() {
            const wrap = document.getElementById('suru-type-list');
            wrap.innerHTML = suruTypes.length ? suruTypes.map(t => `
                <span class="category-tag lang-tag">${t}<button onclick="removeSuruType('${t.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz tür eklenmedi.</span>';

            const select = document.getElementById('suru-new-tur');
            select.innerHTML = suruTypes.length
                ? suruTypes.map(t => `<option value="${t}">${t}</option>`).join('')
                : '<option value="">Önce tür ekle</option>';
        }

        function addSuruAnimal() {
            const kupeNo = document.getElementById('suru-new-kupe').value.trim();
            const tur = document.getElementById('suru-new-tur').value;
            const irk = document.getElementById('suru-new-irk').value.trim();
            const girisTarihi = document.getElementById('suru-new-giris-tarihi').value || todayStr();
            const alisFiyati = parseFloat(document.getElementById('suru-new-alis-fiyati').value.replace(',', '.')) || 0;
            const kiloBaslangic = parseFloat(document.getElementById('suru-new-kilo').value.replace(',', '.')) || 0;
            if (!kupeNo) { alert('Küpe no gir.'); return; }
            if (suruItems.some(a => a.kupeNo === kupeNo && a.durum === 'sürüde')) {
                alert('Bu küpe no ile sürüde zaten bir hayvan var.'); return;
            }
            if (!tur) { alert('Önce bir tür seç.'); return; }
            const animal = {
                id: suruIdCounter++,
                kupeNo, tur, irk, girisTarihi, alisFiyati,
                cikisTarihi: null, cikisFiyati: 0, durum: 'sürüde',
                kiloLog: kiloBaslangic > 0 ? [{ tarih: girisTarihi, kg: kiloBaslangic }] : [],
                yemLog: [], vetLog: []
            };
            suruItems.push(animal);
            document.getElementById('suru-new-kupe').value = '';
            document.getElementById('suru-new-irk').value = '';
            document.getElementById('suru-new-alis-fiyati').value = '';
            document.getElementById('suru-new-kilo').value = '';
            renderSuru();
        }

        function suruFindAnimal(id) {
            return suruItems.find(a => a.id === id);
        }

        function suruLastKilo(animal) {
            if (!animal.kiloLog.length) return null;
            return animal.kiloLog[animal.kiloLog.length - 1].kg;
        }

        function suruGunlukKiloArtisi(animal) {
            if (animal.kiloLog.length < 2) return null;
            const first = animal.kiloLog[0];
            const last = animal.kiloLog[animal.kiloLog.length - 1];
            const gun = Math.max(1, Math.round((new Date(last.tarih) - new Date(first.tarih)) / 86400000));
            return (last.kg - first.kg) / gun;
        }

        function suruYemToplamMaliyet(animal) {
            return animal.yemLog.reduce((sum, y) => sum + (y.maliyet || 0), 0);
        }

        function suruAddKilo(id) {
            const animal = suruFindAnimal(id);
            if (!animal) return;
            const kg = parseFloat(prompt('Yeni kilo (kg):', suruLastKilo(animal) || '') || '');
            if (!kg || kg <= 0) return;
            animal.kiloLog.push({ tarih: todayStr(), kg });
            renderSuru();
        }

        function suruAddYem(id) {
            const animal = suruFindAnimal(id);
            if (!animal) return;
            const kg = parseFloat(prompt('Verilen yem (kg):', '') || '');
            if (!kg || kg <= 0) return;
            const maliyet = parseFloat(prompt('Yemin maliyeti (₺, opsiyonel):', '0') || '0') || 0;
            animal.yemLog.push({ tarih: todayStr(), kg, maliyet });
            renderSuru();
        }

        function suruAddVet(id) {
            const animal = suruFindAnimal(id);
            if (!animal) return;
            const not = prompt('Aşı / veteriner notu:', '');
            if (!not || !not.trim()) return;
            animal.vetLog.push({ tarih: todayStr(), not: not.trim() });
            renderSuru();
        }

        function suruCikisYap(id) {
            const animal = suruFindAnimal(id);
            if (!animal) return;
            if (animal.durum !== 'sürüde') { alert('Bu hayvan zaten çıkış yapmış.'); return; }
            const durum = confirm('Kesim mi (Tamam), yoksa satış mı (İptal)?') ? 'kesildi' : 'satıldı';
            const fiyat = parseFloat(prompt('Çıkış fiyatı (₺):', '') || '0') || 0;
            animal.durum = durum;
            animal.cikisTarihi = todayStr();
            animal.cikisFiyati = fiyat;
            renderSuru();
        }

        function suruSil(id) {
            if (!confirm('Bu kaydı tamamen silmek istediğine emin misin?')) return;
            suruItems = suruItems.filter(a => a.id !== id);
            renderSuru();
        }

        function renderSuruList() {
            const wrap = document.getElementById('suru-list');
            const filterDurum = document.getElementById('suru-filter-durum').value;
            const query = (document.getElementById('suru-search').value || '').trim().toLowerCase();
            let list = suruItems.slice().reverse();
            if (filterDurum) list = list.filter(a => a.durum === filterDurum);
            if (query) list = list.filter(a => a.kupeNo.toLowerCase().includes(query) || a.tur.toLowerCase().includes(query));

            wrap.innerHTML = list.length ? list.map(a => {
                const kilo = suruLastKilo(a);
                const artis = suruGunlukKiloArtisi(a);
                const yemMaliyet = suruYemToplamMaliyet(a);
                const durumRenk = a.durum === 'sürüde' ? 'var(--accent-green)' : (a.durum === 'kesildi' ? 'var(--accent-red)' : 'var(--text-muted)');
                return `
                <div class="prayer-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                        <strong>🏷️ ${a.kupeNo} — ${a.tur}${a.irk ? ' (' + a.irk + ')' : ''}</strong>
                        <span style="color:${durumRenk}; font-size:0.85rem; font-weight:600;">${a.durum}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; flex-wrap:wrap; gap:6px;">
                        <span>Giriş: ${a.girisTarihi} — ${a.alisFiyati.toLocaleString('tr-TR')} ₺</span>
                        <span>Güncel Kilo: ${kilo !== null ? kilo.toLocaleString('tr-TR') + ' kg' : '—'}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; flex-wrap:wrap; gap:6px;">
                        <span>Günlük Ortalama Artış: ${artis !== null ? artis.toFixed(2) + ' kg/gün' : '—'}</span>
                        <span>Toplam Yem Maliyeti: ${yemMaliyet.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    ${a.durum !== 'sürüde' ? `<div style="font-size:0.85rem;">Çıkış: ${a.cikisTarihi} — ${a.cikisFiyati.toLocaleString('tr-TR')} ₺</div>` : ''}
                    ${a.vetLog.length ? `<div style="font-size:0.8rem; color:var(--text-muted);">Son vet notu: ${a.vetLog[a.vetLog.length - 1].not} (${a.vetLog[a.vetLog.length - 1].tarih})</div>` : ''}
                    <div style="display:flex; gap:6px; flex-wrap:wrap; border-top:1px solid var(--border-color); padding-top:8px;">
                        <button class="btn-action" onclick="suruAddKilo(${a.id})">⚖️ Kilo Ekle</button>
                        <button class="btn-action" onclick="suruAddYem(${a.id})">🌾 Yem Ekle</button>
                        <button class="btn-action" onclick="suruAddVet(${a.id})">💉 Vet Notu</button>
                        ${a.durum === 'sürüde' ? `<button class="btn-action" onclick="suruCikisYap(${a.id})">📤 Çıkış Yap</button>` : ''}
                        <button class="btn-action" style="color:var(--accent-red)" onclick="suruSil(${a.id})">Sil</button>
                    </div>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Kayıt bulunamadı.</span>';
        }

        function renderSuru() {
            renderSuruTypeTags();
            renderSuruList();

            const surude = suruItems.filter(a => a.durum === 'sürüde');
            const cikanlar = suruItems.filter(a => a.durum !== 'sürüde');
            const toplamAlisDeger = surude.reduce((sum, a) => sum + a.alisFiyati, 0);
            const toplamYemMaliyet = suruItems.reduce((sum, a) => sum + suruYemToplamMaliyet(a), 0);
            const toplamCikisDeger = cikanlar.reduce((sum, a) => sum + a.cikisFiyati, 0);

            document.getElementById('suru-count').innerText = `${surude.length} hayvan sürüde`;
            document.getElementById('suru-total').innerText =
                `Sürüde: ${surude.length} — Çıkış Yapan: ${cikanlar.length} — Sürü Alış Değeri: ${toplamAlisDeger.toLocaleString('tr-TR')} ₺ — Toplam Yem Maliyeti: ${toplamYemMaliyet.toLocaleString('tr-TR')} ₺ — Toplam Çıkış Geliri: ${toplamCikisDeger.toLocaleString('tr-TR')} ₺`;
        }
