        // ================= ENSTRÜMAN & DERS TAKİBİ =================
        let instrumentCategories = [];
        let lessonCategories = [];
        let instrumentItems = [];
        let editingInstrumentId = null;
        let instrumentIdCounter = 1;

        function addInstrumentCategory(kind) {
            const inputId = kind === 'instrument' ? 'new-instrument-cat' : 'new-lesson-cat';
            const input = document.getElementById(inputId);
            const value = input.value.trim();
            if (!value) return;

            const list = kind === 'instrument' ? instrumentCategories : lessonCategories;
            if (list.includes(value)) { input.value = ''; return; }
            list.push(value);
            input.value = '';
            renderInstrumentCategories();
            renderInstrumentCategoryOptions();
        }

        function removeInstrumentCategory(kind, value) {
            if (kind === 'instrument') {
                instrumentCategories = instrumentCategories.filter(c => c !== value);
            } else {
                lessonCategories = lessonCategories.filter(c => c !== value);
            }
            renderInstrumentCategories();
            renderInstrumentCategoryOptions();
        }

        function renderInstrumentCategories() {
            const instWrap = document.getElementById('instrument-categories-list');
            instWrap.innerHTML = instrumentCategories.map(c => `
                <span class="category-tag lang-tag">${c}<button onclick="removeInstrumentCategory('instrument', '${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz enstrüman kategorisi eklenmedi.</span>';

            const lessonWrap = document.getElementById('lesson-categories-list');
            lessonWrap.innerHTML = lessonCategories.map(c => `
                <span class="category-tag type-tag">${c}<button onclick="removeInstrumentCategory('lesson', '${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz ders kategorisi eklenmedi.</span>';
        }

        function renderInstrumentCategoryOptions() {
            const instSelect = document.getElementById('instrument-instrument-cat');
            const lessonSelect = document.getElementById('instrument-lesson-cat');
            instSelect.innerHTML = instrumentCategories.length
                ? instrumentCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce enstrüman ekle</option>';
            lessonSelect.innerHTML = lessonCategories.length
                ? lessonCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce ders kategorisi ekle</option>';
        }

        function saveInstrumentItem() {
            const title = document.getElementById('instrument-title').value.trim();
            const content = document.getElementById('instrument-content').value.trim();
            const youtube = document.getElementById('instrument-youtube').value.trim();
            const instCat = document.getElementById('instrument-instrument-cat').value;
            const lessonCat = document.getElementById('instrument-lesson-cat').value;
            const practiceMinutes = Math.max(0, parseInt(document.getElementById('instrument-practice-minutes').value) || 0);
            const bpm = Math.max(0, parseInt(document.getElementById('instrument-bpm').value) || 0);
            const difficulty = document.getElementById('instrument-difficulty').value;
            const progress = document.getElementById('instrument-progress').value;

            if (!title) { alert('Eser ismi / başlık boş olamaz.'); return; }

            if (editingInstrumentId !== null) {
                const item = instrumentItems.find(i => i.id === editingInstrumentId);
                if (item) {
                    item.title = title;
                    item.content = content;
                    item.youtube = youtube;
                    item.instCat = instCat;
                    item.lessonCat = lessonCat;
                    item.practiceMinutes = practiceMinutes;
                    item.bpm = bpm;
                    item.difficulty = difficulty;
                    item.progress = progress;
                }
                editingInstrumentId = null;
                document.getElementById('instrument-save-btn').innerText = 'Kaydet';
            } else {
                instrumentItems.push({
                    id: instrumentIdCounter++,
                    title, content, youtube, instCat, lessonCat,
                    practiceMinutes, bpm, difficulty, progress,
                    doneDate: null,
                    practiceLog: {}
                });
            }

            document.getElementById('instrument-title').value = '';
            document.getElementById('instrument-content').value = '';
            document.getElementById('instrument-youtube').value = '';
            document.getElementById('instrument-practice-minutes').value = '';
            document.getElementById('instrument-bpm').value = '';
            document.getElementById('instrument-difficulty').value = '';
            document.getElementById('instrument-progress').value = 'Başlangıç';
            renderInstrumentItems();
        }

        function editInstrumentItem(id) {
            const item = instrumentItems.find(i => i.id === id);
            if (!item) return;
            document.getElementById('instrument-title').value = item.title;
            document.getElementById('instrument-content').value = item.content;
            document.getElementById('instrument-youtube').value = item.youtube;
            document.getElementById('instrument-instrument-cat').value = item.instCat;
            document.getElementById('instrument-lesson-cat').value = item.lessonCat;
            document.getElementById('instrument-practice-minutes').value = item.practiceMinutes || '';
            document.getElementById('instrument-bpm').value = item.bpm || '';
            document.getElementById('instrument-difficulty').value = item.difficulty || '';
            document.getElementById('instrument-progress').value = item.progress || 'Başlangıç';
            editingInstrumentId = id;
            document.getElementById('instrument-save-btn').innerText = 'Güncelle';
            document.querySelectorAll('.recipe-form')[3].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function deleteInstrumentItem(id) {
            instrumentItems = instrumentItems.filter(i => i.id !== id);
            if (editingInstrumentId === id) {
                editingInstrumentId = null;
                document.getElementById('instrument-save-btn').innerText = 'Kaydet';
            }
            renderInstrumentItems();
        }

        function toggleInstrumentDone(id, checked) {
            const item = instrumentItems.find(i => i.id === id);
            if (!item) return;
            const today = new Date().toISOString().slice(0, 10);
            if (!item.practiceLog) item.practiceLog = {};
            item.doneDate = checked ? today : null;
            if (checked) item.practiceLog[today] = item.practiceMinutes || 1;
            else delete item.practiceLog[today];
            renderInstrumentItems();
        }

        function getInstrumentPracticeLog(item) {
            if (!item.practiceLog) item.practiceLog = {};
            if (item.doneDate && !Object.keys(item.practiceLog).length) {
                item.practiceLog[item.doneDate] = item.practiceMinutes || 1;
            }
            return item.practiceLog;
        }

        function computeInstrumentStreak(item) {
            const log = getInstrumentPracticeLog(item);
            const cursor = new Date();
            let streak = 0;
            const today = cursor.toISOString().slice(0, 10);
            if (!log[today]) cursor.setDate(cursor.getDate() - 1);
            while (log[cursor.toISOString().slice(0, 10)] > 0) {
                streak++;
                cursor.setDate(cursor.getDate() - 1);
            }
            return streak;
        }

        function instrumentWeekMinutes(item) {
            const log = getInstrumentPracticeLog(item);
            const cursor = new Date();
            let total = 0;
            for (let i = 0; i < 7; i++) {
                total += log[cursor.toISOString().slice(0, 10)] || 0;
                cursor.setDate(cursor.getDate() - 1);
            }
            return total;
        }

        function renderInstrumentItems() {
            const wrap = document.getElementById('instrument-list');
            const today = new Date().toISOString().slice(0, 10);

            document.getElementById('instrument-count').innerText = instrumentItems.length + ' kayıt';

            if (!instrumentItems.length) {
                wrap.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz kayıt eklenmedi.</span>';
                return;
            }

            wrap.innerHTML = instrumentItems.map(i => {
                const practiceLog = getInstrumentPracticeLog(i);
                const doneToday = i.doneDate === today;
                const todayMinutes = practiceLog[today] || 0;
                const streak = computeInstrumentStreak(i);
                const weekMinutes = instrumentWeekMinutes(i);
                const catsHtml = [
                    i.instCat ? `<span class="category-tag lang-tag">${i.instCat}</span>` : '',
                    i.lessonCat ? `<span class="category-tag type-tag">${i.lessonCat}</span>` : ''
                ].join('');
                const ytHtml = i.youtube ? `<a class="recipe-yt" href="${i.youtube}" target="_blank" rel="noopener">▶ YouTube'da izle</a>` : '';
                const difficultyHtml = i.difficulty ? `<span class="category-tag">Zorluk ${i.difficulty}/5</span>` : '';
                const progressHtml = i.progress ? `<span class="category-tag type-tag">${i.progress}</span>` : '';
                const bpmHtml = i.bpm ? ` · 🎵 ${i.bpm} BPM` : '';

                return `
                <div class="recipe-card ${doneToday ? 'done-today' : ''}">
                    <h3>${i.title}</h3>
                    <div class="recipe-cats">${catsHtml}</div>
                    <div class="instrument-progress">${difficultyHtml}${progressHtml}</div>
                    <div class="recipe-content">${i.content ? i.content.replace(/</g, '&lt;') : ''}</div>
                    <div class="instrument-practice-summary">⏱️ Bugün ${todayMinutes} dk · Bu hafta ${weekMinutes} dk${bpmHtml} · 🔥 ${streak} gün seri</div>
                    ${ytHtml}
                    <label class="done-check">
                        <input type="checkbox" ${doneToday ? 'checked' : ''} onchange="toggleInstrumentDone(${i.id}, this.checked)">
                        Bugün bunu yaptım
                    </label>
                    <div class="recipe-actions">
                        <button class="btn-action" onclick="addToDailyProgram('${i.title.replace(/'/g, "\\'")}')">📅 Günlük Programa Ekle</button>
                        <button class="btn-action" onclick="editInstrumentItem(${i.id})">Düzenle</button>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="deleteInstrumentItem(${i.id})">Sil</button>
                    </div>
                </div>`;
            }).join('');
        }

