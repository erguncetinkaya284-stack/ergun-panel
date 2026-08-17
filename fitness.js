        // ================= FİTNESS TAKİBİ =================
        let fitnessCategories = [];
        let fitnessItems = [];
        let editingFitnessId = null;
        let fitnessIdCounter = 1;

        let bodyMeasurements = []; // {id, date, weight, waist, chest, arm, note}
        let measurementIdCounter = 1;

        function addFitnessCategory() {
            const input = document.getElementById('new-fitness-cat');
            const value = input.value.trim();
            if (!value) return;
            if (fitnessCategories.includes(value)) { input.value = ''; return; }
            fitnessCategories.push(value);
            input.value = '';
            renderFitnessCategories();
            renderFitnessCategoryOptions();
        }

        function removeFitnessCategory(value) {
            fitnessCategories = fitnessCategories.filter(c => c !== value);
            renderFitnessCategories();
            renderFitnessCategoryOptions();
        }

        function renderFitnessCategories() {
            const wrap = document.getElementById('fitness-categories-list');
            wrap.innerHTML = fitnessCategories.map(c => `
                <span class="category-tag">${c}<button onclick="removeFitnessCategory('${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz branş kategorisi eklenmedi.</span>';
        }

        function renderFitnessCategoryOptions() {
            const select = document.getElementById('fitness-cat');
            select.innerHTML = fitnessCategories.length
                ? fitnessCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce branş kategorisi ekle</option>';
        }

        function saveFitnessItem() {
            const title = document.getElementById('fitness-title').value.trim();
            const content = document.getElementById('fitness-content').value.trim();
            const youtube = document.getElementById('fitness-youtube').value.trim();
            const cat = document.getElementById('fitness-cat').value;
            const sets = parseInt(document.getElementById('fitness-sets').value) || 0;
            const reps = parseInt(document.getElementById('fitness-reps').value) || 0;
            const weight = document.getElementById('fitness-weight').value.trim();

            if (!title) { alert('Başlık boş olamaz.'); return; }

            if (editingFitnessId !== null) {
                const item = fitnessItems.find(i => i.id === editingFitnessId);
                if (item) {
                    item.title = title;
                    item.content = content;
                    item.youtube = youtube;
                    item.cat = cat;
                    item.sets = sets;
                    item.reps = reps;
                    item.weight = weight;
                }
                editingFitnessId = null;
                document.getElementById('fitness-save-btn').innerText = 'Kaydet';
            } else {
                fitnessItems.push({
                    id: fitnessIdCounter++,
                    title, content, youtube, cat, sets, reps, weight,
                    log: {} // {'YYYY-MM-DD': true}
                });
            }

            document.getElementById('fitness-title').value = '';
            document.getElementById('fitness-content').value = '';
            document.getElementById('fitness-youtube').value = '';
            document.getElementById('fitness-sets').value = '';
            document.getElementById('fitness-reps').value = '';
            document.getElementById('fitness-weight').value = '';
            renderFitnessItems();
        }

        function editFitnessItem(id) {
            const item = fitnessItems.find(i => i.id === id);
            if (!item) return;
            document.getElementById('fitness-title').value = item.title;
            document.getElementById('fitness-content').value = item.content;
            document.getElementById('fitness-youtube').value = item.youtube;
            document.getElementById('fitness-cat').value = item.cat;
            document.getElementById('fitness-sets').value = item.sets || '';
            document.getElementById('fitness-reps').value = item.reps || '';
            document.getElementById('fitness-weight').value = item.weight || '';
            editingFitnessId = id;
            document.getElementById('fitness-save-btn').innerText = 'Güncelle';
            document.querySelectorAll('.recipe-form')[4].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function deleteFitnessItem(id) {
            fitnessItems = fitnessItems.filter(i => i.id !== id);
            if (editingFitnessId === id) {
                editingFitnessId = null;
                document.getElementById('fitness-save-btn').innerText = 'Kaydet';
            }
            renderFitnessItems();
        }

        function computeFitnessStreak(item) {
            if (!item.log) item.log = {};
            let streak = 0;
            const cursor = new Date();
            const keyFor = d => d.toISOString().slice(0, 10);
            const todayKey = todayStr();
            if (!item.log[todayKey]) {
                cursor.setDate(cursor.getDate() - 1);
            }
            while (item.log[keyFor(cursor)]) {
                streak++;
                cursor.setDate(cursor.getDate() - 1);
            }
            return streak;
        }

        function toggleFitnessDone(id, checked) {
            const item = fitnessItems.find(i => i.id === id);
            if (!item) return;
            if (!item.log) item.log = {};
            const today = todayStr();
            if (checked) item.log[today] = true;
            else delete item.log[today];
            renderFitnessItems();
        }

        function renderFitnessItems() {
            const wrap = document.getElementById('fitness-list');
            const today = todayStr();

            document.getElementById('fitness-count').innerText = fitnessItems.length + ' kayıt';

            if (!fitnessItems.length) {
                wrap.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz kayıt eklenmedi.</span>';
                return;
            }

            wrap.innerHTML = fitnessItems.map(i => {
                if (!i.log) i.log = {};
                const doneToday = !!i.log[today];
                const streak = computeFitnessStreak(i);
                const catHtml = i.cat ? `<span class="category-tag">${i.cat}</span>` : '';
                const ytHtml = i.youtube ? `<a class="recipe-yt" href="${i.youtube}" target="_blank" rel="noopener">▶ YouTube'da izle</a>` : '';
                const statsParts = [];
                if (i.sets) statsParts.push(`${i.sets} set`);
                if (i.reps) statsParts.push(`${i.reps} tekrar`);
                if (i.weight) statsParts.push(`${i.weight} kg`);
                const statsHtml = statsParts.length ? `<div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">🏋️ ${statsParts.join(' × ')}</div>` : '';

                return `
                <div class="recipe-card ${doneToday ? 'done-today' : ''}">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                        <h3 style="margin:0;">${i.title}</h3>
                        <span class="category-tag" style="background:rgba(241,196,15,0.15); border-color:rgba(241,196,15,0.4); color:var(--accent-gold);">🔥 ${streak} gün</span>
                    </div>
                    <div class="recipe-cats">${catHtml}</div>
                    ${statsHtml}
                    <div class="recipe-content">${i.content ? i.content.replace(/</g, '&lt;') : ''}</div>
                    ${ytHtml}
                    <label class="done-check">
                        <input type="checkbox" ${doneToday ? 'checked' : ''} onchange="toggleFitnessDone(${i.id}, this.checked)">
                        Bugün bunu yaptım
                    </label>
                    <div class="recipe-actions">
                        <button class="btn-action" onclick="addToDailyProgram('${i.title.replace(/'/g, "\\'")}')">📅 Günlük Programa Ekle</button>
                        <button class="btn-action" onclick="editFitnessItem(${i.id})">Düzenle</button>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="deleteFitnessItem(${i.id})">Sil</button>
                    </div>
                </div>`;
            }).join('');
        }

        // ---- Vücut Ölçüleri Takibi ----
        function addMeasurement() {
            const date = document.getElementById('measure-date').value || todayStr();
            const weight = document.getElementById('measure-weight').value.trim();
            const waist = document.getElementById('measure-waist').value.trim();
            const chest = document.getElementById('measure-chest').value.trim();
            const arm = document.getElementById('measure-arm').value.trim();
            const note = document.getElementById('measure-note').value.trim();

            if (!weight && !waist && !chest && !arm) { alert('En az bir ölçüm değeri gir.'); return; }

            bodyMeasurements.push({ id: measurementIdCounter++, date, weight, waist, chest, arm, note });
            bodyMeasurements.sort((a, b) => a.date.localeCompare(b.date));

            document.getElementById('measure-date').value = '';
            document.getElementById('measure-weight').value = '';
            document.getElementById('measure-waist').value = '';
            document.getElementById('measure-chest').value = '';
            document.getElementById('measure-arm').value = '';
            document.getElementById('measure-note').value = '';
            renderMeasurements();
        }

        function removeMeasurement(id) {
            bodyMeasurements = bodyMeasurements.filter(m => m.id !== id);
            renderMeasurements();
        }

        function renderMeasurements() {
            const summaryWrap = document.getElementById('measure-summary');
            const listWrap = document.getElementById('measure-list');
            if (!summaryWrap || !listWrap) return;

            if (!bodyMeasurements.length) {
                summaryWrap.innerHTML = '';
                listWrap.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz ölçüm eklenmedi.</span>';
                return;
            }

            const first = bodyMeasurements[0];
            const last = bodyMeasurements[bodyMeasurements.length - 1];
            let summaryHtml = '';
            if (bodyMeasurements.length > 1 && first.weight && last.weight) {
                const diff = (parseFloat(last.weight.replace(',', '.')) - parseFloat(first.weight.replace(',', '.')));
                const sign = diff > 0 ? '+' : '';
                summaryHtml = `
                    <div style="background:rgba(74,163,255,0.1); border:1px solid rgba(74,163,255,0.3); border-radius:8px; padding:8px 12px; font-size:0.85rem;">
                        📊 İlk ölçüm (${first.date}): ${first.weight} kg → Son ölçüm (${last.date}): ${last.weight} kg
                        <strong style="color:${diff < 0 ? 'var(--accent-green)' : diff > 0 ? 'var(--accent-red)' : 'var(--text-color)'};">(${sign}${diff.toFixed(1)} kg)</strong>
                    </div>`;
            }
            summaryWrap.innerHTML = summaryHtml;

            const sortedDesc = [...bodyMeasurements].sort((a, b) => b.date.localeCompare(a.date));
            listWrap.innerHTML = sortedDesc.map(m => {
                const parts = [];
                if (m.weight) parts.push(`⚖️ ${m.weight} kg`);
                if (m.waist) parts.push(`Bel: ${m.waist} cm`);
                if (m.chest) parts.push(`Göğüs: ${m.chest} cm`);
                if (m.arm) parts.push(`Kol: ${m.arm} cm`);
                return `
                <div class="prayer-card" style="padding:8px 12px; margin-bottom:6px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                        <strong>${m.date}</strong>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="removeMeasurement(${m.id})">Sil</button>
                    </div>
                    <div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">${parts.join(' • ')}</div>
                    ${m.note ? `<div style="font-size:0.85rem; margin-top:4px;">${m.note.replace(/</g, '&lt;')}</div>` : ''}
                </div>`;
            }).join('');
        }
