        // ================= DERS TAKİBİ =================
        let dersSubjects = []; // {id, name}
        let dersSubjectIdCounter = 1;
        let dersTopics = []; // {id, subjectId, name}
        let dersTopicIdCounter = 1;
        let dersUnits = []; // {id, topicId, name, techniques[11], questions[], saved, showTechniques, quizMode, quizResult}
        let dersUnitIdCounter = 1;
        let dersQuestionIdCounter = 1;
        let dersQuizAnswers = {}; // {unitId: {questionId: optionIndex}}

        function addDersSubject() {
            const input = document.getElementById('new-ders-subject');
            const name = input.value.trim();
            if (!name) { alert('Ders adı boş olamaz.'); return; }
            dersSubjects.push({ id: dersSubjectIdCounter++, name });
            input.value = '';
            renderDers();
        }

        function removeDersSubject(id) {
            if (!confirm('Bu ders ve içindeki tüm konular/ders birimleri silinecek. Emin misin?')) return;
            const topicIds = dersTopics.filter(t => t.subjectId === id).map(t => t.id);
            dersUnits = dersUnits.filter(u => !topicIds.includes(u.topicId));
            dersTopics = dersTopics.filter(t => t.subjectId !== id);
            dersSubjects = dersSubjects.filter(s => s.id !== id);
            renderDers();
        }

        function addDersTopic(subjectId) {
            const input = document.getElementById('new-ders-topic-' + subjectId);
            const name = input.value.trim();
            if (!name) { alert('Konu adı boş olamaz.'); return; }
            dersTopics.push({ id: dersTopicIdCounter++, subjectId, name });
            renderDers();
        }

        function removeDersTopic(id) {
            if (!confirm('Bu konu ve içindeki tüm ders birimleri silinecek. Emin misin?')) return;
            dersUnits = dersUnits.filter(u => u.topicId !== id);
            dersTopics = dersTopics.filter(t => t.id !== id);
            renderDers();
        }

        function addDersUnit(topicId) {
            const input = document.getElementById('new-ders-unit-' + topicId);
            const name = input.value.trim();
            if (!name) { alert('Ders birimi adı boş olamaz.'); return; }
            dersUnits.push({
                id: dersUnitIdCounter++,
                topicId,
                name,
                techniques: Array(11).fill(''),
                questions: [],
                saved: false,
                showTechniques: false,
                quizMode: false,
                quizResult: null
            });
            input.value = '';
            renderDers();
        }

        function removeDersUnit(id) {
            dersUnits = dersUnits.filter(u => u.id !== id);
            renderDers();
        }

        function harvestDersUnitForm(unitId) {
            const unit = dersUnits.find(u => u.id === unitId);
            if (!unit) return;
            for (let i = 0; i < 11; i++) {
                const el = document.getElementById(`technique-${unitId}-${i}`);
                if (el) unit.techniques[i] = el.value;
            }
            unit.questions.forEach(q => {
                const qEl = document.getElementById(`q-text-${unitId}-${q.id}`);
                if (qEl) q.text = qEl.value;
                for (let o = 0; o < 5; o++) {
                    const oEl = document.getElementById(`q-opt-${unitId}-${q.id}-${o}`);
                    if (oEl) q.options[o] = oEl.value;
                }
                const radios = document.getElementsByName(`q-correct-${unitId}-${q.id}`);
                radios.forEach(r => { if (r.checked) q.correct = parseInt(r.value); });
            });
        }

        function harvestAllOpenDersUnitForms() {
            dersUnits.forEach(u => { if (!u.saved) harvestDersUnitForm(u.id); });
        }

        function addDersQuestion(unitId) {
            const unit = dersUnits.find(u => u.id === unitId);
            if (!unit) return;
            if (unit.questions.length >= 40) { alert('En fazla 40 soru ekleyebilirsin.'); return; }
            harvestDersUnitForm(unitId);
            unit.questions.push({ id: dersQuestionIdCounter++, text: '', options: ['', '', '', '', ''], correct: null });
            renderDers();
        }

        function removeDersQuestion(unitId, questionId) {
            const unit = dersUnits.find(u => u.id === unitId);
            if (!unit) return;
            harvestDersUnitForm(unitId);
            unit.questions = unit.questions.filter(q => q.id !== questionId);
            renderDers();
        }

        function saveDersUnit(unitId) {
            harvestDersUnitForm(unitId);
            const unit = dersUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.saved = true;
            renderDers();
        }

        function editDersUnit(unitId) {
            const unit = dersUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.saved = false;
            renderDers();
        }

        // --- Toplu yapıştırma: soruyu şıklarıyla birlikte tek metin olarak yapıştırıp otomatik ayrıştırma ---
        function parseDersQuestionText(unitId) {
            const box = document.getElementById('bulk-question-' + unitId);
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

            harvestDersUnitForm(unitId);
            const unit = dersUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.questions.push({ id: dersQuestionIdCounter++, text: questionText, options, correct });
            box.value = '';
            renderDers();
        }

        // --- Toplu yapıştırma: "1. ... 2. ..." biçimindeki tüm teknikleri tek seferde ayrıştırıp doldurma ---
        function parseDersTechniqueText(unitId) {
            const box = document.getElementById('bulk-technique-' + unitId);
            const raw = box.value;
            if (!raw.trim()) { alert('Önce teknik metnini yapıştır.'); return; }

            const numberRegex = /(?:^|\n)\s*(\d{1,2})[\.\)]\s*/g;
            const matches = [...raw.matchAll(numberRegex)];
            if (!matches.length) { alert('Numaralandırılmış teknik bulunamadı. Format: "1. ... 2. ..."'); return; }

            harvestDersUnitForm(unitId);
            const unit = dersUnits.find(u => u.id === unitId);
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
            renderDers();
        }

        function toggleDersTechniques(unitId) {
            const unit = dersUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.showTechniques = !unit.showTechniques;
            renderDers();
        }

        function startDersQuiz(unitId) {
            const unit = dersUnits.find(u => u.id === unitId);
            if (!unit) return;
            if (!unit.questions.filter(q => q.text.trim()).length) { alert('Bu ders biriminde henüz soru yok.'); return; }
            unit.quizMode = true;
            unit.quizResult = null;
            dersQuizAnswers[unitId] = {};
            renderDers();
        }

        function closeDersQuiz(unitId) {
            const unit = dersUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.quizMode = false;
            unit.quizResult = null;
            renderDers();
        }

        function selectDersAnswer(unitId, questionId, optionIndex) {
            if (!dersQuizAnswers[unitId]) dersQuizAnswers[unitId] = {};
            dersQuizAnswers[unitId][questionId] = optionIndex;
            renderDers();
        }

        function finishDersQuiz(unitId) {
            const unit = dersUnits.find(u => u.id === unitId);
            if (!unit) return;
            const answers = dersQuizAnswers[unitId] || {};
            const validQuestions = unit.questions.filter(q => q.text.trim() && q.correct !== null);
            let correct = 0;
            validQuestions.forEach(q => { if (answers[q.id] === q.correct) correct++; });
            unit.quizResult = { correct, total: validQuestions.length };
            renderDers();
        }

        function renderDersQuiz(unit) {
            const answers = dersQuizAnswers[unit.id] || {};
            const validQuestions = unit.questions.filter(q => q.text.trim());
            const letters = ['A', 'B', 'C', 'D', 'E'];

            const questionsHtml = validQuestions.map((q, idx) => {
                const optsHtml = letters.map((letter, o) => {
                    if (!q.options[o] || !q.options[o].trim()) return '';
                    const selected = answers[q.id] === o;
                    return `<label style="display:flex; align-items:center; gap:6px; font-size:0.8rem; margin-top:3px; cursor:pointer;">
                        <input type="radio" name="quiz-${unit.id}-${q.id}" ${selected ? 'checked' : ''} onchange="selectDersAnswer(${unit.id}, ${q.id}, ${o})">
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
                    <button class="btn-action btn-primary" onclick="finishDersQuiz(${unit.id})">Bitirdim, Sonucu Gör</button>
                    <button class="btn-action" onclick="closeDersQuiz(${unit.id})">Kapat</button>
                </div>
            </div>`;
        }

        function renderDersUnitEditForm(unit) {
            const techniquesHtml = unit.techniques.map((t, i) => `
                <div style="margin-bottom:8px;">
                    <label style="font-size:0.8rem; color:var(--text-muted);">Teknik ${i + 1}</label>
                    <textarea class="prayer-note" id="technique-${unit.id}-${i}" placeholder="Teknik ${i + 1} notların...">${(t || '').replace(/</g, '&lt;')}</textarea>
                </div>
            `).join('');

            const letters = ['A', 'B', 'C', 'D', 'E'];
            const questionsHtml = unit.questions.map((q, idx) => `
                <div style="border:1px solid var(--border-color); border-radius:6px; padding:10px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:0.85rem;">Soru ${idx + 1}</strong>
                        <button class="btn-action" style="color:var(--accent-red); padding:2px 8px;" onclick="removeDersQuestion(${unit.id}, ${q.id})">✕</button>
                    </div>
                    <textarea class="prayer-note" id="q-text-${unit.id}-${q.id}" placeholder="Soru metni">${(q.text || '').replace(/</g, '&lt;')}</textarea>
                    ${letters.map((letter, o) => `
                        <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
                            <input type="radio" name="q-correct-${unit.id}-${q.id}" value="${o}" ${q.correct === o ? 'checked' : ''}>
                            <span style="font-size:0.8rem; width:16px;">${letter})</span>
                            <input type="text" id="q-opt-${unit.id}-${q.id}-${o}" value="${(q.options[o] || '').replace(/"/g, '&quot;')}" placeholder="${letter} şıkkı" style="flex:1; background:#121212; border:1px solid var(--border-color); color:var(--text-main); padding:5px 8px; border-radius:4px; font-size:0.8rem;">
                        </div>
                    `).join('')}
                </div>
            `).join('');

            return `
            <div class="prayer-card">
                <strong>📝 ${unit.name} <span style="font-size:0.8rem; color:var(--text-muted);">(düzenleniyor)</span></strong>
                <h4 style="font-size:0.85rem; color:var(--text-muted); margin:8px 0 4px 0;">11 Teknik</h4>
                ${techniquesHtml}
                <div style="margin:10px 0; padding:10px; border:1px dashed var(--accent-blue); border-radius:6px;">
                    <label style="font-size:0.8rem; color:var(--text-muted); display:block; margin-bottom:6px;">Ya da tüm teknikleri tek seferde yapıştır (örn: "1. ... 2. ... 3. ...")</label>
                    <textarea class="prayer-note" id="bulk-technique-${unit.id}" placeholder="1. İlk teknik metni...&#10;2. İkinci teknik metni...&#10;..."></textarea>
                    <button class="btn-action btn-primary" style="margin-top:6px;" onclick="parseDersTechniqueText(${unit.id})">Ayrıştır ve Doldur</button>
                </div>
                <h4 style="font-size:0.85rem; color:var(--text-muted); margin:12px 0 4px 0;">Soru - Cevap (${unit.questions.length}/40)</h4>
                ${questionsHtml}
                <div style="margin:10px 0; padding:10px; border:1px dashed var(--accent-gold); border-radius:6px;">
                    <label style="font-size:0.8rem; color:var(--text-muted); display:block; margin-bottom:6px;">Ya da soruyu şıklarıyla birlikte tek seferde yapıştır</label>
                    <textarea class="prayer-note" id="bulk-question-${unit.id}" placeholder="Soru metni...&#10;A) ...&#10;B) ...&#10;C) ...&#10;D) ...&#10;E) ...&#10;Cevap: B"></textarea>
                    <button class="btn-action btn-primary" style="margin-top:6px;" onclick="parseDersQuestionText(${unit.id})">Ayrıştır ve Ekle</button>
                </div>
                <button class="btn-action" onclick="addDersQuestion(${unit.id})">+ Soru Ekle</button>
                <button class="btn-action btn-primary" style="margin-top:10px;" onclick="saveDersUnit(${unit.id})">Kaydet</button>
            </div>`;
        }

        function renderDersUnitSummary(unit) {
            const techniquesHtml = unit.showTechniques
                ? `<div style="display:flex; flex-direction:column; gap:6px; margin-top:8px; border-top:1px solid var(--border-color); padding-top:8px;">
                    ${unit.techniques.map((t, i) => t.trim() ? `<div style="font-size:0.8rem;"><strong>Teknik ${i + 1}:</strong> ${t.replace(/</g, '&lt;')}</div>` : '').join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz teknik notu girilmedi.</span>'}
                   </div>`
                : '';
            const quizHtml = unit.quizMode ? renderDersQuiz(unit) : '';
            const questionCount = unit.questions.filter(q => q.text.trim()).length;

            return `
            <div class="prayer-card">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <strong>📝 ${unit.name}</strong>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <button class="btn-action" onclick="toggleDersTechniques(${unit.id})">${unit.showTechniques ? '11 Tekniği Gizle' : '11 Tekniği Oku'}</button>
                        <button class="btn-action btn-primary" onclick="startDersQuiz(${unit.id})">Sınava Başla</button>
                        <button class="btn-action" onclick="editDersUnit(${unit.id})">Düzenle</button>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="removeDersUnit(${unit.id})">Sil</button>
                    </div>
                </div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${questionCount} soru kayıtlı</div>
                ${techniquesHtml}
                ${quizHtml}
            </div>`;
        }

        function renderDersUnitCard(unit) {
            return unit.saved ? renderDersUnitSummary(unit) : renderDersUnitEditForm(unit);
        }

        function renderDersTopicCard(topic) {
            const units = dersUnits.filter(u => u.topicId === topic.id);
            return `
            <div class="prayer-card" style="border-color:var(--accent-blue);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>📂 ${topic.name}</strong>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeDersTopic(${topic.id})">Konuyu Sil</button>
                </div>
                <div class="form-row">
                    <input type="text" id="new-ders-unit-${topic.id}" placeholder="Ders birimi adı (örn: 1. Ders)">
                    <button class="btn-action btn-primary" onclick="addDersUnit(${topic.id})">+ Ders Birimi Ekle</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${units.length ? units.map(renderDersUnitCard).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz ders birimi eklenmedi.</span>'}
                </div>
            </div>`;
        }

        function renderDersSubjectCard(subject) {
            const topics = dersTopics.filter(t => t.subjectId === subject.id);
            return `
            <div class="prayer-card" style="border-color:var(--accent-gold);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>📖 ${subject.name}</strong>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeDersSubject(${subject.id})">Dersi Sil</button>
                </div>
                <div class="form-row">
                    <input type="text" id="new-ders-topic-${subject.id}" placeholder="Konu adı (örn: Asal Sayılar)">
                    <button class="btn-action btn-primary" onclick="addDersTopic(${subject.id})">+ Konu Ekle</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${topics.length ? topics.map(renderDersTopicCard).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz konu eklenmedi.</span>'}
                </div>
            </div>`;
        }

        function renderDers() {
            harvestAllOpenDersUnitForms();
            const wrap = document.getElementById('ders-subjects-list');
            wrap.innerHTML = dersSubjects.length
                ? dersSubjects.map(renderDersSubjectCard).join('')
                : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz ders eklenmedi.</span>';
            document.getElementById('ders-count').innerText = dersSubjects.length + ' ders';
        }

