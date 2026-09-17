        // ================= KRİPTO & YATIRIM TAKİBİ =================
        // ================= KRİPTO & YATIRIM TAKİBİ =================
        let yatirimCategories = [];
        let yatirimItems = []; // {id, category, amount, buyPrice, currentPrice}
        let yatirimItemIdCounter = 1;
        let yatirimNotes = '';

        function addYatirimCategory() {
            const input = document.getElementById('new-yatirim-category');
            const value = input.value.trim();
            if (!value) return;
            if (yatirimCategories.includes(value)) { input.value = ''; return; }
            yatirimCategories.push(value);
            input.value = '';
            renderYatirim();
        }

        function removeYatirimCategory(value) {
            yatirimCategories = yatirimCategories.filter(c => c !== value);
            renderYatirim();
        }

        function renderYatirimCategoryTags() {
            const wrap = document.getElementById('yatirim-category-list');
            wrap.innerHTML = yatirimCategories.length ? yatirimCategories.map(c => `
                <span class="category-tag lang-tag">${c}<button onclick="removeYatirimCategory('${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz varlık türü eklenmedi.</span>';

            const select = document.getElementById('yatirim-item-category');
            select.innerHTML = yatirimCategories.length
                ? yatirimCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce varlık türü ekle</option>';

            const catSet = new Set(yatirimCategories);
            yatirimItems.forEach(i => catSet.add(i.category));
            return Array.from(catSet);
        }

        function addYatirimItem() {
            const category = document.getElementById('yatirim-item-category').value;
            const amount = parseFloat(document.getElementById('yatirim-item-amount').value.replace(',', '.')) || 0;
            const buyPrice = parseFloat(document.getElementById('yatirim-item-buy-price').value.replace(/\./g, '').replace(',', '.')) || 0;
            const currentPrice = parseFloat(document.getElementById('yatirim-item-current-price').value.replace(/\./g, '').replace(',', '.')) || 0;

            if (!category) { alert('Önce bir varlık türü seç.'); return; }
            if (!amount) { alert('Miktar girmelisin.'); return; }
            if (!buyPrice) { alert('Alış fiyatı girmelisin.'); return; }

            yatirimItems.push({ id: yatirimItemIdCounter++, category, amount, buyPrice, currentPrice: currentPrice || buyPrice });
            document.getElementById('yatirim-item-amount').value = '';
            document.getElementById('yatirim-item-buy-price').value = '';
            document.getElementById('yatirim-item-current-price').value = '';
            renderYatirim();
        }

        function removeYatirimItem(id) {
            yatirimItems = yatirimItems.filter(i => i.id !== id);
            renderYatirim();
        }

        function updateYatirimCurrentPrice(id) {
            const input = document.getElementById('yatirim-update-price-' + id);
            const price = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
            if (!price) { alert('Geçerli bir fiyat gir.'); return; }
            const item = yatirimItems.find(i => i.id === id);
            if (!item) return;
            item.currentPrice = price;
            renderYatirim();
        }

        function renderYatirimItemCard(item) {
            const cost = item.amount * item.buyPrice;
            const currentValue = item.amount * item.currentPrice;
            const profit = currentValue - cost;
            const profitPct = cost ? (profit / cost * 100) : 0;
            const isProfit = profit >= 0;
            return `
            <div class="prayer-card">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                    <strong>${item.category}</strong>
                    <span class="category-tag" style="background:${isProfit ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)'}; border-color:${isProfit ? 'rgba(46,204,113,0.4)' : 'rgba(231,76,60,0.4)'}; color:${isProfit ? 'var(--accent-green)' : 'var(--accent-red)'};">${isProfit ? '+' : ''}${profit.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺ (${isProfit ? '+' : ''}${profitPct.toFixed(1)}%)</span>
                </div>
                <div style="font-size:0.85rem; display:flex; flex-wrap:wrap; gap:10px; margin-top:4px;">
                    <span>Miktar: ${item.amount.toLocaleString('tr-TR')}</span>
                    <span>Alış: ${item.buyPrice.toLocaleString('tr-TR')} ₺</span>
                    <span>Güncel: ${item.currentPrice.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div class="form-row" style="margin-top:8px;">
                    <input type="text" id="yatirim-update-price-${item.id}" placeholder="Yeni güncel fiyat">
                    <button class="btn-action" onclick="updateYatirimCurrentPrice(${item.id})">Fiyatı Güncelle</button>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeYatirimItem(${item.id})">Sil</button>
                </div>
            </div>`;
        }

        function renderYatirimList(allCategories) {
            const wrap = document.getElementById('yatirim-list');
            wrap.innerHTML = allCategories.length ? allCategories.map(cat => {
                const items = yatirimItems.filter(i => i.category === cat);
                return `
                <div style="margin-bottom:16px;">
                    <h4 style="font-size:0.95rem; margin-bottom:8px; color:var(--accent-blue);">${cat}</h4>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${items.length ? items.map(renderYatirimItemCard).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Bu türde henüz yatırım eklenmedi.</span>'}
                    </div>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz varlık türü eklenmedi.</span>';
        }

        function saveYatirimNotes(value) {
            yatirimNotes = value;
            scheduleSave();
        }

        function renderYatirim() {
            const allCategories = renderYatirimCategoryTags();
            renderYatirimList(allCategories);
            renderYatirimStudy();

            const totalCost = yatirimItems.reduce((s, i) => s + i.amount * i.buyPrice, 0);
            const totalValue = yatirimItems.reduce((s, i) => s + i.amount * i.currentPrice, 0);
            const totalProfit = totalValue - totalCost;
            const isProfit = totalProfit >= 0;

            document.getElementById('yatirim-total').innerHTML =
                `Toplam Maliyet: ${totalCost.toLocaleString('tr-TR')} ₺ — Güncel Değer: ${totalValue.toLocaleString('tr-TR')} ₺ — Kâr/Zarar: <span style="color:${isProfit ? 'var(--accent-green)' : 'var(--accent-red)'}">${isProfit ? '+' : ''}${totalProfit.toLocaleString('tr-TR')} ₺</span>`;
            document.getElementById('yatirim-count').innerText = `${yatirimItems.length} varlık`;

            const notesEl = document.getElementById('yatirim-notes');
            if (notesEl && document.activeElement !== notesEl) notesEl.value = yatirimNotes || '';
        }


        // ================= YATIRIM ÖĞRENME TAKİBİ =================
        let yatirimStudySubjects = []; // {id, name}
        let yatirimStudySubjectIdCounter = 1;
        let yatirimStudyTopics = []; // {id, subjectId, name}
        let yatirimStudyTopicIdCounter = 1;
        let yatirimStudyUnits = []; // {id, topicId, name, techniques[11], questions[], saved, showTechniques, quizMode, quizResult}
        let yatirimStudyUnitIdCounter = 1;
        let yatirimStudyQuestionIdCounter = 1;
        let yatirimStudyQuizAnswers = {}; // {unitId: {questionId: optionIndex}}
        let yatirimStudyQuizFeedback = {}; // {unitId: {questionId: 'correct'|'wrong'|'empty'}}
        let yatirimStudyReader = null; // {unitId, type: 'technique'|'question', index}
        let yatirimStudyCollapsedSubjects = {};
        const YATIRIM_STUDY_REVIEW_INTERVALS = [1, 3, 7, 14, 30];

        try {
            yatirimStudyCollapsedSubjects = JSON.parse(localStorage.getItem('yatirimStudy-collapsed-subjects') || '{}') || {};
        } catch (e) {
            yatirimStudyCollapsedSubjects = {};
        }

        function getYatirimStudyQuizQuestions(unit) {
            const questions = unit.questions.filter(q => q.text.trim());
            return Array.isArray(unit.quizQuestionIds)
                ? questions.filter(q => unit.quizQuestionIds.includes(q.id))
                : questions;
        }

        function ensureYatirimStudyQuestionStats() {
            yatirimStudyUnits.forEach(unit => unit.questions.forEach(question => {
                if (!Array.isArray(question.answerHistory)) question.answerHistory = [];
                if (typeof question.correctCount !== 'number') question.correctCount = 0;
                if (typeof question.wrongCount !== 'number') question.wrongCount = 0;
                if (typeof question.reviewLevel !== 'number') question.reviewLevel = 0;
            }));
        }

        function getYatirimStudyReviewDate(question) {
            return question.nextReviewAt ? new Date(question.nextReviewAt) : null;
        }

        function isYatirimStudyReviewDue(question) {
            const reviewDate = getYatirimStudyReviewDate(question);
            return reviewDate && reviewDate <= new Date();
        }

        function formatYatirimStudyDate(date) {
            return date ? date.toLocaleDateString('tr-TR') : 'Planlanmadı';
        }

        function addYatirimStudySubject() {
            const input = document.getElementById('new-yatirimStudy-subject');
            const name = input.value.trim();
            if (!name) { alert('Ders adı boş olamaz.'); return; }
            yatirimStudySubjects.push({ id: yatirimStudySubjectIdCounter++, name });
            input.value = '';
            renderYatirimStudy();
        }

        function removeYatirimStudySubject(id) {
            if (!confirm('Bu ders ve içindeki tüm konular/ders birimleri silinecek. Emin misin?')) return;
            const topicIds = yatirimStudyTopics.filter(t => t.subjectId === id).map(t => t.id);
            yatirimStudyUnits = yatirimStudyUnits.filter(u => !topicIds.includes(u.topicId));
            yatirimStudyTopics = yatirimStudyTopics.filter(t => t.subjectId !== id);
            yatirimStudySubjects = yatirimStudySubjects.filter(s => s.id !== id);
            renderYatirimStudy();
        }

        function addYatirimStudyTopic(subjectId) {
            const input = document.getElementById('new-yatirimStudy-topic-' + subjectId);
            const name = input.value.trim();
            if (!name) { alert('Konu adı boş olamaz.'); return; }
            yatirimStudyTopics.push({ id: yatirimStudyTopicIdCounter++, subjectId, name });
            renderYatirimStudy();
        }

        function removeYatirimStudyTopic(id) {
            if (!confirm('Bu konu ve içindeki tüm ders birimleri silinecek. Emin misin?')) return;
            yatirimStudyUnits = yatirimStudyUnits.filter(u => u.topicId !== id);
            yatirimStudyTopics = yatirimStudyTopics.filter(t => t.id !== id);
            renderYatirimStudy();
        }

        function addYatirimStudyUnit(topicId) {
            const input = document.getElementById('new-yatirimStudy-unit-' + topicId);
            const name = input.value.trim();
            if (!name) { alert('Ders birimi adı boş olamaz.'); return; }
            yatirimStudyUnits.push({
                id: yatirimStudyUnitIdCounter++,
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
            renderYatirimStudy();
        }

        function removeYatirimStudyUnit(id) {
            yatirimStudyUnits = yatirimStudyUnits.filter(u => u.id !== id);
            renderYatirimStudy();
        }

        function harvestYatirimStudyUnitForm(unitId) {
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
            if (!unit) return;
            for (let i = 0; i < 11; i++) {
                const el = document.getElementById(`technique-yatirimStudy-${unitId}-${i}`);
                if (el) unit.techniques[i] = el.value;
            }
            unit.questions.forEach(q => {
                const qEl = document.getElementById(`q-text-yatirimStudy-${unitId}-${q.id}`);
                if (qEl) q.text = qEl.value;
                for (let o = 0; o < 5; o++) {
                    const oEl = document.getElementById(`q-opt-yatirimStudy-${unitId}-${q.id}-${o}`);
                    if (oEl) q.options[o] = oEl.value;
                }
                const radios = document.getElementsByName(`q-correct-yatirimStudy-${unitId}-${q.id}`);
                radios.forEach(r => { if (r.checked) q.correct = parseInt(r.value); });
            });
        }

        function harvestAllOpenYatirimStudyUnitForms() {
            yatirimStudyUnits.forEach(u => { if (!u.saved) harvestYatirimStudyUnitForm(u.id); });
        }

        function addYatirimStudyQuestion(unitId) {
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
            if (!unit) return;
            if (unit.questions.length >= 40) { alert('En fazla 40 soru ekleyebilirsin.'); return; }
            harvestYatirimStudyUnitForm(unitId);
            unit.questions.push({ id: yatirimStudyQuestionIdCounter++, text: '', options: ['', '', '', '', ''], correct: null });
            renderYatirimStudy();
        }

        function removeYatirimStudyQuestion(unitId, questionId) {
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
            if (!unit) return;
            harvestYatirimStudyUnitForm(unitId);
            unit.questions = unit.questions.filter(q => q.id !== questionId);
            renderYatirimStudy();
        }

        function saveYatirimStudyUnit(unitId) {
            harvestYatirimStudyUnitForm(unitId);
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.saved = true;
            renderYatirimStudy();
        }

        function editYatirimStudyUnit(unitId) {
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.saved = false;
            renderYatirimStudy();
        }

        function toggleYatirimStudySubject(arrow) {
            const card = arrow.closest('.yatirimStudy-subject-card');
            const subjectId = card.dataset.subjectId;
            const collapsed = card.classList.toggle('collapsed');
            yatirimStudyCollapsedSubjects[subjectId] = collapsed;
            try {
                localStorage.setItem('yatirimStudy-collapsed-subjects', JSON.stringify(yatirimStudyCollapsedSubjects));
            } catch (e) {
            }
        }

        // --- Toplu yapıştırma: soruyu şıklarıyla birlikte tek metin olarak yapıştırıp otomatik ayrıştırma ---
        function parseYatirimStudyQuestionText(unitId) {
            const box = document.getElementById('bulk-question-yatirimStudy-' + unitId);
            const raw = box.value;
            if (!raw.trim()) { alert('Önce soru metnini yapıştır.'); return; }

            const lines = raw.split('\n').map(l => l.trim()).filter(l => l !== '');
            const optionRegex = /^([A-Ea-e])[\)\.\-]\s*(.+)$/;
            let questionLines = [];
            const options = ['', '', '', '', ''];
            let correct = null;
            let mode = 'question';

            lines.forEach(line => {
                const answerMatch = line.match(/^(?:cevap|doğru cevap|dogru cevap)\s*[:\-]?\s*([A-Ea-e])/i);
                if (answerMatch) {
                    correct = answerMatch[1].toUpperCase().charCodeAt(0) - 65;
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

            harvestYatirimStudyUnitForm(unitId);
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.questions.push({ id: yatirimStudyQuestionIdCounter++, text: questionText, options, correct });
            box.value = '';
            renderYatirimStudy();
        }

        // --- Toplu yapıştırma: "1. ... 2. ..." biçimindeki tüm teknikleri tek seferde ayrıştırıp doldurma ---
        function parseYatirimStudyTechniqueText(unitId) {
            const box = document.getElementById('bulk-technique-yatirimStudy-' + unitId);
            const raw = box.value;
            if (!raw.trim()) { alert('Önce teknik metnini yapıştır.'); return; }

            const numberRegex = /(?:^|\n)\s*(\d{1,2})[\.\)]\s*/g;
            const matches = [...raw.matchAll(numberRegex)];
            if (!matches.length) { alert('Numaralandırılmış teknik bulunamadı. Format: "1. ... 2. ..."'); return; }

            harvestYatirimStudyUnitForm(unitId);
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
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
            renderYatirimStudy();
        }

        function toggleYatirimStudyTechniques(unitId) {
            openYatirimStudyReader(unitId, 'technique');
        }

        function openYatirimStudyReader(unitId, type) {
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
            if (!unit) return;
            yatirimStudyReader = { unitId, type, index: 0 };
            renderYatirimStudy();
        }

        function closeYatirimStudyReader() {
            if (yatirimStudyReader && yatirimStudyReader.type === 'question') {
                const unit = yatirimStudyUnits.find(u => u.id === yatirimStudyReader.unitId);
                if (unit) {
                    unit.quizMode = false;
                    unit.quizResult = null;
                    unit.quizIndex = 0;
                        delete unit.quizQuestionIds;
                }
            }
            yatirimStudyReader = null;
            renderYatirimStudy();
        }

        function moveYatirimStudyReader(direction) {
            if (!yatirimStudyReader) return;
            const unit = yatirimStudyUnits.find(u => u.id === yatirimStudyReader.unitId);
            if (!unit) return;
            const items = yatirimStudyReader.type === 'technique'
                ? unit.techniques
                : getYatirimStudyQuizQuestions(unit);
            const nextIndex = yatirimStudyReader.index + direction;
            if (nextIndex < 0 || nextIndex >= items.length) return;
            yatirimStudyReader.index = nextIndex;
            renderYatirimStudy();
        }

        function startYatirimStudyQuiz(unitId) {
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
            if (!unit) return;
            if (!unit.questions.filter(q => q.text.trim()).length) { alert('Bu ders biriminde henüz soru yok.'); return; }
            unit.quizMode = true;
            unit.quizResult = null;
            unit.quizIndex = 0;
            yatirimStudyQuizAnswers[unitId] = {};
            yatirimStudyQuizFeedback[unitId] = {};
            unit.quizQuestionIds = unit.questions.filter(q => q.text.trim()).map(q => q.id);
            yatirimStudyReader = { unitId, type: 'question', index: 0 };
            renderYatirimStudy();
        }

        function closeYatirimStudyQuiz(unitId) {
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.quizMode = false;
            unit.quizResult = null;
            unit.quizIndex = 0;
            delete unit.quizQuestionIds;
            renderYatirimStudy();
        }

        function selectYatirimStudyAnswer(unitId, questionId, optionIndex) {
            if (!yatirimStudyQuizAnswers[unitId]) yatirimStudyQuizAnswers[unitId] = {};
            yatirimStudyQuizAnswers[unitId][questionId] = optionIndex;
            if (yatirimStudyQuizFeedback[unitId]) delete yatirimStudyQuizFeedback[unitId][questionId];
            renderYatirimStudy();
        }

        function checkYatirimStudyAnswer(unitId, questionId) {
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
            const question = unit?.questions.find(q => q.id === questionId);
            if (!unit || !question) return;
            if (!yatirimStudyQuizFeedback[unitId]) yatirimStudyQuizFeedback[unitId] = {};
            const answer = yatirimStudyQuizAnswers[unitId]?.[questionId];
            if (answer === undefined) {
                yatirimStudyQuizFeedback[unitId][questionId] = 'empty';
                renderYatirimStudy();
                return;
            }
            if (question.correct === null || question.correct === undefined) {
                yatirimStudyQuizFeedback[unitId][questionId] = 'unkeyed';
                renderYatirimStudy();
                return;
            }
            const isCorrect = answer === question.correct;
            const history = question.answerHistory || (question.answerHistory = []);
            const lastAttempt = history[history.length - 1];
            if (!lastAttempt || lastAttempt.answer !== answer) {
                history.push({ answer, correct: isCorrect, at: new Date().toISOString() });
                if (isCorrect) {
                    question.correctCount++;
                    question.reviewLevel = Math.min(question.reviewLevel + 1, YATIRIM_STUDY_REVIEW_INTERVALS.length - 1);
                    const reviewDate = new Date();
                    reviewDate.setDate(reviewDate.getDate() + YATIRIM_STUDY_REVIEW_INTERVALS[question.reviewLevel]);
                    question.nextReviewAt = reviewDate.toISOString();
                } else {
                    question.wrongCount++;
                    question.reviewLevel = 0;
                    const reviewDate = new Date();
                    reviewDate.setDate(reviewDate.getDate() + 1);
                    question.nextReviewAt = reviewDate.toISOString();
                }
                scheduleSave();
            }
            yatirimStudyQuizFeedback[unitId][questionId] = isCorrect ? 'correct' : 'wrong';
            renderYatirimStudy();
        }

        function finishYatirimStudyQuiz(unitId) {
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
            if (!unit) return;
            const answers = yatirimStudyQuizAnswers[unitId] || {};
            const validQuestions = getYatirimStudyQuizQuestions(unit).filter(q => q.correct !== null);
            let correct = 0;
            validQuestions.forEach(q => { if (answers[q.id] === q.correct) correct++; });
            unit.quizIndex = Math.max(0, getYatirimStudyQuizQuestions(unit).length - 1);
            unit.quizResult = { correct, total: validQuestions.length };
            if (yatirimStudyReader && yatirimStudyReader.unitId === unitId && yatirimStudyReader.type === 'question') {
                yatirimStudyReader.index = unit.quizIndex;
            }
            renderYatirimStudy();
        }

        function renderYatirimStudyQuiz(unit) {
            const answers = yatirimStudyQuizAnswers[unit.id] || {};
            const validQuestions = getYatirimStudyQuizQuestions(unit);
            const letters = ['A', 'B', 'C', 'D', 'E'];

            const currentIndex = Math.min(unit.quizResult ? validQuestions.length - 1 : (unit.quizIndex || 0), validQuestions.length - 1);
            const q = validQuestions[currentIndex];
            if (!q) return '';
            const optsHtml = letters.map((letter, o) => {
                if (!q.options[o] || !q.options[o].trim()) return '';
                const selected = answers[q.id] === o;
                return `<label style="display:flex; align-items:center; gap:6px; font-size:0.8rem; margin-top:8px; cursor:pointer;">
                    <input type="radio" name="quiz-yatirimStudy-${unit.id}-${q.id}" ${selected ? 'checked' : ''} onchange="selectYatirimStudyAnswer(${unit.id}, ${q.id}, ${o})">
                    ${letter}) ${q.options[o].replace(/</g, '&lt;')}
                </label>`;
            }).join('');
            const questionsHtml = `<div class="yatirimStudy-quiz-question">
                <div style="font-size:0.95rem; font-weight:600;">${currentIndex + 1}. ${q.text.replace(/</g, '&lt;')}</div>
                ${optsHtml}
            </div>`;

            const resultHtml = unit.quizResult
                ? `<div style="margin-top:10px; font-weight:600; color:var(--accent-green);">Sonuç: ${unit.quizResult.correct} / ${unit.quizResult.total} doğru</div>`
                : '';

            return `
            <div style="margin-top:12px; border:1px solid var(--accent-gold); border-radius:8px; padding:12px;">
                <strong style="font-size:0.9rem;">📋 Sınav</strong>
                ${questionsHtml}
                ${resultHtml}
                <div style="display:flex; justify-content:space-between; gap:8px; margin-top:10px;">
                    <button class="btn-action" onclick="moveYatirimStudyQuiz(${unit.id}, -1)" ${currentIndex === 0 ? 'disabled' : ''}>← Önceki</button>
                    <button class="btn-action btn-primary" onclick="moveYatirimStudyQuiz(${unit.id}, 1)">${currentIndex === validQuestions.length - 1 ? 'Bitir' : 'Sonraki →'}</button>
                    <button class="btn-action" onclick="closeYatirimStudyQuiz(${unit.id})">Kapat</button>
                </div>
            </div>`;
        }

        function moveYatirimStudyQuiz(unitId, direction) {
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
            if (!unit) return;
            const total = getYatirimStudyQuizQuestions(unit).length;
            unit.quizIndex = Math.max(0, Math.min((unit.quizIndex || 0) + direction, total - 1));
            if (yatirimStudyReader && yatirimStudyReader.unitId === unitId && yatirimStudyReader.type === 'question') {
                yatirimStudyReader.index = unit.quizIndex;
            }
            renderYatirimStudy();
        }

        function renderYatirimStudyReader() {
            if (!yatirimStudyReader) return '';
            const unit = yatirimStudyUnits.find(u => u.id === yatirimStudyReader.unitId);
            if (!unit) return '';
            const isTechnique = yatirimStudyReader.type === 'technique';
            const items = isTechnique ? unit.techniqueContents : getYatirimStudyQuizQuestions(unit);
            const item = items[yatirimStudyReader.index];
            if (!item) return '';
            const text = isTechnique ? item : item.text;
            const title = isTechnique ? 'Teknik' : 'Soru';
            const content = isTechnique
                ? `<div class="yatirimStudy-reader-text">${text.trim() ? text.replace(/</g, '&lt;') : 'Bu teknik için henüz not girilmedi.'}</div>`
                : `<div class="yatirimStudy-reader-text">${text.replace(/</g, '&lt;')}</div>`;
            const options = !isTechnique ? ['A', 'B', 'C', 'D', 'E'].map((letter, i) => item.options[i] && `<label class="yatirimStudy-reader-option"><input type="radio" name="reader-answer-${unit.id}-${item.id}" ${yatirimStudyQuizAnswers[unit.id]?.[item.id] === i ? 'checked' : ''} onchange="selectYatirimStudyAnswer(${unit.id}, ${item.id}, ${i})"> ${letter}) ${item.options[i].replace(/</g, '&lt;')}</label>`).join('') : '';
            const feedback = !isTechnique ? yatirimStudyQuizFeedback[unit.id]?.[item.id] : '';
            const feedbackText = feedback === 'correct' ? 'Doğru cevap.' : feedback === 'wrong' ? `Yanlış cevap. Doğru seçenek: ${item.correct === null ? 'Belirlenmemiş' : ['A', 'B', 'C', 'D', 'E'][item.correct]}` : feedback === 'empty' ? 'Önce bir seçenek işaretle.' : feedback === 'unkeyed' ? 'Bu soru için doğru cevap tanımlanmamış.' : '';
            const result = !isTechnique && unit.quizResult && yatirimStudyReader.index === items.length - 1
                ? `<div class="yatirimStudy-reader-result">Sonuç: ${unit.quizResult.correct} / ${unit.quizResult.total} doğru</div>`
                : '';
            const previous = isTechnique ? 'moveYatirimStudyReader(-1)' : 'moveYatirimStudyQuiz(' + unit.id + ', -1)';
            const next = isTechnique ? 'moveYatirimStudyReader(1)' : yatirimStudyReader.index === items.length - 1 ? 'finishYatirimStudyQuiz(' + unit.id + ')' : 'moveYatirimStudyQuiz(' + unit.id + ', 1)';
            const nextLabel = !isTechnique && yatirimStudyReader.index === items.length - 1 ? 'Bitir' : 'Sağ →';
            return `<div class="yatirimStudy-reader-backdrop" role="dialog" aria-modal="true">
                <section class="yatirimStudy-reader" aria-label="${title} okuyucu">
                    <div class="yatirimStudy-reader-header"><strong>${unit.name} - ${title}</strong><button class="yatirimStudy-reader-close" onclick="closeYatirimStudyReader()" aria-label="Kapat">×</button></div>
                    <div class="yatirimStudy-reader-progress">${yatirimStudyReader.index + 1} / ${items.length}</div>
                    ${content}${options ? `<div class="yatirimStudy-reader-options">${options}</div><div class="yatirimStudy-reader-answer-actions"><button class="btn-action btn-primary" onclick="checkYatirimStudyAnswer(${unit.id}, ${item.id})">Cevabı Kontrol Et</button>${feedbackText ? `<span class="yatirimStudy-reader-feedback ${feedback === 'correct' ? 'is-correct' : 'is-wrong'}">${feedbackText}</span>` : ''}</div>` : ''}${result}
                    <div class="yatirimStudy-reader-controls"><button class="btn-action" onclick="${previous}" ${yatirimStudyReader.index === 0 ? 'disabled' : ''}>← Sol</button><button class="btn-action btn-primary" onclick="${next}" ${isTechnique && yatirimStudyReader.index === items.length - 1 ? 'disabled' : ''}>${nextLabel}</button></div>
                </section>
            </div>`;
        }

        function openYatirimStudyReview(unitId, questionId) {
            const unit = yatirimStudyUnits.find(u => u.id === unitId);
            if (!unit) return;
            unit.quizMode = true;
            unit.quizResult = null;
            unit.quizIndex = 0;
            unit.quizQuestionIds = [questionId];
            yatirimStudyQuizAnswers[unitId] = {};
            yatirimStudyQuizFeedback[unitId] = {};
            yatirimStudyReader = { unitId, type: 'question', index: 0 };
            renderYatirimStudy();
        }

        function escapeYatirimStudyText(value) {
            return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function getYatirimStudyQuestionContext(unit) {
            const topic = yatirimStudyTopics.find(item => item.id === unit.topicId);
            const subject = topic && yatirimStudySubjects.find(item => item.id === topic.subjectId);
            return `${subject ? escapeYatirimStudyText(subject.name) : ''} / ${topic ? escapeYatirimStudyText(topic.name) : ''} / ${escapeYatirimStudyText(unit.name)}`;
        }

        function renderYatirimStudyInsights() {
            const insights = document.getElementById('yatirimStudy-insights');
            if (!insights) return;
            const allQuestions = yatirimStudyUnits.flatMap(unit => unit.questions.filter(q => q.text.trim()).map(question => ({ unit, question })));
            const wrongQuestions = allQuestions.filter(item => item.question.wrongCount > 0);
            const dueQuestions = allQuestions.filter(item => isYatirimStudyReviewDue(item.question));
            const graph = yatirimStudySubjects.map(subject => {
                const subjectTopicIds = yatirimStudyTopics.filter(topic => topic.subjectId === subject.id).map(topic => topic.id);
                const questions = yatirimStudyUnits.filter(unit => subjectTopicIds.includes(unit.topicId)).flatMap(unit => unit.questions);
                const attempts = questions.reduce((sum, question) => sum + question.correctCount + question.wrongCount, 0);
                const correct = questions.reduce((sum, question) => sum + question.correctCount, 0);
                return { name: subject.name, accuracy: attempts ? Math.round(correct / attempts * 100) : 0, attempts };
            });
            const graphHtml = graph.length ? graph.map(item => `<div class="yatirimStudy-graph-row"><span>${escapeYatirimStudyText(item.name)}</span><div class="yatirimStudy-graph-track"><div class="yatirimStudy-graph-bar" style="width:${item.accuracy}%"></div></div><strong>%${item.accuracy}</strong></div>`).join('') : '<span class="yatirimStudy-empty-state">Henüz ders eklenmedi.</span>';
            const wrongHtml = wrongQuestions.length ? wrongQuestions.slice(0, 8).map(item => `<div class="yatirimStudy-insight-item"><div><strong>${escapeYatirimStudyText(item.question.text)}</strong><small>${getYatirimStudyQuestionContext(item.unit)} · ${item.question.wrongCount} yanlış</small></div><button class="btn-action" onclick="openYatirimStudyReview(${item.unit.id}, ${item.question.id})">Tekrar Et</button></div>`).join('') : '<span class="yatirimStudy-empty-state">Henüz yanlış cevap yok.</span>';
            const dueHtml = dueQuestions.length ? dueQuestions.slice(0, 8).map(item => `<div class="yatirimStudy-insight-item"><div><strong>${escapeYatirimStudyText(item.question.text)}</strong><small>${getYatirimStudyQuestionContext(item.unit)} · ${formatYatirimStudyDate(getYatirimStudyReviewDate(item.question))}</small></div><button class="btn-action btn-primary" onclick="openYatirimStudyReview(${item.unit.id}, ${item.question.id})">Çöz</button></div>`).join('') : '<span class="yatirimStudy-empty-state">Bugün tekrar edilecek soru yok.</span>';
            insights.innerHTML = `<div class="yatirimStudy-insights-grid"><section class="yatirimStudy-insight-panel"><h3>Başarı Grafiği</h3><div class="yatirimStudy-graph">${graphHtml}</div></section><section class="yatirimStudy-insight-panel"><h3>Yanlışlar Defteri <span>${wrongQuestions.length}</span></h3><div class="yatirimStudy-insight-list">${wrongHtml}</div></section><section class="yatirimStudy-insight-panel"><h3>Bugünkü Tekrarlar <span>${dueQuestions.length}</span></h3><div class="yatirimStudy-insight-list">${dueHtml}</div></section></div>`;
        }

        function renderYatirimStudyUnitEditForm(unit) {
            const techniquesHtml = unit.techniques.map((t, i) => `
                <div style="margin-bottom:8px;">
                    <label style="font-size:0.8rem; color:var(--text-muted);">Teknik ${i + 1}</label>
                    <textarea class="prayer-note" id="technique-yatirimStudy-${unit.id}-${i}" placeholder="Teknik ${i + 1} notların...">${(t || '').replace(/</g, '&lt;')}</textarea>
                </div>
            `).join('');

            const letters = ['A', 'B', 'C', 'D', 'E'];
            const questionsHtml = unit.questions.map((q, idx) => `
                <div style="border:1px solid var(--border-color); border-radius:6px; padding:10px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="font-size:0.85rem;">Soru ${idx + 1}</strong>
                        <button class="btn-action" style="color:var(--accent-red); padding:2px 8px;" onclick="removeYatirimStudyQuestion(${unit.id}, ${q.id})">✕</button>
                    </div>
                    <textarea class="prayer-note" id="q-text-yatirimStudy-${unit.id}-${q.id}" placeholder="Soru metni">${(q.text || '').replace(/</g, '&lt;')}</textarea>
                    ${letters.map((letter, o) => `
                        <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
                            <input type="radio" name="q-correct-yatirimStudy-${unit.id}-${q.id}" value="${o}" ${q.correct === o ? 'checked' : ''}>
                            <span style="font-size:0.8rem; width:16px;">${letter})</span>
                            <input type="text" id="q-opt-yatirimStudy-${unit.id}-${q.id}-${o}" value="${(q.options[o] || '').replace(/"/g, '&quot;')}" placeholder="${letter} şıkkı" style="flex:1; background:#121212; border:1px solid var(--border-color); color:var(--text-main); padding:5px 8px; border-radius:4px; font-size:0.8rem;">
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
                    <textarea class="prayer-note" id="bulk-technique-yatirimStudy-${unit.id}" placeholder="1. İlk teknik metni...&#10;2. İkinci teknik metni...&#10;..."></textarea>
                    <button class="btn-action btn-primary" style="margin-top:6px;" onclick="parseYatirimStudyTechniqueText(${unit.id})">Ayrıştır ve Doldur</button>
                </div>
                <h4 style="font-size:0.85rem; color:var(--text-muted); margin:12px 0 4px 0;">Soru - Cevap (${unit.questions.length}/40)</h4>
                ${questionsHtml}
                <div style="margin:10px 0; padding:10px; border:1px dashed var(--accent-gold); border-radius:6px;">
                    <label style="font-size:0.8rem; color:var(--text-muted); display:block; margin-bottom:6px;">Ya da soruyu şıklarıyla birlikte tek seferde yapıştır</label>
                    <textarea class="prayer-note" id="bulk-question-yatirimStudy-${unit.id}" placeholder="Soru metni...&#10;A) ...&#10;B) ...&#10;C) ...&#10;D) ...&#10;E) ...&#10;Cevap: B"></textarea>
                    <button class="btn-action btn-primary" style="margin-top:6px;" onclick="parseYatirimStudyQuestionText(${unit.id})">Ayrıştır ve Ekle</button>
                </div>
                <button class="btn-action" onclick="addYatirimStudyQuestion(${unit.id})">+ Soru Ekle</button>
                <button class="btn-action btn-primary" style="margin-top:10px;" onclick="saveYatirimStudyUnit(${unit.id})">Kaydet</button>
            </div>`;
        }

        function renderYatirimStudyUnitSummary(unit) {
            const techniquesHtml = unit.showTechniques
                ? `<div style="display:flex; flex-direction:column; gap:6px; margin-top:8px; border-top:1px solid var(--border-color); padding-top:8px;">
                    ${unit.techniques.map((t, i) => t.trim() ? `<div style="font-size:0.8rem;"><strong>Teknik ${i + 1}:</strong> ${t.replace(/</g, '&lt;')}</div>` : '').join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz teknik notu girilmedi.</span>'}
                   </div>`
                : '';
            const quizHtml = unit.quizMode && !yatirimStudyReader ? renderYatirimStudyQuiz(unit) : '';
            const questionCount = unit.questions.filter(q => q.text.trim()).length;

            return `
            <div class="prayer-card">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <strong>📝 ${unit.name}</strong>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <button class="btn-action" onclick="toggleYatirimStudyTechniques(${unit.id})">${unit.showTechniques ? '11 Tekniği Gizle' : '11 Tekniği Oku'}</button>
                        <button class="btn-action btn-primary" onclick="startYatirimStudyQuiz(${unit.id})">40 Soru Çöz</button>
                        <button class="btn-action" onclick="editYatirimStudyUnit(${unit.id})">Düzenle</button>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="removeYatirimStudyUnit(${unit.id})">Sil</button>
                    </div>
                </div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${questionCount} soru kayıtlı</div>
                ${techniquesHtml}
                ${quizHtml}
            </div>`;
        }

        function renderYatirimStudyUnitCard(unit) {
            return unit.saved ? renderYatirimStudyUnitSummary(unit) : renderYatirimStudyUnitEditForm(unit);
        }

        function renderYatirimStudyTopicCard(topic) {
            const units = yatirimStudyUnits.filter(u => u.topicId === topic.id);
            return `
            <div class="prayer-card" style="border-color:var(--accent-blue);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>📂 ${topic.name}</strong>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeYatirimStudyTopic(${topic.id})">Konuyu Sil</button>
                </div>
                <div class="form-row">
                    <input type="text" id="new-yatirimStudy-unit-${topic.id}" placeholder="Ders birimi adı (örn: 1. Ders)">
                    <button class="btn-action btn-primary" onclick="addYatirimStudyUnit(${topic.id})">+ Ders Birimi Ekle</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${units.length ? units.map(renderYatirimStudyUnitCard).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz ders birimi eklenmedi.</span>'}
                </div>
            </div>`;
        }

        function renderYatirimStudySubjectCard(subject) {
            const topics = yatirimStudyTopics.filter(t => t.subjectId === subject.id);
            return `
            <div class="prayer-card yatirimStudy-subject-card${yatirimStudyCollapsedSubjects[subject.id] ? ' collapsed' : ''}" data-subject-id="${subject.id}" style="border-color:var(--accent-gold);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong><span class="toggle-arrow" onclick="toggleYatirimStudySubject(this)">▶</span>📖 ${subject.name}</strong>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeYatirimStudySubject(${subject.id})">Dersi Sil</button>
                </div>
                <div class="yatirimStudy-subject-content">
                <div class="form-row">
                    <input type="text" id="new-yatirimStudy-topic-${subject.id}" placeholder="Konu adı (örn: Asal Sayılar)">
                    <button class="btn-action btn-primary" onclick="addYatirimStudyTopic(${subject.id})">+ Konu Ekle</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${topics.length ? topics.map(renderYatirimStudyTopicCard).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz konu eklenmedi.</span>'}
                </div>
                </div>
            </div>`;
        }

        function renderYatirimStudy() {
            harvestAllOpenYatirimStudyUnitForms();
            ensureYatirimStudyQuestionStats();
            renderYatirimStudyInsights();
            const wrap = document.getElementById('yatirimStudy-subjects-list');
            wrap.innerHTML = yatirimStudySubjects.length
                ? yatirimStudySubjects.map(renderYatirimStudySubjectCard).join('')
                : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz ders eklenmedi.</span>';
            document.getElementById('yatirimStudy-count').innerText = yatirimStudySubjects.length + ' ders';
            document.querySelectorAll('.yatirimStudy-reader-backdrop').forEach(reader => reader.remove());
            document.body.insertAdjacentHTML('beforeend', renderYatirimStudyReader());
        }

        
