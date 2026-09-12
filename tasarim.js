        // ================= TASARIM/ÇİZİM PROGRAMLARI ÖĞRENİYORUM =================
        // KPSS/YKS modülleriyle BİREBİR AYNI yapı: Ana Başlık (Program) -> Alt Başlık (Konu) -> Anlatım (Ders Birimi)
        // Ekstra (KPSS'de olmayan, bu modüle özel): içerik metni, YouTube linki, "bugün pratik yaptım", Günlük Programa Ekle
        let tasarimSubjects = []; // {id, name}
        let tasarimSubjectIdCounter = 1;
        let tasarimTopics = []; // {id, subjectId, name}
        let tasarimTopicIdCounter = 1;
        let tasarimUnits = []; // {id, topicId, name, content, youtube, doneDate, techniques[11], questions[], saved, showTechniques, quizMode, quizResult}
        let tasarimUnitIdCounter = 1;
        let tasarimQuestionIdCounter = 1;
        let tasarimQuizAnswers = {}; // {unitId: {questionId: optionIndex}}

        function addTasarimSubject() {
            const input = document.getElementById('new-tasarim-subject');
            const name = input.value.trim();
            if (!name) { alert('Program adı boş olamaz.'); return; }
            tasarimSubjects.push({ id: tasarimSubjectIdCounter++, name });
            input.value = '';
            renderTasarim();
        }

        function removeTasarimSubject(id) {
            if (!confirm('Bu program ve içindeki tüm konular/ders birimleri silinecek. Emin misin?')) return;
            const topicIds = tasarimTopics.filter(t => t.subjectId === id).map(t => t.id);
            tasarimUnits = tasarimUnits.filter(u => !topicIds.includes(u.topicId));
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
            if (!confirm('Bu konu ve içindeki tüm ders birimleri silinecek. Emin misin?')) return;
            tasarimUnits = tasarimUnits.filter(u => u.topicId !== id);
            tasarimTopics = tasarimTopics.filter(t => t.id !== id);
            renderTasarim();
        }

        function addTasarimUnit(topicId) {
            const input = document.getElementById('new-tasarim-unit-' + topicId);
            const name = input.value.trim();
            if (!name) { alert('Ders birimi adı boş olamaz.'); return; }
            tasarimUnits.push({
                id: tasarimUnitIdCounter++,
                topicId,
                name,
                content: '', youtube: '', doneDate: null,
                techniques: Array(11).fill(''),
                questions: [],
                saved: false,
                showTechniques: false,
                quizMode: false,
                quizResult: null
            });
            input.value = '';
            renderTasarim();
        }

        function removeTasarimUnit(id) {
            tasarimUnits = tasarimUnits.filter(u => u.id !== id);
            renderTasarim();
        }

        function toggleTasarimDone(id, checked) {
            const unit = tasarimUnits.find(u => u.id === id);
            if (!unit) return;
            unit.doneDate = checked ? todayStr() : null;
            renderTasarim();
        }

        function harvestTasarimUnitForm(unitId) {
            const unit = tasarimUnits.find(u => u.id === unitId);
            if (!unit) return;
            const nameEl = document.getElementById(`tasarim-name-${unitId}`);
            const contentEl = document.getElementById(`tasarim-content-${unitId}`);
            const ytEl = document.getElementById(`tasarim-yt-${unitId}`);
            if (nameEl) unit.name = nameEl.value;
            if (contentEl) unit.content = contentEl.value;
            if (ytEl) unit.youtube = ytEl.value;
            for (let i = 0; i < 11; i++) {
                const el = document.getElementById(`tasarim-technique-${unitId}-${i}`);
                if (el) unit.techniques[i] = el.value;
            }
            unit.questions.forEach(q => {
                const qEl = document.getElementById(`tasarim-q-text-${unitId}-${q.id}`);
                if (qEl) q.text = qEl.value;
                for (let o = 0; o < 5; o++) {
                    const oEl = document.getElementById(`tasarim-q-opt-${unitId}-${q.id}-${o}`);
                    if (oEl) q.options[o] = oEl.value;
                }
                const radios = document.getElementsByName(`tasarim-q-correct-${unitId}-${q.id}`);
                radios.forEach(r => { if (r.checked) q.correct = parseInt(r.value); });
            });
        }

        function harvestAllOpenTasarimUnitForms() {
            tasarimUnits.forEach(u => { if (!u.saved) harvestTasarimUnitForm(u.id); });
        }

        function addTasarimQuestion(unitId) {
            const unit = tasarimUnits.find(u => u.id === unitId);
            if (!unit) return;
            if (unit.questions.length >= 40) { alert('En fazla 40 soru ekleyebilirsin.'); return; }
            harvestTasarimUnitForm(unitId);
            unit.questions.push({ id: tasarimQuestionIdCounter++, text: '', options: ['', '', '', '', ''], correct: null });
            renderTasarim();
        }

        function removeTasarimQuestion(unitId, questionId) {
            const unit = tasarimUnits.find(u => u.id === unitId);
            if (!unit) return;
            harvestTasarimUnitForm(unitId);
            unit.questions = unit.questions.filter(q => q.id !== questionId);
            renderTasarim();
        }

        function saveTasarimUnit(unitId) {
            harvestTasarimUnitForm(unitId);
            const unit = tasarimUnits.find(u => u.id === unitId);
            if (!unit) return;
            if (!unit.name.trim()) { alert('Ders birimi adı boş olamaz.'); return; }
            unit.saved = true;
            renderTasarim();
        }

        function editTasarimUnit(unitId) {
            const unit = tasarimUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.saved = false;
            renderTasarim();
        }

        // --- Toplu yapıştırma: soruyu şıklarıyla birlikte tek metin olarak yapıştırıp otomatik ayrıştırma ---
        function parseTasarimQuestionText(unitId) {
            const box = document.getElementById('tasarim-bulk-question-' + unitId);
            const raw = box.value;
            if (!raw.trim()) { alert('Önce soru metnini yapıştır.'); return; }

            const lines = raw.split('\n').map(l => l.trim()).filter(l => l !== '');
            const optionRegex = /^([A-Ea-e])[\)\.\-]\s*(.+)$/;
            const answerRegex = /^(cevap|doğru cevap|dogru cevap)\s*[:\-]?/i;

            let questionLines = [];
            const options = ['', '', '', '', ''];
            let correct = null;
            let mode = 'question';

            lines.forEach(line => {
                if (answerRegex.test(line)) {
                    const letterMatch = line.match(/[A-Ea-e]/);
                    if (letterMatch) correct = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
                    return;
                }
                const optMatch = line.match(optionRegex);
                if (optMatch) {
                    const idx = optMatch[1].toUpperCase().charCodeAt(0) - 65;
                    if (idx >= 0 && idx < 5) options[idx] = optMatch[2].trim();
                    mode = 'options';
                    return;
                }
                if (mode === 'question') questionLines.push(line);
            });

            const questionText = questionLines.join(' ').trim();
            if (!questionText) { alert('Soru metni ayrıştırılamadı. Format: önce soru cümlesi, sonra "A) ..." satırları.'); return; }

            harvestTasarimUnitForm(unitId);
            const unit = tasarimUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.questions.push({ id: tasarimQuestionIdCounter++, text: questionText, options, correct });
            box.value = '';
            renderTasarim();
        }

        // --- Toplu yapıştırma: "1. ... 2. ..." biçimindeki tüm teknikleri tek seferde ayrıştırıp doldurma ---
        function parseTasarimTechniqueText(unitId) {
            const box = document.getElementById('tasarim-bulk-technique-' + unitId);
            const raw = box.value;
            if (!raw.trim()) { alert('Önce teknik metnini yapıştır.'); return; }

            const numberRegex = /(?:^|\n)\s*(\d{1,2})[\.\)]\s*/g;
            const matches = [...raw.matchAll(numberRegex)];
            if (!matches.length) { alert('Numaralandırılmış teknik bulunamadı. Format: "1. ... 2. ..."'); return; }

            harvestTasarimUnitForm(unitId);
            const unit = tasarimUnits.find(u => u.id === unitId);
            if (!unit) return;

            for (let i = 0; i < matches.length; i++) {
                const num = parseInt(matches[i][1]);
                if (num < 1 || num > 11) continue;
                const start = matches[i].index + matches[i][0].length;
                const end = i + 1 < matches.length ? matches[i + 1].index : raw.length;
                const text = raw.slice(start, end).trim();
                if (text) unit.techniques[num - 1] = text;
            }

            box.value = '';
            renderTasarim();
        }

        function toggleTasarimTechniques(unitId) {
            const unit = tasarimUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.showTechniques = !unit.showTechniques;
            renderTasarim();
        }

        function startTasarimQuiz(unitId) {
            const unit = tasarimUnits.find(u => u.id === unitId);
            if (!unit) return;
            if (!unit.questions.filter(q => q.text.trim()).length) { alert('Bu ders biriminde henüz soru yok.'); return; }
            unit.quizMode = true;
            unit.quizResult = null;
            tasarimQuizAnswers[unitId] = {};
            renderTasarim();
        }

        function closeTasarimQuiz(unitId) {
            const unit = tasarimUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.quizMode = false;
            unit.quizResult = null;
            renderTasarim();
        }

        function selectTasarimAnswer(unitId, questionId, optionIndex) {
            if (!tasarimQuizAnswers[unitId]) tasarimQuizAnswers[unitId] = {};
            tasarimQuizAnswers[unitId][questionId] = optionIndex;
            renderTasarim();
        }

        function finishTasarimQuiz(unitId) {
            const unit = tasarimUnits.find(u => u.id === unitId);
            if (!unit) return;
            const answers = tasarimQuizAnswers[unitId] || {};
            const validQuestions = unit.questions.filter(q => q.text.trim() && q.correct !== null);
            let correct = 0;
            validQuestions.forEach(q => { if (answers[q.id] === q.correct) correct++; });
            unit.quizResult = { correct, total: validQuestions.length };
            renderTasarim();
        }

        function renderTasarimQuiz(unit) {
            const answers = tasarimQuizAnswers[unit.id] || {};
            const validQuestions = unit.questions.filter(q => q.text.trim());
            const letters = ['A', 'B', 'C', 'D', 'E'];

            const questionsHtml = validQuestions.map((q, idx) => {
                const optsHtml = letters.map((letter, o) => {
                    if (!q.options[o] || !q.options[o].trim()) return '';
                    const selected = answers[q.id] === o;
                    return `<label style="display:flex; align-items:center; gap:6px; font-size:0.8rem; margin-top:3px; cursor:pointer;">
                        <input type="radio" name="tasarim-quiz-${unit.id}-${q.id}" ${selected ? 'checked' : ''} onchange="selectTasarimAnswer(${unit.id}, ${q.id}, ${o})">
                        ${letter}) ${q.options[o].replace(/</g, '&lt;')}
                    </label>`;
                }).join('');
                return `<div style="border-top:1px solid var(--border-color); padding-top:8px; margin-top:8px;">
                    <div style="font-size:0.85rem; font-weight:600;">${idx + 1}. ${q.text.replace(/</g, '&lt;')}</div>
                    ${optsHtml}
                </div>`;
            }).join('');

            const resultHtml = unit.quizResult
                ? `<div style="margin-top:10px; font-weight:600; color:var(--accent-green);">Sonuç: ${unit.quizResult.correct} / ${unit.quizResult.total} doğru</div>`
                : '';

            return `
            <div style="margin-top:12px; border:1px solid var(--accent-gold); border-radius:8px; padding:12px;">
                <strong style="font-size:0.9rem;">📋 Sınav</strong>
                ${questionsHtml}
                ${resultHtml}
                <div style="display:flex; gap:8px; margin-top:10px;">
                    <button class="btn-action btn-primary" onclick="finishTasarimQuiz(${unit.id})">Bitirdim, Sonucu Gör</button>
                    <button class="btn-action" onclick="closeTasarimQuiz(${unit.id})">Kapat</button>
                </div>
            </div>`;
        }

        function renderTasarimUnitEditForm(unit) {
            const techniquesHtml = unit.techniques.map((t, i) => `
                <div style="margin-bottom:8px;">
                    <label style="font-size:0.8rem; color:var(--text-muted);">Teknik ${i + 1}</label>
                    <textarea class="prayer-note" id="tasarim-technique-${unit.id}-${i}" placeholder="Teknik ${i + 1} notların...">${(t || '').replace(/</g, '&lt;')}</textarea>
                </div>
            `).join('');

            const letters = ['A', 'B', 'C', 'D', 'E'];
            const questionsHtml = unit.questions.map((q, idx) => `
                <div style="border:1px solid var(--border-color); border-radius:6px; padding:10px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:0.85rem;">Soru ${idx + 1}</strong>
                        <button class="btn-action" style="color:var(--accent-red); padding:2px 8px;" onclick="removeTasarimQuestion(${unit.id}, ${q.id})">✕</button>
                    </div>
                    <textarea class="prayer-note" id="tasarim-q-text-${unit.id}-${q.id}" placeholder="Soru metni">${(q.text || '').replace(/</g, '&lt;')}</textarea>
                    ${letters.map((letter, o) => `
                        <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
                            <input type="radio" name="tasarim-q-correct-${unit.id}-${q.id}" value="${o}" ${q.correct === o ? 'checked' : ''}>
                            <span style="font-size:0.8rem; width:16px;">${letter})</span>
                            <input type="text" id="tasarim-q-opt-${unit.id}-${q.id}-${o}" value="${(q.options[o] || '').replace(/"/g, '&quot;')}" placeholder="${letter} şıkkı" style="flex:1; background:#121212; border:1px solid var(--border-color); color:var(--text-main); padding:5px 8px; border-radius:4px; font-size:0.8rem;">
                        </div>
                    `).join('')}
                </div>
            `).join('');

            return `
            <div class="prayer-card">
                <strong>📝 ${unit.name} <span style="font-size:0.8rem; color:var(--text-muted);">(düzenleniyor)</span></strong>
                <input type="text" id="tasarim-name-${unit.id}" value="${(unit.name || '').replace(/"/g, '&quot;')}" placeholder="Ders birimi adı" style="width:100%; margin-top:6px;">
                <textarea id="tasarim-content-${unit.id}" placeholder="Ders içeriği — o anki yaptığın dersi buraya kopyalayabilirsin..." style="width:100%; margin-top:6px;">${(unit.content || '').replace(/</g, '&lt;')}</textarea>
                <input type="text" id="tasarim-yt-${unit.id}" value="${(unit.youtube || '').replace(/"/g, '&quot;')}" placeholder="YouTube linki (opsiyonel)" style="width:100%; margin-top:6px;">
                <h4 style="font-size:0.85rem; color:var(--text-muted); margin:8px 0 4px 0;">11 Teknik</h4>
                ${techniquesHtml}
                <div style="margin:10px 0; padding:10px; border:1px dashed var(--accent-blue); border-radius:6px;">
                    <label style="font-size:0.8rem; color:var(--text-muted); display:block; margin-bottom:6px;">Ya da tüm teknikleri tek seferde yapıştır (örn: "1. ... 2. ... 3. ...")</label>
                    <textarea class="prayer-note" id="tasarim-bulk-technique-${unit.id}" placeholder="1. İlk teknik metni...&#10;2. İkinci teknik metni...&#10;..."></textarea>
                    <button class="btn-action btn-primary" style="margin-top:6px;" onclick="parseTasarimTechniqueText(${unit.id})">Ayrıştır ve Doldur</button>
                </div>
                <h4 style="font-size:0.85rem; color:var(--text-muted); margin:12px 0 4px 0;">Soru - Cevap (${unit.questions.length}/40)</h4>
                ${questionsHtml}
                <div style="margin:10px 0; padding:10px; border:1px dashed var(--accent-gold); border-radius:6px;">
                    <label style="font-size:0.8rem; color:var(--text-muted); display:block; margin-bottom:6px;">Ya da soruyu şıklarıyla birlikte tek seferde yapıştır</label>
                    <textarea class="prayer-note" id="tasarim-bulk-question-${unit.id}" placeholder="Soru metni...&#10;A) ...&#10;B) ...&#10;C) ...&#10;D) ...&#10;E) ...&#10;Cevap: B"></textarea>
                    <button class="btn-action btn-primary" style="margin-top:6px;" onclick="parseTasarimQuestionText(${unit.id})">Ayrıştır ve Ekle</button>
                </div>
                <button class="btn-action" onclick="addTasarimQuestion(${unit.id})">+ Soru Ekle</button>
                <button class="btn-action btn-primary" style="margin-top:10px;" onclick="saveTasarimUnit(${unit.id})">Kaydet</button>
            </div>`;
        }

        function renderTasarimUnitSummary(unit) {
            const techniquesHtml = unit.showTechniques
                ? `<div style="display:flex; flex-direction:column; gap:6px; margin-top:8px; border-top:1px solid var(--border-color); padding-top:8px;">
                    ${unit.techniques.map((t, i) => t.trim() ? `<div style="font-size:0.8rem;"><strong>Teknik ${i + 1}:</strong> ${t.replace(/</g, '&lt;')}</div>` : '').join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz teknik notu girilmedi.</span>'}
                   </div>`
                : '';
            const quizHtml = unit.quizMode ? renderTasarimQuiz(unit) : '';
            const questionCount = unit.questions.filter(q => q.text.trim()).length;
            const doneToday = unit.doneDate === todayStr();
            const ytHtml = unit.youtube ? `<a class="recipe-yt" href="${unit.youtube}" target="_blank" rel="noopener">▶ YouTube'da izle</a>` : '';

            return `
            <div class="prayer-card ${doneToday ? 'done-today' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <strong>📝 ${unit.name}</strong>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <button class="btn-action" onclick="toggleTasarimTechniques(${unit.id})">${unit.showTechniques ? '11 Tekniği Gizle' : '11 Tekniği Oku'}</button>
                        <button class="btn-action btn-primary" onclick="startTasarimQuiz(${unit.id})">Sınava Başla</button>
                        <button class="btn-action" onclick="editTasarimUnit(${unit.id})">Düzenle</button>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="removeTasarimUnit(${unit.id})">Sil</button>
                    </div>
                </div>
                ${unit.content ? `<div class="recipe-content">${unit.content.replace(/</g, '&lt;')}</div>` : ''}
                ${ytHtml}
                <div style="font-size:0.8rem; color:var(--text-muted);">${questionCount} soru kayıtlı</div>
                ${techniquesHtml}
                <label class="done-check">
                    <input type="checkbox" ${doneToday ? 'checked' : ''} onchange="toggleTasarimDone(${unit.id}, this.checked)">
                    Bugün pratik yaptım
                </label>
                <button class="btn-action" onclick="addToDailyProgram('${unit.name.replace(/'/g, "\\'")}')">📅 Günlük Programa Ekle</button>
                ${quizHtml}
            </div>`;
        }

        function renderTasarimUnitCard(unit) {
            return unit.saved ? renderTasarimUnitSummary(unit) : renderTasarimUnitEditForm(unit);
        }

        function renderTasarimTopicCard(topic) {
            const units = tasarimUnits.filter(u => u.topicId === topic.id);
            return `
            <div class="prayer-card" style="border-color:var(--accent-blue);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>📂 ${topic.name}</strong>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeTasarimTopic(${topic.id})">Konuyu Sil</button>
                </div>
                <div class="form-row">
                    <input type="text" id="new-tasarim-unit-${topic.id}" placeholder="Ders birimi adı (örn: 1. Ders)">
                    <button class="btn-action btn-primary" onclick="addTasarimUnit(${topic.id})">+ Ders Birimi Ekle</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${units.length ? units.map(renderTasarimUnitCard).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz ders birimi eklenmedi.</span>'}
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
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${topics.length ? topics.map(renderTasarimTopicCard).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz konu eklenmedi.</span>'}
                </div>
            </div>`;
        }

        function renderTasarim() {
            harvestAllOpenTasarimUnitForms();
            const wrap = document.getElementById('tasarim-subjects-list');
            wrap.innerHTML = tasarimSubjects.length
                ? tasarimSubjects.map(renderTasarimSubjectCard).join('')
                : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz program eklenmedi.</span>';
            document.getElementById('tasarim-count').innerText = tasarimSubjects.length + ' program';
        }
