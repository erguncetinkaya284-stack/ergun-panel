        // ================= KRİPTO & YATIRIM TAKİBİ =================
        let yatirimCategories = [];
        let yatirimItems = []; // {id, category, amount, buyPrice, currentPrice}
        let yatirimItemIdCounter = 1;
        let yatirimNotes = '';
        let yatirimStudySubjects = [];
        let yatirimStudySubjectIdCounter = 1;
        let yatirimStudyTopicIdCounter = 1;
        let yatirimStudyUnitIdCounter = 1;
        let yatirimStudyQuestionIdCounter = 1;

        function findYatirimStudySubject(id) { return yatirimStudySubjects.find(subject => subject.id === id); }
        function findYatirimStudyTopic(subject, id) { return subject?.topics.find(topic => topic.id === id); }
        function findYatirimStudyUnit(subject, topicId, id) { return findYatirimStudyTopic(subject, topicId)?.units.find(unit => unit.id === id); }

        function addYatirimStudySubject() {
            const input = document.getElementById('new-yatirim-study-subject');
            const name = input.value.trim();
            if (!name) { alert('Ana başlık boş olamaz.'); return; }
            yatirimStudySubjects.push({ id: yatirimStudySubjectIdCounter++, name, topics: [] });
            input.value = '';
            renderYatirim();
        }

        function removeYatirimStudySubject(id) {
            if (!confirm('Bu başlık ve tüm öğrenme kayıtları silinecek. Emin misin?')) return;
            yatirimStudySubjects = yatirimStudySubjects.filter(subject => subject.id !== id);
            renderYatirim();
        }

        function addYatirimStudyTopic(subjectId) {
            const subject = findYatirimStudySubject(subjectId);
            const input = document.getElementById('new-yatirim-study-topic-' + subjectId);
            const name = input.value.trim();
            if (!subject || !name) return;
            subject.topics.push({ id: yatirimStudyTopicIdCounter++, name, units: [] });
            input.value = '';
            renderYatirim();
        }

        function removeYatirimStudyTopic(subjectId, topicId) {
            const subject = findYatirimStudySubject(subjectId);
            if (!subject) return;
            subject.topics = subject.topics.filter(topic => topic.id !== topicId);
            renderYatirim();
        }

        function addYatirimStudyUnit(subjectId, topicId) {
            const subject = findYatirimStudySubject(subjectId);
            const topic = findYatirimStudyTopic(subject, topicId);
            const input = document.getElementById('new-yatirim-study-unit-' + topicId);
            const name = input.value.trim();
            if (!topic || !name) return;
            topic.units.push({ id: yatirimStudyUnitIdCounter++, name, notes: '', questions: [], saved: false, quizMode: false, quizResult: null });
            input.value = '';
            renderYatirim();
        }

        function removeYatirimStudyUnit(subjectId, topicId, unitId) {
            const subject = findYatirimStudySubject(subjectId);
            const topic = findYatirimStudyTopic(subject, topicId);
            if (!topic) return;
            topic.units = topic.units.filter(unit => unit.id !== unitId);
            renderYatirim();
        }

        function harvestYatirimStudyUnit(subjectId, topicId, unitId) {
            const unit = findYatirimStudyUnit(findYatirimStudySubject(subjectId), topicId, unitId);
            if (!unit) return;
            const notes = document.getElementById(`yatirim-study-notes-${unitId}`);
            if (notes) unit.notes = notes.value;
            unit.questions.forEach(question => {
                const text = document.getElementById(`yatirim-study-q-text-${unitId}-${question.id}`);
                if (text) question.text = text.value;
                for (let i = 0; i < 5; i++) {
                    const option = document.getElementById(`yatirim-study-q-opt-${unitId}-${question.id}-${i}`);
                    if (option) question.options[i] = option.value;
                }
                document.getElementsByName(`yatirim-study-q-correct-${unitId}-${question.id}`).forEach(radio => { if (radio.checked) question.correct = parseInt(radio.value); });
            });
        }

        function addYatirimStudyQuestion(subjectId, topicId, unitId) {
            harvestYatirimStudyUnit(subjectId, topicId, unitId);
            const unit = findYatirimStudyUnit(findYatirimStudySubject(subjectId), topicId, unitId);
            if (!unit || unit.questions.length >= 40) return;
            unit.questions.push({ id: yatirimStudyQuestionIdCounter++, text: '', options: ['', '', '', '', ''], correct: null });
            renderYatirim();
        }

        function saveYatirimStudyUnit(subjectId, topicId, unitId) {
            harvestYatirimStudyUnit(subjectId, topicId, unitId);
            const unit = findYatirimStudyUnit(findYatirimStudySubject(subjectId), topicId, unitId);
            if (unit) { unit.saved = true; renderYatirim(); }
        }

        function editYatirimStudyUnit(subjectId, topicId, unitId) {
            const unit = findYatirimStudyUnit(findYatirimStudySubject(subjectId), topicId, unitId);
            if (unit) { unit.saved = false; renderYatirim(); }
        }

        function startYatirimStudyQuiz(subjectId, topicId, unitId) {
            const unit = findYatirimStudyUnit(findYatirimStudySubject(subjectId), topicId, unitId);
            if (!unit || !unit.questions.some(question => question.text.trim())) { alert('Bu ders biriminde henüz soru yok.'); return; }
            unit.quizMode = true;
            unit.quizResult = null;
            unit.answers = {};
            renderYatirim();
        }

        function selectYatirimStudyAnswer(unitId, questionId, option) {
            const subject = yatirimStudySubjects.find(item => item.topics.some(topic => topic.units.some(unit => unit.id === unitId)));
            const unit = subject?.topics.flatMap(topic => topic.units).find(item => item.id === unitId);
            if (!unit) return;
            if (!unit.answers) unit.answers = {};
            unit.answers[questionId] = option;
            renderYatirim();
        }

        function finishYatirimStudyQuiz(subjectId, topicId, unitId) {
            const unit = findYatirimStudyUnit(findYatirimStudySubject(subjectId), topicId, unitId);
            if (!unit) return;
            const valid = unit.questions.filter(question => question.text.trim() && question.correct !== null);
            const correct = valid.filter(question => unit.answers?.[question.id] === question.correct).length;
            unit.quizResult = { correct, total: valid.length };
            renderYatirim();
        }

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

        function harvestAllYatirimStudyForms() {
            yatirimStudySubjects.forEach(subject => subject.topics.forEach(topic => topic.units.forEach(unit => {
                if (!unit.saved) harvestYatirimStudyUnit(subject.id, topic.id, unit.id);
            })));
        }

        function renderYatirimStudyQuiz(subjectId, topicId, unit) {
            const questions = unit.questions.filter(question => question.text.trim());
            const answers = unit.answers || {};
            const options = ['A', 'B', 'C', 'D', 'E'];
            return `<div class="yatirim-study-form" style="margin-top:10px; border:1px solid var(--accent-gold); padding:10px; border-radius:7px;"><strong>📋 Mini Quiz</strong>${questions.map((question, index) => `<div style="margin-top:8px; border-top:1px solid var(--border-color); padding-top:8px;"><strong>${index + 1}. ${question.text.replace(/</g, '&lt;')}</strong>${options.map((letter, option) => question.options[option] ? `<label style="display:block; margin-top:4px;"><input type="radio" name="yatirim-quiz-${unit.id}-${question.id}" ${answers[question.id] === option ? 'checked' : ''} onchange="selectYatirimStudyAnswer(${unit.id}, ${question.id}, ${option})"> ${letter}) ${question.options[option].replace(/</g, '&lt;')}</label>` : '').join('')}</div>`).join('')}${unit.quizResult ? `<div style="margin-top:8px; color:var(--accent-green);">Sonuç: ${unit.quizResult.correct} / ${unit.quizResult.total} doğru</div>` : ''}<button class="btn-action btn-primary" style="margin-top:8px;" onclick="finishYatirimStudyQuiz(${subjectId}, ${topicId}, ${unit.id})">Sonucu Gör</button></div>`;
        }

        function renderYatirimStudyUnit(subjectId, topicId, unit) {
            if (!unit.saved) {
                const questions = unit.questions.map((question, index) => `<div style="border-top:1px solid var(--border-color); margin-top:8px; padding-top:8px;"><strong>Soru ${index + 1}</strong><textarea id="yatirim-study-q-text-${unit.id}-${question.id}" placeholder="Soru metni">${(question.text || '').replace(/</g, '&lt;')}</textarea>${['A', 'B', 'C', 'D', 'E'].map((letter, option) => `<div style="display:flex; gap:5px; align-items:center; margin-top:4px;"><input type="radio" name="yatirim-study-q-correct-${unit.id}-${question.id}" value="${option}" ${question.correct === option ? 'checked' : ''}><input type="text" id="yatirim-study-q-opt-${unit.id}-${question.id}-${option}" value="${(question.options[option] || '').replace(/"/g, '&quot;')}" placeholder="${letter} şıkkı"></div>`).join('')}</div>`).join('');
                return `<div class="prayer-card yatirim-study-card yatirim-study-form"><strong>📝 ${unit.name} <span style="color:var(--text-muted); font-size:0.8rem;">(düzenleniyor)</span></strong><textarea id="yatirim-study-notes-${unit.id}" placeholder="Bu ders biriminin notları...">${(unit.notes || '').replace(/</g, '&lt;')}</textarea><h4 style="margin:10px 0 4px; color:var(--text-muted);">Sorular (${unit.questions.length}/40)</h4>${questions || '<span style="font-size:0.8rem; color:var(--text-muted);">Henüz soru eklenmedi.</span>'}<button class="btn-action" style="margin-top:8px;" onclick="addYatirimStudyQuestion(${subjectId}, ${topicId}, ${unit.id})">+ Soru Ekle</button><button class="btn-action btn-primary" style="margin-top:8px;" onclick="saveYatirimStudyUnit(${subjectId}, ${topicId}, ${unit.id})">Kaydet</button></div>`;
            }
            const questionCount = unit.questions.filter(question => question.text.trim()).length;
            return `<div class="prayer-card yatirim-study-card"><div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;"><strong>📝 ${unit.name}</strong><div><button class="btn-action btn-primary" onclick="startYatirimStudyQuiz(${subjectId}, ${topicId}, ${unit.id})">Quiz Başlat</button><button class="btn-action" onclick="editYatirimStudyUnit(${subjectId}, ${topicId}, ${unit.id})">Düzenle</button><button class="btn-action" style="color:var(--accent-red)" onclick="removeYatirimStudyUnit(${subjectId}, ${topicId}, ${unit.id})">Sil</button></div></div><div style="font-size:0.8rem; color:var(--text-muted);">${questionCount} soru kayıtlı</div>${unit.notes ? `<div style="white-space:pre-wrap; margin-top:6px;">${unit.notes.replace(/</g, '&lt;')}</div>` : ''}${unit.quizMode ? renderYatirimStudyQuiz(subjectId, topicId, unit) : ''}</div>`;
        }

        function renderYatirimStudy() {
            const wrap = document.getElementById('yatirim-study-list');
            if (!wrap) return;
            harvestAllYatirimStudyForms();
            wrap.innerHTML = yatirimStudySubjects.length ? yatirimStudySubjects.map(subject => `<div class="prayer-card yatirim-study-card"><div style="display:flex; justify-content:space-between; align-items:center;"><strong>📚 ${subject.name}</strong><button class="btn-action" style="color:var(--accent-red)" onclick="removeYatirimStudySubject(${subject.id})">Başlığı Sil</button></div><div class="form-row" style="margin-top:8px;"><input type="text" id="new-yatirim-study-topic-${subject.id}" placeholder="Konu (örn: Blockchain, Grafik Okuma)"><button class="btn-action btn-primary" onclick="addYatirimStudyTopic(${subject.id})">+ Konu Ekle</button></div><div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">${subject.topics.length ? subject.topics.map(topic => `<div class="prayer-card" style="border-color:var(--accent-blue);"><div style="display:flex; justify-content:space-between; align-items:center;"><strong>📂 ${topic.name}</strong><button class="btn-action" style="color:var(--accent-red)" onclick="removeYatirimStudyTopic(${subject.id}, ${topic.id})">Konuyu Sil</button></div><div class="form-row" style="margin-top:8px;"><input type="text" id="new-yatirim-study-unit-${topic.id}" placeholder="Ders birimi (örn: 1. Ders)"><button class="btn-action btn-primary" onclick="addYatirimStudyUnit(${subject.id}, ${topic.id})">+ Ders Ekle</button></div><div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">${topic.units.length ? topic.units.map(unit => renderYatirimStudyUnit(subject.id, topic.id, unit)).join('') : '<span style="font-size:0.8rem; color:var(--text-muted);">Henüz ders birimi yok.</span>'}</div></div>`).join('') : '<span style="font-size:0.8rem; color:var(--text-muted);">Henüz konu yok.</span>'}</div></div>`).join('') : '<span style="font-size:0.85rem; color:var(--text-muted);">Henüz öğrenme başlığı eklenmedi.</span>';
        }

        function renderYatirim() {
            harvestAllYatirimStudyForms();
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

