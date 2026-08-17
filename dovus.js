        // ================= DÖVÜŞ / TEKNİK TAKİBİ =================
        let combatCategories = [];
        let combatItems = [];
        let editingCombatId = null;
        let combatIdCounter = 1;

        function addCombatCategory() {
            const input = document.getElementById('new-combat-cat');
            const value = input.value.trim();
            if (!value) return;
            if (combatCategories.includes(value)) { input.value = ''; return; }
            combatCategories.push(value);
            input.value = '';
            renderCombatCategories();
            renderCombatCategoryOptions();
        }

        function removeCombatCategory(value) {
            combatCategories = combatCategories.filter(c => c !== value);
            renderCombatCategories();
            renderCombatCategoryOptions();
        }

        function renderCombatCategories() {
            const wrap = document.getElementById('combat-categories-list');
            wrap.innerHTML = combatCategories.map(c => `
                <span class="category-tag">${c}<button onclick="removeCombatCategory('${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz branş kategorisi eklenmedi.</span>';
        }

        function renderCombatCategoryOptions() {
            const select = document.getElementById('combat-cat');
            select.innerHTML = combatCategories.length
                ? combatCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce branş kategorisi ekle</option>';
        }

        function saveCombatItem() {
            const title = document.getElementById('combat-title').value.trim();
            const content = document.getElementById('combat-content').value.trim();
            const youtube = document.getElementById('combat-youtube').value.trim();
            const cat = document.getElementById('combat-cat').value;

            if (!title) { alert('Başlık boş olamaz.'); return; }

            if (editingCombatId !== null) {
                const item = combatItems.find(i => i.id === editingCombatId);
                if (item) {
                    item.title = title;
                    item.content = content;
                    item.youtube = youtube;
                    item.cat = cat;
                }
                editingCombatId = null;
                document.getElementById('combat-save-btn').innerText = 'Kaydet';
            } else {
                combatItems.push({
                    id: combatIdCounter++,
                    title, content, youtube, cat,
                    doneDate: null
                });
            }

            document.getElementById('combat-title').value = '';
            document.getElementById('combat-content').value = '';
            document.getElementById('combat-youtube').value = '';
            renderCombatItems();
        }

        function editCombatItem(id) {
            const item = combatItems.find(i => i.id === id);
            if (!item) return;
            document.getElementById('combat-title').value = item.title;
            document.getElementById('combat-content').value = item.content;
            document.getElementById('combat-youtube').value = item.youtube;
            document.getElementById('combat-cat').value = item.cat;
            editingCombatId = id;
            document.getElementById('combat-save-btn').innerText = 'Güncelle';
            document.querySelectorAll('.recipe-form')[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function deleteCombatItem(id) {
            combatItems = combatItems.filter(i => i.id !== id);
            if (editingCombatId === id) {
                editingCombatId = null;
                document.getElementById('combat-save-btn').innerText = 'Kaydet';
            }
            renderCombatItems();
        }

        function toggleCombatDone(id, checked) {
            const item = combatItems.find(i => i.id === id);
            if (!item) return;
            const today = new Date().toISOString().slice(0, 10);
            item.doneDate = checked ? today : null;
            renderCombatItems();
        }

        function renderCombatItems() {
            const wrap = document.getElementById('combat-list');
            const today = new Date().toISOString().slice(0, 10);

            document.getElementById('combat-count').innerText = combatItems.length + ' kayıt';

            if (!combatItems.length) {
                wrap.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz kayıt eklenmedi.</span>';
                return;
            }

            wrap.innerHTML = combatItems.map(i => {
                const doneToday = i.doneDate === today;
                const catHtml = i.cat ? `<span class="category-tag">${i.cat}</span>` : '';
                const ytHtml = i.youtube ? `<a class="recipe-yt" href="${i.youtube}" target="_blank" rel="noopener">▶ YouTube'da izle</a>` : '';

                return `
                <div class="recipe-card ${doneToday ? 'done-today' : ''}">
                    <h3>${i.title}</h3>
                    <div class="recipe-cats">${catHtml}</div>
                    <div class="recipe-content">${i.content ? i.content.replace(/</g, '&lt;') : ''}</div>
                    ${ytHtml}
                    <label class="done-check">
                        <input type="checkbox" ${doneToday ? 'checked' : ''} onchange="toggleCombatDone(${i.id}, this.checked)">
                        Bugün bunu yaptım
                    </label>
                    <div class="recipe-actions">
                        <button class="btn-action" onclick="addToDailyProgram('${i.title.replace(/'/g, "\\'")}')">📅 Günlük Programa Ekle</button>
                        <button class="btn-action" onclick="editCombatItem(${i.id})">Düzenle</button>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="deleteCombatItem(${i.id})">Sil</button>
                    </div>
                </div>`;
            }).join('');
        }

