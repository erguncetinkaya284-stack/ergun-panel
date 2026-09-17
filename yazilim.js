        // ================= YAZILIM PROJELERİ (KPSS ile aynı yapı) =================
        let yazilimCategories = []; // {id, name}
        let yazilimCategoryIdCounter = 1;
        let yazilimProjects = []; // {id, categoryId, name}
        let yazilimProjectIdCounter = 1;
        let yazilimTasks = []; // {id, projectId, name, status, description, techStack, checklist:[{id,text,done}], saved}
        let yazilimTaskIdCounter = 1;
        let yazilimChecklistIdCounter = 1;

        function ensureYazilimProjectMeta(project) {
            if (!project.status) project.status = 'Planlandı';
            if (typeof project.progress !== 'number') project.progress = 0;
            if (!project.deadline) project.deadline = '';
            if (!project.repoUrl) project.repoUrl = '';
            if (!project.notes) project.notes = '';
            if (!Array.isArray(project.decisions)) project.decisions = [];
        }

        function yazilimFilters() {
            return {
                search: (document.getElementById('yazilim-search')?.value || '').trim().toLocaleLowerCase('tr-TR'),
                status: document.getElementById('yazilim-status-filter')?.value || 'all',
                priority: document.getElementById('yazilim-priority-filter')?.value || 'all'
            };
        }

        function matchesYazilimTask(task, filters) {
            const searchText = `${task.name} ${task.description || ''} ${task.techStack || ''}`.toLocaleLowerCase('tr-TR');
            return (!filters.search || searchText.includes(filters.search))
                && (filters.priority === 'all' || task.priority === filters.priority);
        }

        function matchesYazilimProject(project, filters) {
            ensureYazilimProjectMeta(project);
            const tasks = yazilimTasks.filter(task => task.projectId === project.id);
            const projectText = `${project.name} ${project.notes} ${project.repoUrl}`.toLocaleLowerCase('tr-TR');
            const searchMatch = !filters.search || projectText.includes(filters.search) || tasks.some(task => matchesYazilimTask(task, { ...filters, search: filters.search }));
            const statusMatch = filters.status === 'all' || project.status === filters.status;
            const priorityMatch = filters.priority === 'all' || tasks.some(task => task.priority === filters.priority);
            return searchMatch && statusMatch && priorityMatch;
        }

        function addYazilimCategory() {
            const input = document.getElementById('new-yazilim-category');
            const name = input.value.trim();
            if (!name) { alert('Kategori adı boş olamaz.'); return; }
            yazilimCategories.push({ id: yazilimCategoryIdCounter++, name });
            input.value = '';
            renderYazilim();
        }

        function removeYazilimCategory(id) {
            if (!confirm('Bu kategori ve içindeki tüm projeler/görevler silinecek. Emin misin?')) return;
            const projectIds = yazilimProjects.filter(p => p.categoryId === id).map(p => p.id);
            yazilimTasks = yazilimTasks.filter(t => !projectIds.includes(t.projectId));
            yazilimProjects = yazilimProjects.filter(p => p.categoryId !== id);
            yazilimCategories = yazilimCategories.filter(c => c.id !== id);
            renderYazilim();
        }

        function addYazilimProject(categoryId) {
            const input = document.getElementById('new-yazilim-project-' + categoryId);
            const name = input.value.trim();
            if (!name) { alert('Proje adı boş olamaz.'); return; }
            yazilimProjects.push({ id: yazilimProjectIdCounter++, categoryId, name });
            renderYazilim();
        }

        function removeYazilimProject(id) {
            if (!confirm('Bu proje ve içindeki tüm görevler silinecek. Emin misin?')) return;
            yazilimTasks = yazilimTasks.filter(t => t.projectId !== id);
            yazilimProjects = yazilimProjects.filter(p => p.id !== id);
            renderYazilim();
        }

        function saveYazilimProjectMeta(projectId) {
            const project = yazilimProjects.find(item => item.id === projectId);
            if (!project) return;
            const status = document.getElementById('yazilim-project-status-' + projectId);
            const progress = document.getElementById('yazilim-project-progress-' + projectId);
            const deadline = document.getElementById('yazilim-project-deadline-' + projectId);
            const repoUrl = document.getElementById('yazilim-project-repo-' + projectId);
            const notes = document.getElementById('yazilim-project-notes-' + projectId);
            const decisions = document.getElementById('yazilim-project-decisions-' + projectId);
            if (!status || !progress || !deadline || !repoUrl || !notes || !decisions) return;
            ensureYazilimProjectMeta(project);
            project.status = status.value;
            project.progress = Math.max(0, Math.min(100, parseInt(progress.value) || 0));
            project.deadline = deadline.value;
            project.repoUrl = repoUrl.value.trim();
            project.notes = notes.value;
            project.decisions = decisions.value.split('\n').map(line => line.trim()).filter(Boolean);
            renderYazilim();
        }

        function addYazilimTask(projectId) {
            const input = document.getElementById('new-yazilim-task-' + projectId);
            const name = input.value.trim();
            if (!name) { alert('Görev adı boş olamaz.'); return; }
            yazilimTasks.push({
                id: yazilimTaskIdCounter++,
                projectId,
                name,
                status: 'Planlandı',
                description: '',
                techStack: '',
                priority: 'Orta',
                spentMinutes: 0,
                checklist: [],
                saved: false
            });
            input.value = '';
            renderYazilim();
        }

        function removeYazilimTask(id) {
            yazilimTasks = yazilimTasks.filter(t => t.id !== id);
            renderYazilim();
        }

        function harvestYazilimTaskForm(taskId) {
            const task = yazilimTasks.find(t => t.id === taskId);
            if (!task) return;
            const descEl = document.getElementById('yazilim-desc-' + taskId);
            if (descEl) task.description = descEl.value;
            const stackEl = document.getElementById('yazilim-stack-' + taskId);
            if (stackEl) task.techStack = stackEl.value;
            const statusEl = document.getElementById('yazilim-status-' + taskId);
            if (statusEl) task.status = statusEl.value;
            const priorityEl = document.getElementById('yazilim-priority-' + taskId);
            if (priorityEl) task.priority = priorityEl.value;
            const spentEl = document.getElementById('yazilim-spent-' + taskId);
            if (spentEl) task.spentMinutes = Math.max(0, parseInt(spentEl.value) || 0);
            task.checklist.forEach(c => {
                const el = document.getElementById(`yazilim-check-text-${taskId}-${c.id}`);
                if (el) c.text = el.value;
            });
        }

        function harvestAllOpenYazilimTaskForms() {
            yazilimTasks.forEach(t => { if (!t.saved) harvestYazilimTaskForm(t.id); });
        }

        function addYazilimChecklistItem(taskId) {
            const task = yazilimTasks.find(t => t.id === taskId);
            if (!task) return;
            harvestYazilimTaskForm(taskId);
            task.checklist.push({ id: yazilimChecklistIdCounter++, text: '', done: false });
            renderYazilim();
        }

        function removeYazilimChecklistItem(taskId, itemId) {
            const task = yazilimTasks.find(t => t.id === taskId);
            if (!task) return;
            harvestYazilimTaskForm(taskId);
            task.checklist = task.checklist.filter(c => c.id !== itemId);
            renderYazilim();
        }

        function toggleYazilimChecklistItem(taskId, itemId) {
            const task = yazilimTasks.find(t => t.id === taskId);
            if (!task) return;
            const item = task.checklist.find(c => c.id === itemId);
            if (!item) return;
            item.done = !item.done;
            renderYazilim();
        }

        function saveYazilimTask(taskId) {
            harvestYazilimTaskForm(taskId);
            const task = yazilimTasks.find(t => t.id === taskId);
            if (!task) return;
            task.saved = true;
            renderYazilim();
        }

        function editYazilimTask(taskId) {
            const task = yazilimTasks.find(t => t.id === taskId);
            if (!task) return;
            task.saved = false;
            renderYazilim();
        }

        function renderYazilimTaskEditForm(task) {
            const checklistHtml = task.checklist.map((c, idx) => `
                <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
                    <input type="checkbox" ${c.done ? 'checked' : ''} onchange="toggleYazilimChecklistItem(${task.id}, ${c.id})">
                    <input type="text" id="yazilim-check-text-${task.id}-${c.id}" value="${(c.text || '').replace(/"/g, '&quot;')}" placeholder="Yapılacak adım ${idx + 1}" style="flex:1; background:#121212; border:1px solid var(--border-color); color:var(--text-main); padding:5px 8px; border-radius:4px; font-size:0.8rem;">
                    <button class="btn-action" style="color:var(--accent-red); padding:2px 8px;" onclick="removeYazilimChecklistItem(${task.id}, ${c.id})">✕</button>
                </div>
            `).join('');

            return `
            <div class="prayer-card">
                <strong>🛠️ ${task.name} <span style="font-size:0.8rem; color:var(--text-muted);">(düzenleniyor)</span></strong>
                <div class="form-row" style="margin-top:8px;">
                    <select id="yazilim-status-${task.id}">
                        <option value="Planlandı" ${task.status === 'Planlandı' ? 'selected' : ''}>Planlandı</option>
                        <option value="Devam Ediyor" ${task.status === 'Devam Ediyor' ? 'selected' : ''}>Devam Ediyor</option>
                        <option value="Tamamlandı" ${task.status === 'Tamamlandı' ? 'selected' : ''}>Tamamlandı</option>
                    </select>
                    <input type="text" id="yazilim-stack-${task.id}" value="${(task.techStack || '').replace(/"/g, '&quot;')}" placeholder="Teknoloji/Araçlar (örn: React, Node.js)">
                </div>
                <div class="form-row">
                    <select id="yazilim-priority-${task.id}">
                        <option value="Yüksek" ${task.priority === 'Yüksek' ? 'selected' : ''}>Öncelik: Yüksek</option>
                        <option value="Orta" ${task.priority === 'Orta' ? 'selected' : ''}>Öncelik: Orta</option>
                        <option value="Düşük" ${task.priority === 'Düşük' ? 'selected' : ''}>Öncelik: Düşük</option>
                    </select>
                    <input type="number" id="yazilim-spent-${task.id}" min="0" value="${task.spentMinutes || ''}" placeholder="Harcanan süre (dakika)">
                </div>
                <label style="font-size:0.8rem; color:var(--text-muted);">Açıklama / Notlar</label>
                <textarea class="prayer-note" id="yazilim-desc-${task.id}" placeholder="Bu görevde neler yapılacak...">${(task.description || '').replace(/</g, '&lt;')}</textarea>
                <h4 style="font-size:0.85rem; color:var(--text-muted); margin:12px 0 4px 0;">Yapılacaklar Listesi</h4>
                ${checklistHtml || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz adım eklenmedi.</span>'}
                <button class="btn-action" style="margin-top:8px;" onclick="addYazilimChecklistItem(${task.id})">+ Adım Ekle</button>
                <button class="btn-action btn-primary" style="margin-top:10px;" onclick="saveYazilimTask(${task.id})">Kaydet</button>
            </div>`;
        }

        function renderYazilimTaskSummary(task) {
            const statusColor = task.status === 'Tamamlandı' ? 'var(--accent-green)' : (task.status === 'Devam Ediyor' ? 'var(--accent-gold)' : 'var(--text-muted)');
            const doneCount = task.checklist.filter(c => c.done && c.text.trim()).length;
            const totalCount = task.checklist.filter(c => c.text.trim()).length;
            const checklistHtml = task.checklist.filter(c => c.text.trim()).map(c => `
                <div style="display:flex; align-items:center; gap:6px; font-size:0.8rem; margin-top:3px;">
                    <input type="checkbox" ${c.done ? 'checked' : ''} onchange="toggleYazilimChecklistItem(${task.id}, ${c.id})">
                    <span style="${c.done ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${c.text.replace(/</g, '&lt;')}</span>
                </div>
            `).join('');

            return `
            <div class="prayer-card">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <strong>🛠️ ${task.name}</strong>
                    <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                        <span class="category-tag" style="border-color:${statusColor}; color:${statusColor};">${task.status}</span>
                        <button class="btn-action" onclick="editYazilimTask(${task.id})">Düzenle</button>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="removeYazilimTask(${task.id})">Sil</button>
                    </div>
                </div>
                ${task.techStack ? `<div style="font-size:0.8rem; color:var(--text-muted);">Teknoloji: ${task.techStack.replace(/</g, '&lt;')}</div>` : ''}
                <div class="yazilim-task-meta"><span class="category-tag">Öncelik: ${task.priority || 'Orta'}</span>${task.spentMinutes ? `<span>⏱️ ${task.spentMinutes} dk</span>` : ''}</div>
                ${task.description ? `<div style="font-size:0.85rem; margin-top:4px;">${task.description.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</div>` : ''}
                ${totalCount ? `<div style="font-size:0.8rem; color:var(--text-muted); margin-top:8px;">İlerleme: ${doneCount}/${totalCount} adım tamamlandı</div>` : ''}
                <div style="margin-top:4px;">${checklistHtml}</div>
            </div>`;
        }

        function renderYazilimTaskCard(task) {
            return task.saved ? renderYazilimTaskSummary(task) : renderYazilimTaskEditForm(task);
        }

        function renderYazilimProjectCard(project) {
            ensureYazilimProjectMeta(project);
            const filters = yazilimFilters();
            const tasks = yazilimTasks.filter(t => t.projectId === project.id && matchesYazilimTask(t, filters));
            return `
            <div class="prayer-card" style="border-color:var(--accent-blue);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>📁 ${project.name}</strong>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeYazilimProject(${project.id})">Projeyi Sil</button>
                </div>
                <div class="yazilim-project-meta">
                    <select id="yazilim-project-status-${project.id}">
                        <option value="Planlandı" ${project.status === 'Planlandı' ? 'selected' : ''}>Planlandı</option>
                        <option value="Devam Ediyor" ${project.status === 'Devam Ediyor' ? 'selected' : ''}>Devam Ediyor</option>
                        <option value="Tamamlandı" ${project.status === 'Tamamlandı' ? 'selected' : ''}>Tamamlandı</option>
                    </select>
                    <input type="number" id="yazilim-project-progress-${project.id}" min="0" max="100" value="${project.progress}" placeholder="İlerleme %">
                    <input type="date" id="yazilim-project-deadline-${project.id}" value="${project.deadline}" aria-label="Son teslim tarihi">
                    <input type="url" id="yazilim-project-repo-${project.id}" value="${project.repoUrl.replace(/"/g, '&quot;')}" placeholder="GitHub / proje bağlantısı">
                    <textarea class="wide" id="yazilim-project-notes-${project.id}" placeholder="Proje notları...">${project.notes.replace(/</g, '&lt;')}</textarea>
                    <textarea class="wide" id="yazilim-project-decisions-${project.id}" placeholder="Teknik karar günlüğü (her satıra bir karar)...">${project.decisions.join('\n').replace(/</g, '&lt;')}</textarea>
                </div>
                <button class="btn-action btn-primary" style="margin-top:6px;" onclick="saveYazilimProjectMeta(${project.id})">Proje Bilgilerini Kaydet</button>
                <div class="yazilim-task-meta"><span class="category-tag">${project.status}</span><span>İlerleme: ${project.progress}%</span>${project.deadline ? `<span>Son tarih: ${project.deadline}</span>` : ''}${project.repoUrl ? `<a href="${project.repoUrl.replace(/"/g, '&quot;')}" target="_blank" rel="noopener">🔗 Proje bağlantısı</a>` : ''}</div>
                <div class="form-row">
                    <input type="text" id="new-yazilim-task-${project.id}" placeholder="Görev adı (örn: Giriş Ekranı, Veritabanı Bağlantısı)">
                    <button class="btn-action btn-primary" onclick="addYazilimTask(${project.id})">+ Görev Ekle</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${tasks.length ? tasks.map(renderYazilimTaskCard).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz görev eklenmedi.</span>'}
                </div>
            </div>`;
        }

        function renderYazilimCategoryCard(category) {
            const filters = yazilimFilters();
            const projects = yazilimProjects.filter(p => p.categoryId === category.id && matchesYazilimProject(p, filters));
            return `
            <div class="prayer-card" style="border-color:var(--accent-gold);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>💻 ${category.name}</strong>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeYazilimCategory(${category.id})">Kategoriyi Sil</button>
                </div>
                <div class="form-row">
                    <input type="text" id="new-yazilim-project-${category.id}" placeholder="Proje adı (örn: Stok Takip Uygulaması)">
                    <button class="btn-action btn-primary" onclick="addYazilimProject(${category.id})">+ Proje Ekle</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    ${projects.length ? projects.map(renderYazilimProjectCard).join('') : '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz proje eklenmedi.</span>'}
                </div>
            </div>`;
        }

        function renderYazilim() {
            harvestAllOpenYazilimTaskForms();
            yazilimProjects.forEach(ensureYazilimProjectMeta);
            yazilimTasks.forEach(task => {
                if (!task.priority) task.priority = 'Orta';
                if (typeof task.spentMinutes !== 'number') task.spentMinutes = 0;
            });
            const wrap = document.getElementById('yazilim-categories-list');
            wrap.innerHTML = yazilimCategories.length
                ? yazilimCategories.map(renderYazilimCategoryCard).join('')
                : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz kategori eklenmedi.</span>';
            document.getElementById('yazilim-count').innerText = yazilimCategories.length + ' kategori';
        }

        // Tüm render fonksiyonları çalıştığında (yani her ekleme/silme/düzenleme/kaydetme işleminden sonra)
        // güncel veriyi otomatik olarak kalıcı depoya yazacak şekilde sarmalıyoruz.
            ['renderTabCard','renderKiraathane','renderCategories','renderCategoryOptions','renderRecipes','renderLangCategories','renderLangCategoryOptions','renderLangItems','renderCombatCategories','renderCombatCategoryOptions','renderCombatItems','renderInstrumentCategories','renderInstrumentCategoryOptions','renderInstrumentItems','renderFitnessCategories','renderFitnessCategoryOptions','renderFitnessItems','renderIbadet','renderTekstilCategories','renderTekstilCategoryOptions','renderTekstilProductCard','renderTekstil','renderAracCategoryTags','renderAracItemCard','renderAracList','renderAracCategorySummary','renderArac','renderEtTypeTags','renderEtMachines','renderEtSummary','renderEtSalesList','renderEt','renderManavTypeTags','renderManavSummary','renderManavSalesList','renderManav','renderSutTypeTags','renderSutSummary','renderSutSalesList','renderSut','renderKpssQuiz','renderKpssUnitEditForm','renderKpssUnitSummary','renderKpssUnitCard','renderKpssTopicCard','renderKpssSubjectCard','renderKpss','renderYksQuiz','renderYksUnitEditForm','renderYksUnitSummary','renderYksUnitCard','renderYksTopicCard','renderYksSubjectCard','renderYks','renderBlogReadingView','renderBlogEditForm','renderBlogSummary','renderBlog','renderTarlaList','renderHasatList','renderSulamaList','renderTohumTypeTags','renderTohumSummary','renderBelgeList','renderHavaList','renderTarim','renderCariCustomerOptions','renderCariCustomerList','renderCari','renderTeknolojiCategoryTags','renderTeknolojiItemCard','renderTeknolojiList','renderTeknolojiCategorySummary','renderTeknoloji','renderYazilimTaskEditForm','renderYazilimTaskSummary','renderYazilimTaskCard','renderYazilimProjectCard','renderYazilimCategoryCard','renderYazilim','renderYatirimCategoryTags','renderYatirimItemCard','renderYatirimList','renderYatirim','renderGayrimenkul','renderTasarimCategories','renderTasarimCategoryOptions','renderTasarim','renderScheduleCard','renderSchedule','renderBooks'].forEach(function(fnName) {
            const original = window[fnName];
            if (typeof original === 'function') {
                window[fnName] = function() {
                    const result = original.apply(this, arguments);
                    scheduleSave();
                    return result;
                };
            }
        });

