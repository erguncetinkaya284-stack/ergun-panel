        // ================= YABANCI DİL TAKİBİ =================
        let langCategories = [];
        let topicCategories = [];
        let langItems = [];
        let editingLangId = null;
        let langIdCounter = 1;
        const LANG_REVIEW_INTERVALS = [1, 3, 7, 14, 30];
        const openLangCards = {};
        let langActivityHistory = {};

        function recordLangActivity(type) {
            const today = new Date().toISOString().slice(0, 10);
            if (!langActivityHistory[today]) langActivityHistory[today] = {};
            langActivityHistory[today][type] = (langActivityHistory[today][type] || 0) + 1;
        }

        function addLangCategory(kind) {
            const inputId = kind === 'lang' ? 'new-lang-cat' : 'new-topic-cat';
            const input = document.getElementById(inputId);
            const value = input.value.trim();
            if (!value) return;

            const list = kind === 'lang' ? langCategories : topicCategories;
            if (list.includes(value)) { input.value = ''; return; }
            list.push(value);
            input.value = '';
            renderLangCategories();
            renderLangCategoryOptions();
        }

        function removeLangCategory(kind, value) {
            if (kind === 'lang') {
                langCategories = langCategories.filter(c => c !== value);
            } else {
                topicCategories = topicCategories.filter(c => c !== value);
            }
            renderLangCategories();
            renderLangCategoryOptions();
        }

        function renderLangCategories() {
            const langWrap = document.getElementById('lang-categories-list');
            langWrap.innerHTML = langCategories.map(c => `
                <span class="category-tag lang-tag">${c}<button onclick="removeLangCategory('lang', '${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz dil kategorisi eklenmedi.</span>';

            const topicWrap = document.getElementById('topic-categories-list');
            topicWrap.innerHTML = topicCategories.map(c => `
                <span class="category-tag type-tag">${c}<button onclick="removeLangCategory('topic', '${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz konu kategorisi eklenmedi.</span>';
        }

        function renderLangCategoryOptions() {
            const langSelect = document.getElementById('lang-lang-cat');
            const topicSelect = document.getElementById('lang-topic-cat');
            langSelect.innerHTML = langCategories.length
                ? langCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce dil kategorisi ekle</option>';
            topicSelect.innerHTML = topicCategories.length
                ? topicCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce konu kategorisi ekle</option>';
        }

        function saveLangItem() {
            const title = document.getElementById('lang-title').value.trim();
            const content = document.getElementById('lang-content').value.trim();
            const example = document.getElementById('lang-example').value.trim();
            const youtube = document.getElementById('lang-youtube').value.trim();
            const langCat = document.getElementById('lang-lang-cat').value;
            const topicCat = document.getElementById('lang-topic-cat').value;

            if (!title) { alert('Başlık boş olamaz.'); return; }

            if (editingLangId !== null) {
                const item = langItems.find(i => i.id === editingLangId);
                if (item) {
                    item.title = title;
                    item.content = content;
                    item.example = example;
                    item.youtube = youtube;
                    item.langCat = langCat;
                    item.topicCat = topicCat;
                }
                editingLangId = null;
                document.getElementById('lang-save-btn').innerText = 'Kaydet';
            } else {
                langItems.push({
                    id: langIdCounter++,
                    title, content, example, youtube, langCat, topicCat,
                    readDate: null,
                    redoneDate: null,
                    reviewLevel: 0,
                    nextReviewAt: null,
                    correctCount: 0,
                    wrongCount: 0
                });
            }

            document.getElementById('lang-title').value = '';
            document.getElementById('lang-content').value = '';
            document.getElementById('lang-example').value = '';
            document.getElementById('lang-youtube').value = '';
            renderLangItems();
        }

        function editLangItem(id) {
            const item = langItems.find(i => i.id === id);
            if (!item) return;
            document.getElementById('lang-title').value = item.title;
            document.getElementById('lang-content').value = item.content;
            document.getElementById('lang-example').value = item.example || '';
            document.getElementById('lang-youtube').value = item.youtube;
            document.getElementById('lang-lang-cat').value = item.langCat;
            document.getElementById('lang-topic-cat').value = item.topicCat;
            editingLangId = id;
            document.getElementById('lang-save-btn').innerText = 'Güncelle';
            document.querySelectorAll('.recipe-form')[2].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function deleteLangItem(id) {
            langItems = langItems.filter(i => i.id !== id);
            if (editingLangId === id) {
                editingLangId = null;
                document.getElementById('lang-save-btn').innerText = 'Kaydet';
            }
            renderLangItems();
        }

        function toggleLangRead(id, checked) {
            const item = langItems.find(i => i.id === id);
            if (!item) return;
            const today = new Date().toISOString().slice(0, 10);
            const wasRead = item.readDate === today;
            item.readDate = checked ? today : null;
            if (checked && !wasRead) recordLangActivity('read');
            renderLangItems();
        }

        function toggleLangRedone(id, checked) {
            const item = langItems.find(i => i.id === id);
            if (!item) return;
            const today = new Date().toISOString().slice(0, 10);
            const wasRedone = item.redoneDate === today;
            item.redoneDate = checked ? today : null;
            if (checked && !wasRedone) recordLangActivity('repeat');
            renderLangItems();
        }

        function ensureLangReviewStats(item) {
            if (typeof item.reviewLevel !== 'number') item.reviewLevel = 0;
            if (typeof item.correctCount !== 'number') item.correctCount = 0;
            if (typeof item.wrongCount !== 'number') item.wrongCount = 0;
        }

        function isLangReviewDue(item) {
            return item.nextReviewAt && new Date(item.nextReviewAt) <= new Date();
        }

        function toggleLangCard(id) {
            openLangCards[id] = !openLangCards[id];
            renderLangItems();
        }

        function reviewLangItem(id, remembered) {
            const item = langItems.find(i => i.id === id);
            if (!item) return;
            ensureLangReviewStats(item);
            const today = new Date();
            const days = remembered
                ? LANG_REVIEW_INTERVALS[Math.min(item.reviewLevel, LANG_REVIEW_INTERVALS.length - 1)]
                : 1;
            if (remembered) {
                item.correctCount++;
                item.reviewLevel = Math.min(item.reviewLevel + 1, LANG_REVIEW_INTERVALS.length - 1);
                recordLangActivity('correct');
            } else {
                item.wrongCount++;
                item.reviewLevel = 0;
                recordLangActivity('wrong');
            }
            recordLangActivity('repeat');
            today.setDate(today.getDate() + days);
            item.nextReviewAt = today.toISOString();
            openLangCards[id] = false;
            renderLangItems();
        }

        function renderLangReviewSummary() {
            const wrap = document.getElementById('lang-review-summary');
            if (!wrap) return;
            const dueCount = langItems.filter(isLangReviewDue).length;
            const reviewedCount = langItems.filter(item => item.correctCount > 0 || item.wrongCount > 0).length;
            wrap.innerHTML = `
                <div class="lang-review-badge"><strong>${dueCount}</strong> tekrar bekliyor</div>
                <div class="lang-review-badge"><strong>${reviewedCount}</strong> kart çalışıldı</div>
                <div class="lang-review-badge">Aralıklar: 1 · 3 · 7 · 14 · 30 gün</div>`;
        }

            function renderLangDailyStats() {
                const wrap = document.getElementById('lang-daily-stats');
                if (!wrap) return;
                const today = new Date().toISOString().slice(0, 10);
                const stats = langActivityHistory[today] || {};
                wrap.innerHTML = `
                <div class="lang-daily-stat"><strong>${stats.read || 0}</strong><span>Bugün okunan</span></div>
                <div class="lang-daily-stat"><strong>${stats.repeat || 0}</strong><span>Tekrar</span></div>
                <div class="lang-daily-stat"><strong>${stats.correct || 0}</strong><span>Doğru</span></div>
                <div class="lang-daily-stat"><strong>${stats.wrong || 0}</strong><span>Zorlanılan</span></div>`;
            }

        function renderLangItems() {
            const wrap = document.getElementById('lang-list');
            const today = new Date().toISOString().slice(0, 10);

            document.getElementById('lang-count').innerText = langItems.length + ' kayıt';
            renderLangReviewSummary();
            renderLangDailyStats();

            if (!langItems.length) {
                wrap.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz kayıt eklenmedi.</span>';
                return;
            }

            wrap.innerHTML = langItems.map(i => {
                ensureLangReviewStats(i);
                const readToday = i.readDate === today;
                const redoneToday = i.redoneDate === today;
                const cardOpen = !!openLangCards[i.id];
                const answerHtml = cardOpen ? `<div class="lang-card-answer"><strong>Anlam / açıklama:</strong><br>${(i.content || 'Henüz anlam girilmedi.').replace(/</g, '&lt;')}${i.example ? `<br><br><strong>Örnek:</strong> ${i.example.replace(/</g, '&lt;')}` : ''}</div>` : '';
                const dueHtml = isLangReviewDue(i) ? '<span class="category-tag" style="color:var(--accent-gold);">🔔 Tekrar zamanı</span>' : '';
                const catsHtml = [
                    i.langCat ? `<span class="category-tag lang-tag">${i.langCat}</span>` : '',
                    i.topicCat ? `<span class="category-tag type-tag">${i.topicCat}</span>` : ''
                ].join('');
                const ytHtml = i.youtube ? `<a class="recipe-yt" href="${i.youtube}" target="_blank" rel="noopener">▶ YouTube'da izle</a>` : '';

                return `
                <div class="recipe-card ${(readToday || redoneToday) ? 'done-today' : ''}">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
                        <h3 style="margin:0;">${i.title}</h3>
                        ${dueHtml}
                    </div>
                    <div class="recipe-cats">${catsHtml}</div>
                    ${answerHtml}
                    ${ytHtml}
                    <div class="lang-review-actions">
                        <button class="btn-action" onclick="toggleLangCard(${i.id})">${cardOpen ? 'Anlamı Gizle' : 'Kartı Göster'}</button>
                        <button class="btn-action btn-primary" onclick="reviewLangItem(${i.id}, true)">Hatırladım</button>
                        <button class="btn-action" onclick="reviewLangItem(${i.id}, false)">Zorlandım</button>
                    </div>
                    <div class="done-check-row">
                        <label class="done-check">
                            <input type="checkbox" ${readToday ? 'checked' : ''} onchange="toggleLangRead(${i.id}, this.checked)">
                            Bugün okudum
                        </label>
                        <label class="done-check">
                            <input type="checkbox" ${redoneToday ? 'checked' : ''} onchange="toggleLangRedone(${i.id}, this.checked)">
                            Tekrar yaptım
                        </label>
                    </div>
                    <div class="recipe-actions">
                        <button class="btn-action" onclick="addToDailyProgram('${i.title.replace(/'/g, "\\'")}')">📅 Günlük Programa Ekle</button>
                        <button class="btn-action" onclick="editLangItem(${i.id})">Düzenle</button>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="deleteLangItem(${i.id})">Sil</button>
                    </div>
                </div>`;
            }).join('');
        }

