        // ================= TASARIM/ÇİZİM PROGRAMLARI ÖĞRENİYORUM =================
        // egitim_mufredati_prompti.txt yapısına göre 3 seviyeli hiyerarşi:
        //   Ana Başlık (1.)   = Program (Blender, AutoCAD, Photoshop...)
        //   Alt Başlık (1.1.) = Konu (Arayüz, Modelleme, Render...)
        //   Anlatım (1.1.1.)  = Fiili ders içeriği (metin + YouTube linki)
        // Not: 40 soruluk quiz sistemi henüz eklenmedi (sıradaki adım).
        let tasarimSubjects = []; // {id, name}
        let tasarimSubjectIdCounter = 1;
        let tasarimTopics = []; // {id, subjectId, name}
        let tasarimTopicIdCounter = 1;
        let tasarimAnlatimlar = []; // {id, topicId, name, content, youtube, saved, doneDate, selectedTechniques:[], techniqueNote}
        let tasarimAnlatimIdCounter = 1;

        // 11 öğretim tekniği - tüm modül genelinde ortak, bir kere tanımlanır (en fazla 11 madde).
        // Her Anlatım bu listeden 1-3 tanesini seçip "neden seçildi" notu ekler.
        let tasarimTechniques = [];

        function addTasarimTechnique() {
            const input = document.getElementById('new-tasarim-technique');
            const value = input.value.trim();
            if (!value) return;
            if (tasarimTechniques.length >= 11) { alert('En fazla 11 teknik ekleyebilirsin.'); return; }
            if (tasarimTechniques.includes(value)) { input.value = ''; return; }
            tasarimTechniques.push(value);
            input.value = '';
            renderTasarim();
        }

        function removeTasarimTechnique(value) {
            tasarimTechniques = tasarimTechniques.filter(t => t !== value);
            // Silinen teknik, seçilmiş olduğu tüm anlatımlardan da çıkarılır.
            tasarimAnlatimlar.forEach(a => {
                a.selectedTechniques = (a.selectedTechniques || []).filter(t => t !== value);
            });
            renderTasarim();
        }

        function renderTasarimTechniqueList() {
            const wrap = document.getElementById('tasarim-technique-list');
            if (!wrap) return;
            wrap.innerHTML = tasarimTechniques.length ? tasarimTechniques.map((t, i) => `
                <span class="category-tag lang-tag">${i + 1}. ${t}<button onclick="removeTasarimTechnique('${t.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz teknik eklenmedi (en fazla 11 tane).</span>';
        }

        function addTasarimSubject() {
            const input = document.getElementById('new-tasarim-subject');
            const name = input.value.trim();
            if (!name) { alert('Program adı boş olamaz.'); return; }
            tasarimSubjects.push({ id: tasarimSubjectIdCounter++, name });
            input.value = '';
            renderTasarim();
        }

        function removeTasarimSubject(id) {
            if (!confirm('Bu program ve içindeki tüm konular/anlatımlar silinecek. Emin misin?')) return;
            const topicIds = tasarimTopics.filter(t => t.subjectId === id).map(t => t.id);
            tasarimAnlatimlar = tasarimAnlatimlar.filter(a => !topicIds.includes(a.topicId));
            tasarimTopics = tasarimTopics.filter(t => t.subjectId !== id);
            tasarimSubjects = tasarimSubjects.filter(s => s.id !== id);
            renderTasarim();
        }

        function addTasarimTopic(subjectId) {
            const input = document.getElementById('new-tasarim-topic-' + subjectId);
            const name = input.value.trim();
            if (!name) { alert('Konu adı boş olamaz.'); return; }
            tasarimTopics.push({ id: tasarimTopicIdCounter++, subjectId, name });
            renderTasarim();
        }

        function removeTasarimTopic(id) {
            if (!confirm('Bu konu ve içindeki tüm anlatımlar silinecek. Emin misin?')) return;
            tasarimAnlatimlar = tasarimAnlatimlar.filter(a => a.topicId !== id);
            tasarimTopics = tasarimTopics.filter(t => t.id !== id);
            renderTasarim();
        }

        function addTasarimAnlatim(topicId) {
            const input = document.getElementById('new-tasarim-anlatim-' + topicId);
            const name = input.value.trim();
            if (!name) { alert('Anlatım başlığı boş olamaz.'); return; }
            tasarimAnlatimlar.push({
                id: tasarimAnlatimIdCounter++,
                topicId, name,
                content: '', youtube: '',
                saved: false, doneDate: null,
                selectedTechniques: [], techniqueNote: ''
            });
            input.value = '';
            renderTasarim();
        }

        function removeTasarimAnlatim(id) {
            tasarimAnlatimlar = tasarimAnlatimlar.filter(a => a.id !== id);
            renderTasarim();
        }

        function harvestTasarimAnlatimForm(anlatimId) {
            const a = tasarimAnlatimlar.find(x => x.id === anlatimId);
            if (!a) return;
            const nameEl = document.getElementById(`tasarim-name-${anlatimId}`);
            const contentEl = document.getElementById(`tasarim-content-${anlatimId}`);
            const ytEl = document.getElementById(`tasarim-yt-${anlatimId}`);
            const noteEl = document.getElementById(`tasarim-tech-note-${anlatimId}`);
            if (nameEl) a.name = nameEl.value;
            if (contentEl) a.content = contentEl.value;
            if (ytEl) a.youtube = ytEl.value;
            if (noteEl) a.techniqueNote = noteEl.value;
            if (tasarimTechniques.length) {
                a.selectedTechniques = tasarimTechniques.filter((t, i) => {
                    const box = document.getElementById(`tasarim-tech-${anlatimId}-${i}`);
                    return box && box.checked;
                });
            }
        }

        function harvestAllOpenTasarimForms() {
            tasarimAnlatimlar.forEach(a => { if (!a.saved) harvestTasarimAnlatimForm(a.id); });
        }

        function saveTasarimAnlatim(anlatimId) {
            harvestTasarimAnlatimForm(anlatimId);
            const a = tasarimAnlatimlar.find(x => x.id === anlatimId);
            if (!a) return;
            if (!a.name.trim()) { alert('Anlatım başlığı boş olamaz.'); return; }
            if ((a.selectedTechniques || []).length > 3) { alert('En fazla 3 teknik seçebilirsin.'); return; }
            a.saved = true;
            renderTasarim();
        }

        function editTasarimAnlatim(anlatimId) {
            const a = tasarimAnlatimlar.find(x => x.id === anlatimId);
            if (!a) return;
            a.saved = false;
            renderTasarim();
        }

        function toggleTasarimDone(id, checked) {
            const a = tasarimAnlatimlar.find(x => x.id === id);
            if (!a) return;
            a.doneDate = checked ? todayStr() : null;
            renderTasarim();
        }

        function tasarimAnlatimNo(topic, anlatimId) {
            const subjectNo = tasarimSubjects.findIndex(s => s.id === topic.subjectId) + 1;
            const topicNo = tasarimTopics.filter(t => t.subjectId === topic.subjectId).findIndex(t => t.id === topic.id) + 1;
            const anlatimList = tasarimAnlatimlar.filter(a => a.topicId === topic.id);
            const anlatimNo = anlatimList.findIndex(a => a.id === anlatimId) + 1;
            return `${subjectNo}.${topicNo}.${anlatimNo}`;
        }

        function renderTasarimAnlatimEditForm(anlatim, topic) {
            const no = tasarimAnlatimNo(topic, anlatim.id);
            const selected = anlatim.selectedTechniques || [];
            const techniquesHtml = tasarimTechniques.length ? `
                <h4 style="font-size:0.8rem; color:var(--text-muted); margin:10px 0 4px 0;">Kullanılan Teknik(ler) — en fazla 3</h4>
                <div style="display:flex; flex-direction:column; gap:4px;">
                    ${tasarimTechniques.map((t, i) => `
                        <label style="display:flex; align-items:center; gap:6px; font-size:0.8rem; cursor:pointer;">
                            <input type="checkbox" id="tasarim-tech-${anlatim.id}-${i}" ${selected.includes(t) ? 'checked' : ''}>
                            ${i + 1}. ${t}
                        </label>
                    `).join('')}
                </div>
                <textarea id="tasarim-tech-note-${anlatim.id}" placeholder="Hangi tekniği/teknikleri neden seçtin? Kısa not..." style="width:100%; margin-top:6px;">${(anlatim.techniqueNote || '').replace(/</g, '&lt;')}</textarea>
            ` : `<div style="font-size:0.8rem; color:var(--text-muted); margin-top:8px;">Teknik seçmek için önce modülün üstünden 11 teknik listesini oluştur.</div>`;

            return `
            <div class="recipe-card">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                    <strong style="font-size:0.8rem; color:var(--text-muted);">${no}. Anlatım <span style="color:var(--accent-gold);">(düzenleniyor)</span></strong>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeTasarimAnlatim(${anlatim.id})">Sil</button>
                </div>
                <input type="text" id="tasarim-name-${anlatim.id}" value="${(anlatim.name || '').replace(/"/g, '&quot;')}" placeholder="Anlatım başlığı (örn: Katmanlar / Layer Kullanımı)" style="width:100%; margin-top:6px;">
                <textarea id="tasarim-content-${anlatim.id}" placeholder="Ders içeriği — o anki yaptığın dersi buraya kopyalayabilirsin..." style="width:100%; margin-top:6px;">${(anlatim.content || '').replace(/</g, '&lt;')}</textarea>
                <input type="text" id="tasarim-yt-${anlatim.id}" value="${(anlatim.youtube || '').replace(/"/g, '&quot;')}" placeholder="YouTube linki (opsiyonel)" style="width:100%; margin-top:6px;">
                ${techniquesHtml}
                <button class="btn-action btn-primary" style="margin-top:8px;" onclick="saveTasarimAnlatim(${anlatim.id})">Kaydet</button>
            </div>`;
        }

        function renderTasarimAnlatimSummary(anlatim, topic) {
            const no = tasarimAnlatimNo(topic, anlatim.id);
            const doneToday = anlatim.doneDate === todayStr();
            const ytHtml = anlatim.youtube ? `<a class="recipe-yt" href="${anlatim.youtube}" target="_blank" rel="noopener">▶ YouTube'da izle</a>` : '';
            const selected = anlatim.selectedTechniques || [];
            const techniqueHtml = selected.length ? `
                <div style="margin-top:6px; font-size:0.8rem;">
                    <strong>Teknik(ler):</strong> ${selected.map(t => `<span class="category-tag lang-tag" style="margin-left:4px;">${t}</span>`).join('')}
                    ${anlatim.techniqueNote ? `<div style="color:var(--text-muted); margin-top:4px;">${anlatim.techniqueNote.replace(/</g, '&lt;')}</div>` : ''}
                </div>` : '';
            return `
            <div class="recipe-card ${doneToday ? 'done-today' : ''}">
                <h3>${no}. ${anlatim.name}</h3>
                <div class="recipe-content">${anlatim.content ? anlatim.content.replace(/</g, '&lt;') : ''}</div>
                ${ytHtml}
                ${techniqueHtml}
                <label class="done-check">
                    <input type="checkbox" ${doneToday ? 'checked' : ''} onchange="toggleTasarimDone(${anlatim.id}, this.checked)">
                    Bugün pratik yaptım
                </label>
                <div class="recipe-actions">
                    <button class="btn-action" onclick="addToDailyProgram('${anlatim.name.replace(/'/g, "\\'")}')">📅 Günlük Programa Ekle</button>
                    <button class="btn-action" onclick="editTasarimAnlatim(${anlatim.id})">Düzenle</button>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeTasarimAnlatim(${anlatim.id})">Sil</button>
                </div>
            </div>`;
        }

        function renderTasarimTopicCard(topic) {
            const anlatimlar = tasarimAnlatimlar.filter(a => a.topicId === topic.id);
            return `
            <div class="prayer-card" style="border-color:var(--accent-blue);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>📂 ${topic.name}</strong>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeTasarimTopic(${topic.id})">Konuyu Sil</button>
                </div>
                <div class="form-row">
                    <input type="text" id="new-tasarim-anlatim-${topic.id}" placeholder="Anlatım başlığı (örn: Katmanlar)">
                    <button class="btn-action btn-primary" onclick="addTasarimAnlatim(${topic.id})">+ Anlatım Ekle</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
                    ${anlatimlar.length
                        ? anlatimlar.map(a => a.saved ? renderTasarimAnlatimSummary(a, topic) : renderTasarimAnlatimEditForm(a, topic)).join('')
                        : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz anlatım eklenmedi.</span>'}
                </div>
            </div>`;
        }

        function renderTasarimSubjectCard(subject) {
            const topics = tasarimTopics.filter(t => t.subjectId === subject.id);
            return `
            <div class="prayer-card" style="border-color:var(--accent-gold);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>🎨 ${subject.name}</strong>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeTasarimSubject(${subject.id})">Programı Sil</button>
                </div>
                <div class="form-row">
                    <input type="text" id="new-tasarim-topic-${subject.id}" placeholder="Konu adı (örn: Modelleme)">
                    <button class="btn-action btn-primary" onclick="addTasarimTopic(${subject.id})">+ Konu Ekle</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
                    ${topics.length ? topics.map(renderTasarimTopicCard).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz konu eklenmedi.</span>'}
                </div>
            </div>`;
        }

        function renderTasarim() {
            harvestAllOpenTasarimForms();
            renderTasarimTechniqueList();
            const wrap = document.getElementById('tasarim-subjects-list');
            wrap.innerHTML = tasarimSubjects.length
                ? tasarimSubjects.map(renderTasarimSubjectCard).join('')
                : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz program eklenmedi.</span>';
            document.getElementById('tasarim-count').innerText = tasarimSubjects.length + ' program';
        }
