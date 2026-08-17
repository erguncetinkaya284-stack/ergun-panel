        // ================= YABANCI DİL TAKİBİ =================
        let langCategories = [];
        let topicCategories = [];
        let langItems = [];
        let editingLangId = null;
        let langIdCounter = 1;

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
            const youtube = document.getElementById('lang-youtube').value.trim();
            const langCat = document.getElementById('lang-lang-cat').value;
            const topicCat = document.getElementById('lang-topic-cat').value;

            if (!title) { alert('Başlık boş olamaz.'); return; }

            if (editingLangId !== null) {
                const item = langItems.find(i => i.id === editingLangId);
                if (item) {
                    item.title = title;
                    item.content = content;
                    item.youtube = youtube;
                    item.langCat = langCat;
                    item.topicCat = topicCat;
                }
                editingLangId = null;
                document.getElementById('lang-save-btn').innerText = 'Kaydet';
            } else {
                langItems.push({
                    id: langIdCounter++,
                    title, content, youtube, langCat, topicCat,
                    readDate: null,
                    redoneDate: null
                });
            }

            document.getElementById('lang-title').value = '';
            document.getElementById('lang-content').value = '';
            document.getElementById('lang-youtube').value = '';
            renderLangItems();
        }

        function editLangItem(id) {
            const item = langItems.find(i => i.id === id);
            if (!item) return;
            document.getElementById('lang-title').value = item.title;
            document.getElementById('lang-content').value = item.content;
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
            item.readDate = checked ? today : null;
            renderLangItems();
        }

        function toggleLangRedone(id, checked) {
            const item = langItems.find(i => i.id === id);
            if (!item) return;
            const today = new Date().toISOString().slice(0, 10);
            item.redoneDate = checked ? today : null;
            renderLangItems();
        }

        function renderLangItems() {
            const wrap = document.getElementById('lang-list');
            const today = new Date().toISOString().slice(0, 10);

            document.getElementById('lang-count').innerText = langItems.length + ' kayıt';

            if (!langItems.length) {
                wrap.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz kayıt eklenmedi.</span>';
                return;
            }

            wrap.innerHTML = langItems.map(i => {
                const readToday = i.readDate === today;
                const redoneToday = i.redoneDate === today;
                const catsHtml = [
                    i.langCat ? `<span class="category-tag lang-tag">${i.langCat}</span>` : '',
                    i.topicCat ? `<span class="category-tag type-tag">${i.topicCat}</span>` : ''
                ].join('');
                const ytHtml = i.youtube ? `<a class="recipe-yt" href="${i.youtube}" target="_blank" rel="noopener">▶ YouTube'da izle</a>` : '';

                return `
                <div class="recipe-card ${(readToday || redoneToday) ? 'done-today' : ''}">
                    <h3>${i.title}</h3>
                    <div class="recipe-cats">${catsHtml}</div>
                    <div class="recipe-content">${i.content ? i.content.replace(/</g, '&lt;') : ''}</div>
                    ${ytHtml}
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

