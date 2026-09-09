        // ================= İBADET TAKİBİ =================
        const PRAYER_TIMES = [
            { key: 'sabah', label: 'Sabah' },
            { key: 'ogle', label: 'Öğle' },
            { key: 'ikindi', label: 'İkindi' },
            { key: 'aksam', label: 'Akşam' },
            { key: 'yatsi', label: 'Yatsı' }
        ];
        let prayerData = {};
        PRAYER_TIMES.forEach(p => prayerData[p.key] = { prayedDate: null, quranDate: null, note: '' });

        let cumaData = { prayedDate: null, note: '' };

        let ramazanModeOn = false;
        let teravihData = { prayedDate: null, note: '' };

        // Kur'an ezber takibi: her durak eklendiğinde hedef +10 artar (kümülatif tekrar yöntemi)
        let quranDuraks = []; // [{id, text}]
        let quranDurakIdCounter = 1;
        let quranRepeatCount = 0;

        // Elifba Kitabı
        let elifbaPages = [
            { id: 1, title: '1. Sayfa - Harfler', content: 'Elif, Be, Te, Se, Cim, Ha, Hı, Dal, Zel, Ra, Ze, Sin, Şin, Sad, Dad, Tı, Zı, Ayn, Gayn, Fe, Kaf, Kef, Lam, Mim, Nun, Vav, He, Lamelif, Ye', done: false }
        ];
        let elifbaPageIdCounter = 2;

        // Geçmiş/Takvim/Streak: her gün için hangi vakitlerin kılındığı ayrı ayrı kaydedilir.
        // { "2026-09-09": { sabah: true, ogle: false, ... }, ... }
        let prayerHistory = {};

        function ensureHistoryDay(date) {
            if (!prayerHistory[date]) prayerHistory[date] = {};
            return prayerHistory[date];
        }

        function ibadetPastDates(n) {
            const dates = [];
            const base = new Date();
            for (let i = 0; i < n; i++) {
                const d = new Date(base);
                d.setDate(d.getDate() - i);
                dates.push(d.toISOString().slice(0, 10));
            }
            return dates;
        }

        function ibadetDayDoneCount(date) {
            const day = prayerHistory[date];
            if (!day) return 0;
            return PRAYER_TIMES.filter(p => day[p.key] === true).length;
        }

        function ibadetDayComplete(date) {
            return ibadetDayDoneCount(date) === PRAYER_TIMES.length;
        }

        // Bugün henüz bitmediği için, gün tamamlanmamışsa seriyi bozmadan dünden başlar.
        function ibadetCurrentStreak() {
            const dates = ibadetPastDates(365);
            let startIndex = ibadetDayComplete(dates[0]) ? 0 : 1;
            let streak = 0;
            for (let i = startIndex; i < dates.length; i++) {
                if (ibadetDayComplete(dates[i])) streak++;
                else break;
            }
            return streak;
        }

        function ibadetBestStreak() {
            const allDates = Object.keys(prayerHistory).sort();
            let best = 0, current = 0, prevDate = null;
            allDates.forEach(date => {
                if (ibadetDayComplete(date)) {
                    if (prevDate) {
                        const diffDays = Math.round((new Date(date) - new Date(prevDate)) / 86400000);
                        current = diffDays === 1 ? current + 1 : 1;
                    } else {
                        current = 1;
                    }
                    best = Math.max(best, current);
                    prevDate = date;
                } else {
                    current = 0;
                    prevDate = null;
                }
            });
            return best;
        }

        function ibadetLast30Ratio() {
            const dates = ibadetPastDates(30);
            const total = dates.reduce((sum, d) => sum + ibadetDayDoneCount(d), 0);
            return Math.round((total / (30 * PRAYER_TIMES.length)) * 100);
        }

        function renderIbadetCalendar() {
            const wrap = document.getElementById('ibadet-calendar');
            if (!wrap) return;
            const dates = ibadetPastDates(14).reverse();
            wrap.innerHTML = dates.map(d => {
                const count = ibadetDayDoneCount(d);
                let cls = 'cal-day-empty';
                if (count === PRAYER_TIMES.length) cls = 'cal-day-full';
                else if (count > 0) cls = 'cal-day-partial';
                const label = d.slice(8, 10);
                return `<div class="cal-day ${cls}" title="${d}: ${count}/${PRAYER_TIMES.length} vakit">
                    <span class="cal-day-num">${label}</span>
                </div>`;
            }).join('');
        }

        function renderIbadetStats() {
            const wrap = document.getElementById('ibadet-stats');
            if (!wrap) return;
            const streak = ibadetCurrentStreak();
            const best = ibadetBestStreak();
            const ratio = ibadetLast30Ratio();
            wrap.innerHTML = `
                <div class="ibadet-stat-card">
                    <div class="ibadet-stat-num" style="color:var(--accent-green);">🔥 ${streak}</div>
                    <div class="ibadet-stat-label">Güncel Seri (gün)</div>
                </div>
                <div class="ibadet-stat-card">
                    <div class="ibadet-stat-num" style="color:var(--accent-blue);">🏆 ${best}</div>
                    <div class="ibadet-stat-label">En İyi Seri (gün)</div>
                </div>
                <div class="ibadet-stat-card">
                    <div class="ibadet-stat-num" style="color:var(--accent-gold);">${ratio}%</div>
                    <div class="ibadet-stat-label">Son 30 Gün Oranı</div>
                </div>`;
        }

        function togglePrayer(key, checked) {
            const today = todayStr();
            prayerData[key].prayedDate = checked ? today : null;
            ensureHistoryDay(today)[key] = checked;
            renderIbadet();
        }

        function toggleQuran(key, checked) {
            prayerData[key].quranDate = checked ? todayStr() : null;
            renderIbadet();
        }

        function updatePrayerNote(key, value) {
            prayerData[key].note = value;
        }

        function toggleCuma(checked) {
            cumaData.prayedDate = checked ? todayStr() : null;
            renderIbadet();
        }

        function updateCumaNote(value) {
            cumaData.note = value;
        }

        function toggleRamazanMode(checked) {
            ramazanModeOn = checked;
            renderIbadet();
        }

        function toggleTeravih(checked) {
            teravihData.prayedDate = checked ? todayStr() : null;
            renderIbadet();
        }

        function updateTeravihNote(value) {
            teravihData.note = value;
        }

        function renderTeravihCard() {
            const wrap = document.getElementById('teravih-wrap');
            const toggle = document.getElementById('ramazan-mode-toggle');
            if (toggle) toggle.checked = ramazanModeOn;

            if (!ramazanModeOn) { wrap.innerHTML = ''; return; }

            const today = todayStr();
            const done = teravihData.prayedDate === today;
            const noteEscaped = (teravihData.note || '').replace(/</g, '&lt;');
            wrap.innerHTML = `
                <div class="prayer-card ${done ? 'done-today' : ''}" style="margin-top:10px;">
                    <h3>🌙 Teravih Namazı</h3>
                    <textarea class="prayer-note" placeholder="Bugünkü teravih notların (kaç rekat, hangi camide...)" oninput="updateTeravihNote(this.value)">${noteEscaped}</textarea>
                    <div class="done-check-row">
                        <label class="done-check">
                            <input type="checkbox" ${done ? 'checked' : ''} onchange="toggleTeravih(this.checked)">
                            Teravih namazını kıldım
                        </label>
                    </div>
                </div>`;
        }

        // ---- Kur'an Ezber Takibi ----
        function quranTarget() {
            return quranDuraks.length * 10;
        }

        function addElifbaPage() {
            const titleInput = document.getElementById('elifba-page-title');
            const contentInput = document.getElementById('elifba-page-content');
            const title = titleInput.value.trim();
            const content = contentInput.value.trim();
            if (!title) { alert('Sayfa başlığı gir.'); return; }
            elifbaPages.push({ id: elifbaPageIdCounter++, title, content, done: false });
            titleInput.value = '';
            contentInput.value = '';
            renderElifba();
        }

        function toggleElifbaPage(id, checked) {
            const page = elifbaPages.find(p => p.id === id);
            if (page) page.done = checked;
            renderElifba();
        }

        function removeElifbaPage(id) {
            if (!confirm('Bu sayfayı silmek istediğine emin misin?')) return;
            elifbaPages = elifbaPages.filter(p => p.id !== id);
            renderElifba();
        }

        function renderElifba() {
            const listWrap = document.getElementById('elifba-page-list');
            const label = document.getElementById('elifba-progress-label');
            if (!listWrap) return;

            const doneCount = elifbaPages.filter(p => p.done).length;
            if (label) label.innerText = elifbaPages.length ? `(${doneCount}/${elifbaPages.length} sayfa tamamlandı)` : '';

            listWrap.innerHTML = elifbaPages.length ? elifbaPages.map(p => `
                <div class="prayer-card ${p.done ? 'done-today' : ''}" style="padding:10px 12px; margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
                        <strong>${p.title.replace(/</g, '&lt;')}</strong>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="removeElifbaPage(${p.id})">Sil</button>
                    </div>
                    ${p.content ? `<div style="font-size:0.9rem; margin-top:6px; color:var(--text-color);">${p.content.replace(/</g, '&lt;')}</div>` : ''}
                    <label class="done-check" style="margin-top:8px;">
                        <input type="checkbox" ${p.done ? 'checked' : ''} onchange="toggleElifbaPage(${p.id}, this.checked)">
                        Bu sayfayı tamamladım
                    </label>
                </div>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz sayfa eklenmedi.</span>';
        }

        function addQuranDurak() {
            const input = document.getElementById('quran-durak-input');
            const arabicInput = document.getElementById('quran-durak-arabic');
            const audioInput = document.getElementById('quran-durak-audio');
            const text = input.value.trim();
            const arabic = arabicInput.value.trim();
            const audioUrl = audioInput.value.trim();
            if (!text) return;

            const target = quranTarget();
            if (quranDuraks.length > 0 && quranRepeatCount < target) {
                const proceed = confirm(`Henüz ${quranRepeatCount}/${target} tekrarı tamamlamadın. Yine de yeni durak eklemek istiyor musun? (Sayaç sıfırlanacak)`);
                if (!proceed) return;
            }

            quranDuraks.push({ id: quranDurakIdCounter++, text, arabic, audioUrl });
            quranRepeatCount = 0;
            input.value = '';
            arabicInput.value = '';
            audioInput.value = '';
            renderQuranDurak();
        }

        function removeLastQuranDurak() {
            if (!quranDuraks.length) return;
            if (!confirm('Son eklenen durağı silmek istediğine emin misin? Sayaç sıfırlanacak.')) return;
            quranDuraks.pop();
            quranRepeatCount = 0;
            renderQuranDurak();
        }

        function markQuranRepeat() {
            const target = quranTarget();
            if (!target) { alert('Önce en az bir durak ekle.'); return; }
            if (quranRepeatCount >= target) return;
            quranRepeatCount++;
            renderQuranDurak();
        }

        function resetQuranRepeat() {
            if (!confirm('Bu setin tekrar sayacını sıfırlamak istediğine emin misin?')) return;
            quranRepeatCount = 0;
            renderQuranDurak();
        }

        function renderQuranDurak() {
            const target = quranTarget();
            const progressWrap = document.getElementById('quran-durak-progress');
            const listWrap = document.getElementById('quran-durak-list');
            if (!progressWrap || !listWrap) return;

            if (!quranDuraks.length) {
                progressWrap.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz durak eklenmedi. İlk durağını ekleyerek başla — hedef 10 tekrar olacak.</span>';
                listWrap.innerHTML = '';
                return;
            }

            const complete = quranRepeatCount >= target;
            progressWrap.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                    <button class="btn-action btn-primary" onclick="markQuranRepeat()" ${complete ? 'disabled' : ''}>
                        ${complete ? '✓ Set Tamamlandı' : '📖 Okudum, Tekrar Ekle'}
                    </button>
                    <strong style="color:${complete ? 'var(--accent-green)' : 'var(--text-color)'};">${quranRepeatCount} / ${target} tekrar</strong>
                    <button class="btn-action" onclick="resetQuranRepeat()">↺ Sıfırla</button>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeLastQuranDurak()">Son Durağı Sil</button>
                </div>
                <div style="height:8px; background:var(--border-color); border-radius:4px; margin-top:8px; overflow:hidden;">
                    <div style="height:100%; width:${Math.min(100, (quranRepeatCount/target)*100)}%; background:${complete ? 'var(--accent-green)' : 'var(--accent-blue)'}; transition:width 0.2s;"></div>
                </div>
                ${complete ? '<div style="margin-top:6px; font-size:0.85rem; color:var(--accent-green);">Bu seti tamamladın — yeni bir durak ekleyebilirsin.</div>' : ''}
            `;

            listWrap.innerHTML = `
                <h4 style="font-size:0.85rem; color:var(--text-muted); margin-bottom:6px;">Ezberlenen Duraklar (${quranDuraks.length})</h4>
                <div style="display:flex; flex-direction:column; gap:6px;">
                    ${quranDuraks.map((d, i) => `
                        <div class="prayer-card" style="padding:8px 10px;">
                            <span style="font-size:0.75rem; color:var(--accent-blue);">${i + 1}.</span>
                            <span style="font-size:0.9rem;">${d.text.replace(/</g, '&lt;')}</span>
                            ${d.arabic ? `<div dir="rtl" style="font-size:1.05rem; margin-top:4px; color:var(--text-color);">${d.arabic.replace(/</g, '&lt;')}</div>` : ''}
                            ${d.audioUrl ? `<div style="margin-top:4px;"><a href="${d.audioUrl.replace(/"/g, '&quot;')}" target="_blank" rel="noopener" style="font-size:0.8rem; color:var(--accent-blue);">🎧 Ses kaydını dinle</a></div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function renderIbadet() {
            const today = todayStr();
            const wrap = document.getElementById('ibadet-list');
            let doneCount = 0;

            wrap.innerHTML = PRAYER_TIMES.map(p => {
                const d = prayerData[p.key];
                const prayed = d.prayedDate === today;
                const quran = d.quranDate === today;
                if (prayed) doneCount++;
                const noteEscaped = (d.note || '').replace(/</g, '&lt;');

                return `
                <div class="prayer-card ${prayed ? 'done-today' : ''}">
                    <h3>${p.label} Namazı</h3>
                    <textarea class="prayer-note" placeholder="Bu vakit nasıl kılınır? (rekat sayısı, sünnet/farz notları...)" oninput="updatePrayerNote('${p.key}', this.value)">${noteEscaped}</textarea>
                    <div class="done-check-row">
                        <label class="done-check">
                            <input type="checkbox" ${prayed ? 'checked' : ''} onchange="togglePrayer('${p.key}', this.checked)">
                            Namazı kıldım
                        </label>
                        <label class="done-check">
                            <input type="checkbox" ${quran ? 'checked' : ''} onchange="toggleQuran('${p.key}', this.checked)">
                            Kur'an okudum
                        </label>
                    </div>
                </div>`;
            }).join('');

            const cumaPrayed = cumaData.prayedDate === today;
            const cumaNoteEscaped = (cumaData.note || '').replace(/</g, '&lt;');
            wrap.innerHTML += `
                <div class="prayer-card ${cumaPrayed ? 'done-today' : ''}">
                    <h3>Cuma Namazı <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(haftalık, öğle namazının yerine)</span></h3>
                    <textarea class="prayer-note" placeholder="Bugünkü hutbe/cemaat notların..." oninput="updateCumaNote(this.value)">${cumaNoteEscaped}</textarea>
                    <div class="done-check-row">
                        <label class="done-check">
                            <input type="checkbox" ${cumaPrayed ? 'checked' : ''} onchange="toggleCuma(this.checked)">
                            Cuma namazını kıldım
                        </label>
                    </div>
                </div>`;

            document.getElementById('ibadet-count').innerText = `Bugün ${doneCount}/5 vakit`;

            renderIbadetStats();
            renderIbadetCalendar();
            renderTeravihCard();
            renderQuranDurak();
            renderElifba();
        }

