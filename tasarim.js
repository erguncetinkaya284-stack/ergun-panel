        // ================= TASARIM/ÇİZİM PROGRAMLARI ÖĞRENİYORUM =================
        let tasarimProgramCategories = [];
        let tasarimTopicCategories = [];
        let tasarimItems = [];
        let editingTasarimId = null;
        let tasarimIdCounter = 1;

        function addTasarimCategory(kind) {
            const inputId = kind === 'program' ? 'new-tasarim-cat' : 'new-tasarim-topic';
            const input = document.getElementById(inputId);
            const value = input.value.trim();
            if (!value) return;

            const list = kind === 'program' ? tasarimProgramCategories : tasarimTopicCategories;
            if (list.includes(value)) { input.value = ''; return; }
            list.push(value);
            input.value = '';
            renderTasarimCategories();
            renderTasarimCategoryOptions();
        }

        function removeTasarimCategory(kind, value) {
            if (kind === 'program') {
                tasarimProgramCategories = tasarimProgramCategories.filter(c => c !== value);
            } else {
                tasarimTopicCategories = tasarimTopicCategories.filter(c => c !== value);
            }
            renderTasarimCategories();
            renderTasarimCategoryOptions();
        }

        function renderTasarimCategories() {
            const progWrap = document.getElementById('tasarim-program-list');
            progWrap.innerHTML = tasarimProgramCategories.map(c => `
                <span class="category-tag lang-tag">${c}<button onclick="removeTasarimCategory('program', '${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz program eklenmedi.</span>';

            const topicWrap = document.getElementById('tasarim-topic-list');
            topicWrap.innerHTML = tasarimTopicCategories.map(c => `
                <span class="category-tag type-tag">${c}<button onclick="removeTasarimCategory('topic', '${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz konu eklenmedi.</span>';
        }

        function renderTasarimCategoryOptions() {
            const progSelect = document.getElementById('tasarim-program-cat');
            const topicSelect = document.getElementById('tasarim-topic-cat');
            progSelect.innerHTML = tasarimProgramCategories.length
                ? tasarimProgramCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce program ekle</option>';
            topicSelect.innerHTML = tasarimTopicCategories.length
                ? tasarimTopicCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce konu ekle</option>';
        }

        function saveTasarimItem() {
            const title = document.getElementById('tasarim-title').value.trim();
            const content = document.getElementById('tasarim-content').value.trim();
            const youtube = document.getElementById('tasarim-youtube').value.trim();
            const programCat = document.getElementById('tasarim-program-cat').value;
            const topicCat = document.getElementById('tasarim-topic-cat').value;

            if (!title) { alert('Başlık boş olamaz.'); return; }

            if (editingTasarimId !== null) {
                const item = tasarimItems.find(i => i.id === editingTasarimId);
                if (item) {
                    item.title = title;
                    item.content = content;
                    item.youtube = youtube;
                    item.programCat = programCat;
                    item.topicCat = topicCat;
                }
                editingTasarimId = null;
                document.getElementById('tasarim-save-btn').innerText = 'Kaydet';
            } else {
                tasarimItems.push({
                    id: tasarimIdCounter++,
                    title, content, youtube, programCat, topicCat,
                    doneDate: null
                });
            }

            document.getElementById('tasarim-title').value = '';
            document.getElementById('tasarim-content').value = '';
            document.getElementById('tasarim-youtube').value = '';
            renderTasarim();
        }

        function editTasarimItem(id) {
            const item = tasarimItems.find(i => i.id === id);
            if (!item) return;
            document.getElementById('tasarim-title').value = item.title;
            document.getElementById('tasarim-content').value = item.content;
            document.getElementById('tasarim-youtube').value = item.youtube;
            document.getElementById('tasarim-program-cat').value = item.programCat;
            document.getElementById('tasarim-topic-cat').value = item.topicCat;
            editingTasarimId = id;
            document.getElementById('tasarim-save-btn').innerText = 'Güncelle';
            document.getElementById('tasarim-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function deleteTasarimItem(id) {
            tasarimItems = tasarimItems.filter(i => i.id !== id);
            if (editingTasarimId === id) {
                editingTasarimId = null;
                document.getElementById('tasarim-save-btn').innerText = 'Kaydet';
            }
            renderTasarim();
        }

        function toggleTasarimDone(id, checked) {
            const item = tasarimItems.find(i => i.id === id);
            if (!item) return;
            const today = new Date().toISOString().slice(0, 10);
            item.doneDate = checked ? today : null;
            renderTasarim();
        }

        function renderTasarim() {
            renderTasarimCategories();
            renderTasarimCategoryOptions();

            const wrap = document.getElementById('tasarim-list');
            const today = new Date().toISOString().slice(0, 10);

            document.getElementById('tasarim-count').innerText = tasarimItems.length + ' kayıt';

            if (!tasarimItems.length) {
                wrap.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz kayıt eklenmedi.</span>';
                return;
            }

            wrap.innerHTML = tasarimItems.map(i => {
                const doneToday = i.doneDate === today;
                const catsHtml = [
                    i.programCat ? `<span class="category-tag lang-tag">${i.programCat}</span>` : '',
                    i.topicCat ? `<span class="category-tag type-tag">${i.topicCat}</span>` : ''
                ].join('');
                const ytHtml = i.youtube ? `<a class="recipe-yt" href="${i.youtube}" target="_blank" rel="noopener">▶ YouTube'da izle</a>` : '';

                return `
                <div class="recipe-card ${doneToday ? 'done-today' : ''}">
                    <h3>${i.title}</h3>
                    <div class="recipe-cats">${catsHtml}</div>
                    <div class="recipe-content">${i.content ? i.content.replace(/</g, '&lt;') : ''}</div>
                    ${ytHtml}
                    <label class="done-check">
                        <input type="checkbox" ${doneToday ? 'checked' : ''} onchange="toggleTasarimDone(${i.id}, this.checked)">
                        Bugün pratik yaptım
                    </label>
                    <div class="recipe-actions">
                        <button class="btn-action" onclick="addToDailyProgram('${i.title.replace(/'/g, "\\'")}')">📅 Günlük Programa Ekle</button>
                        <button class="btn-action" onclick="editTasarimItem(${i.id})">Düzenle</button>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="deleteTasarimItem(${i.id})">Sil</button>
                    </div>
                </div>`;
            }).join('');
        }

