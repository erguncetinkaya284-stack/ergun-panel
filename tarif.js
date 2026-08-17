        // ================= TARİF DEFTERİ =================
        let timeCategories = [];
        let typeCategories = [];
        let recipes = [];
        let editingRecipeId = null;
        let recipeIdCounter = 1;

        function addCategory(kind) {
            const inputId = kind === 'time' ? 'new-time-cat' : 'new-type-cat';
            const input = document.getElementById(inputId);
            const value = input.value.trim();
            if (!value) return;

            const list = kind === 'time' ? timeCategories : typeCategories;
            if (list.includes(value)) { input.value = ''; return; }
            list.push(value);
            input.value = '';
            renderCategories();
            renderCategoryOptions();
        }

        function removeCategory(kind, value) {
            if (kind === 'time') {
                timeCategories = timeCategories.filter(c => c !== value);
            } else {
                typeCategories = typeCategories.filter(c => c !== value);
            }
            renderCategories();
            renderCategoryOptions();
        }

        function renderCategories() {
            const timeWrap = document.getElementById('time-categories-list');
            timeWrap.innerHTML = timeCategories.map(c => `
                <span class="category-tag">${c}<button onclick="removeCategory('time', '${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz zaman kategorisi eklenmedi.</span>';

            const typeWrap = document.getElementById('type-categories-list');
            typeWrap.innerHTML = typeCategories.map(c => `
                <span class="category-tag type-tag">${c}<button onclick="removeCategory('type', '${c.replace(/'/g, "\\'")}')">✕</button></span>
            `).join('') || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz tür kategorisi eklenmedi.</span>';
        }

        function renderCategoryOptions() {
            const timeSelect = document.getElementById('recipe-time-cat');
            const typeSelect = document.getElementById('recipe-type-cat');
            timeSelect.innerHTML = timeCategories.length
                ? timeCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce zaman kategorisi ekle</option>';
            typeSelect.innerHTML = typeCategories.length
                ? typeCategories.map(c => `<option value="${c}">${c}</option>`).join('')
                : '<option value="">Önce tür kategorisi ekle</option>';
        }

        function saveRecipe() {
            const title = document.getElementById('recipe-title').value.trim();
            const content = document.getElementById('recipe-content').value.trim();
            const youtube = document.getElementById('recipe-youtube').value.trim();
            const timeCat = document.getElementById('recipe-time-cat').value;
            const typeCat = document.getElementById('recipe-type-cat').value;

            if (!title) { alert('Tarif başlığı boş olamaz.'); return; }

            if (editingRecipeId !== null) {
                const recipe = recipes.find(r => r.id === editingRecipeId);
                if (recipe) {
                    recipe.title = title;
                    recipe.content = content;
                    recipe.youtube = youtube;
                    recipe.timeCat = timeCat;
                    recipe.typeCat = typeCat;
                }
                editingRecipeId = null;
                document.getElementById('recipe-save-btn').innerText = 'Kaydet';
            } else {
                recipes.push({
                    id: recipeIdCounter++,
                    title, content, youtube, timeCat, typeCat,
                    doneDate: null
                });
            }

            document.getElementById('recipe-title').value = '';
            document.getElementById('recipe-content').value = '';
            document.getElementById('recipe-youtube').value = '';
            renderRecipes();
        }

        function editRecipe(id) {
            const recipe = recipes.find(r => r.id === id);
            if (!recipe) return;
            document.getElementById('recipe-title').value = recipe.title;
            document.getElementById('recipe-content').value = recipe.content;
            document.getElementById('recipe-youtube').value = recipe.youtube;
            document.getElementById('recipe-time-cat').value = recipe.timeCat;
            document.getElementById('recipe-type-cat').value = recipe.typeCat;
            editingRecipeId = id;
            document.getElementById('recipe-save-btn').innerText = 'Güncelle';
            document.querySelectorAll('.recipe-form')[1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function deleteRecipe(id) {
            recipes = recipes.filter(r => r.id !== id);
            if (editingRecipeId === id) {
                editingRecipeId = null;
                document.getElementById('recipe-save-btn').innerText = 'Kaydet';
            }
            renderRecipes();
        }

        function toggleDoneToday(id, checked) {
            const recipe = recipes.find(r => r.id === id);
            if (!recipe) return;
            const today = new Date().toISOString().slice(0, 10);
            recipe.doneDate = checked ? today : null;
            renderRecipes();
        }

        function renderRecipes() {
            const wrap = document.getElementById('recipes-list');
            const today = new Date().toISOString().slice(0, 10);

            document.getElementById('recipe-count').innerText = recipes.length + ' tarif';

            if (!recipes.length) {
                wrap.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz tarif eklenmedi.</span>';
                return;
            }

            wrap.innerHTML = recipes.map(r => {
                const doneToday = r.doneDate === today;
                const catsHtml = [
                    r.timeCat ? `<span class="category-tag">${r.timeCat}</span>` : '',
                    r.typeCat ? `<span class="category-tag type-tag">${r.typeCat}</span>` : ''
                ].join('');
                const ytHtml = r.youtube ? `<a class="recipe-yt" href="${r.youtube}" target="_blank" rel="noopener">▶ YouTube'da izle</a>` : '';

                return `
                <div class="recipe-card ${doneToday ? 'done-today' : ''}">
                    <h3>${r.title}</h3>
                    <div class="recipe-cats">${catsHtml}</div>
                    <div class="recipe-content">${r.content ? r.content.replace(/</g, '&lt;') : ''}</div>
                    ${ytHtml}
                    <label class="done-check">
                        <input type="checkbox" ${doneToday ? 'checked' : ''} onchange="toggleDoneToday(${r.id}, this.checked)">
                        Bugün bunu yaptım
                    </label>
                    <div class="recipe-actions">
                        <button class="btn-action" onclick="addToDailyProgram('${r.title.replace(/'/g, "\\'")}')">📅 Günlük Programa Ekle</button>
                        <button class="btn-action" onclick="editRecipe(${r.id})">Düzenle</button>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="deleteRecipe(${r.id})">Sil</button>
                    </div>
                </div>`;
            }).join('');
        }

