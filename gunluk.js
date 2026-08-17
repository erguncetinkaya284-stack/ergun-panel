        // ================= GÜNLÜK PROGRAM (SAATLİK) =================
        // ================= GÜNLÜK PROGRAM & ALIŞKANLIK TAKİBİ (birleşik) =================
        let scheduleItems = []; // {id, time (opsiyonel 'HH:MM' ya da ''), name, target, log: {'YYYY-MM-DD': count}}
        let scheduleIdCounter = 1;
        let editingScheduleId = null;
        let scheduleViewMode = 'list'; // 'list' | 'table'

        // Eski (ayrı) modüllerden kalan verileri (varsa) tek listeye taşır — bir kereye mahsus çalışır
        function migrateLegacySchedule() {
            if (scheduleItems.length > 0) return;
            const hasLegacy = (typeof programItems !== 'undefined' && programItems.length) ||
                               (typeof habits !== 'undefined' && habits.length);
            if (!hasLegacy) return;

            (programItems || []).forEach(p => {
                scheduleItems.push({
                    id: scheduleIdCounter++,
                    time: p.time || '',
                    name: p.task,
                    target: 1,
                    log: p.doneDate ? { [p.doneDate]: 1 } : {}
                });
            });
            (habits || []).forEach(h => {
                scheduleItems.push({
                    id: scheduleIdCounter++,
                    time: '',
                    name: h.name,
                    target: h.target || 1,
                    log: h.log || {}
                });
            });

            programItems = [];
            habits = [];
        }

        function dateKeyFromDate(d) {
            return d.toISOString().slice(0, 10);
        }

        function computeScheduleStreak(item) {
            let streak = 0;
            const cursor = new Date();
            const todayKey = dateKeyFromDate(cursor);
            if ((item.log[todayKey] || 0) < item.target) {
                // Bugün henüz tamamlanmadı — bugünden değil dünden geriye say (streak henüz bozulmadı)
                cursor.setDate(cursor.getDate() - 1);
            }
            while ((item.log[dateKeyFromDate(cursor)] || 0) >= item.target) {
                streak++;
                cursor.setDate(cursor.getDate() - 1);
            }
            return streak;
        }

        // Diğer modüllerdeki bir kaydı tek tıkla Günlük Program'a alışkanlık olarak ekler.
        // Aynı isim zaten varsa tekrar eklemez, sadece kullanıcıyı bilgilendirir.
        function addToDailyProgram(name) {
            if (!name) return;
            const exists = scheduleItems.some(i => i.name === name);
            if (exists) {
                alert(`"${name}" zaten Günlük Program'da var.`);
                return;
            }
            scheduleItems.push({ id: scheduleIdCounter++, time: '', name, target: 1, log: {} });
            renderSchedule();
            scheduleSave();
            alert(`"${name}" Günlük Program'a eklendi. 🔥`);
        }

        function saveScheduleItem() {
            const time = document.getElementById('schedule-time').value;
            const name = document.getElementById('schedule-name').value.trim();
            const target = parseInt(document.getElementById('schedule-target').value) || 1;
            const challengeTarget = parseInt(document.getElementById('schedule-challenge').value) || 0;

            if (!name) { alert('Ne olduğunu yazmalısın.'); return; }

            if (editingScheduleId !== null) {
                const item = scheduleItems.find(i => i.id === editingScheduleId);
                if (item) {
                    item.time = time;
                    item.name = name;
                    item.target = Math.max(1, target);
                    item.challengeTarget = Math.max(0, challengeTarget);
                    if (!item.challengeLog) item.challengeLog = {};
                }
                editingScheduleId = null;
                document.getElementById('schedule-save-btn').innerText = 'Kaydet';
            } else {
                scheduleItems.push({ id: scheduleIdCounter++, time, name, target: Math.max(1, target), log: {}, challengeTarget: Math.max(0, challengeTarget), challengeLog: {} });
            }

            document.getElementById('schedule-time').value = '';
            document.getElementById('schedule-name').value = '';
            document.getElementById('schedule-target').value = '1';
            document.getElementById('schedule-challenge').value = '';
            renderSchedule();
            scheduleSave();
        }

        function editScheduleItem(id) {
            const item = scheduleItems.find(i => i.id === id);
            if (!item) return;
            document.getElementById('schedule-time').value = item.time || '';
            document.getElementById('schedule-name').value = item.name;
            document.getElementById('schedule-target').value = item.target;
            document.getElementById('schedule-challenge').value = item.challengeTarget || '';
            editingScheduleId = id;
            document.getElementById('schedule-save-btn').innerText = 'Güncelle';
            document.getElementById('schedule-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Meydan okumada bir gün satırının + tuşuna basınca o günü tamamlanmış işaretler,
        // tekrar basınca geri alır (yanlışlıkla basılırsa diye).
        function toggleChallengeDay(id, dayNumber) {
            const item = scheduleItems.find(i => i.id === id);
            if (!item) return;
            if (!item.challengeLog) item.challengeLog = {};
            if (item.challengeLog[dayNumber]) {
                delete item.challengeLog[dayNumber];
            } else {
                item.challengeLog[dayNumber] = todayStr();
            }
            renderSchedule();
            scheduleSave();
        }

        function deleteScheduleItem(id) {
            if (!confirm('Bu madde silinecek. Emin misin?')) return;
            scheduleItems = scheduleItems.filter(i => i.id !== id);
            if (editingScheduleId === id) {
                editingScheduleId = null;
                document.getElementById('schedule-save-btn').innerText = 'Kaydet';
            }
            renderSchedule();
            scheduleSave();
        }

        function changeScheduleCount(id, delta, dateStr) {
            const item = scheduleItems.find(i => i.id === id);
            if (!item) return;
            const day = dateStr || todayStr();
            const current = item.log[day] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                delete item.log[day];
            } else {
                item.log[day] = next;
            }
            renderSchedule();
            scheduleSave();
        }

        function renameScheduleItem(id, newName) {
            const item = scheduleItems.find(i => i.id === id);
            if (!item) return;
            const clean = newName.replace(/^🕐\s*[\d:]+\s*/, '').trim();
            if (clean && clean !== item.name) {
                item.name = clean;
                scheduleSave();
            }
        }

        function retargetScheduleItem(id, newTarget) {
            const item = scheduleItems.find(i => i.id === id);
            if (!item) return;
            const val = Math.max(1, parseInt(newTarget) || 1);
            if (val !== item.target) {
                item.target = val;
                renderSchedule();
                scheduleSave();
            }
        }

        function toggleScheduleView() {
            scheduleViewMode = scheduleViewMode === 'list' ? 'table' : 'list';
            renderSchedule();
            scheduleSave();
        }

        // Diğer modüllerdeki kayıtlı başlıkları toplayıp "modülden seç" listesi olarak sunar
        function getScheduleSourceGroups() {
            const groups = [];
            const addGroup = (label, arr, field) => {
                if (typeof arr !== 'undefined' && arr && arr.length) {
                    const names = arr.map(item => item[field]).filter(v => v && v.trim());
                    if (names.length) groups.push({ label, items: names });
                }
            };

            addGroup('Fitness', typeof fitnessItems !== 'undefined' ? fitnessItems : null, 'title');
            addGroup('Spor', typeof sporItems !== 'undefined' ? sporItems : null, 'title');
            addGroup('Dövüş/Teknik', typeof combatItems !== 'undefined' ? combatItems : null, 'title');
            addGroup('KPSS', typeof kpssUnits !== 'undefined' ? kpssUnits : null, 'name');
            addGroup('YKS', typeof yksUnits !== 'undefined' ? yksUnits : null, 'name');
            addGroup('Yabancı Dil', typeof langItems !== 'undefined' ? langItems : null, 'title');
            addGroup('Tarif Defteri', typeof recipes !== 'undefined' ? recipes : null, 'title');
            addGroup('Enstrüman', typeof instrumentItems !== 'undefined' ? instrumentItems : null, 'title');
            addGroup('Tasarım', typeof tasarimItems !== 'undefined' ? tasarimItems : null, 'title');
            addGroup('Kitap', typeof books !== 'undefined' ? books : null, 'title');

            return groups;
        }

        function renderScheduleSourceSelect() {
            const select = document.getElementById('schedule-source-select');
            if (!select) return;
            const groups = getScheduleSourceGroups();

            if (!groups.length) {
                select.innerHTML = '<option value="">Henüz başka modülde kayıt yok — elle yazabilirsin</option>';
                return;
            }

            select.innerHTML = '<option value="">Ya da başka bir modülden seç...</option>' + groups.map(g => `
                <optgroup label="${g.label}">
                    ${g.items.map(item => `<option value="${item.replace(/"/g, '&quot;')}">${item}</option>`).join('')}
                </optgroup>
            `).join('');
        }

        function applyScheduleSourceSelection() {
            const select = document.getElementById('schedule-source-select');
            if (!select || !select.value) return;
            document.getElementById('schedule-name').value = select.value;
            select.value = '';
        }

        function renderScheduleCard(item) {
            const today = todayStr();
            const todayCount = item.log[today] || 0;
            const streak = computeScheduleStreak(item);
            const metToday = todayCount >= item.target;
            const timeLabel = item.time ? `🕐 ${item.time} — ` : '';

            let challengeHtml = '';
            if (item.challengeTarget && item.challengeTarget > 0) {
                const log = item.challengeLog || {};
                const doneCount = Object.keys(log).length;
                const finished = doneCount >= item.challengeTarget;
                const rows = [];
                for (let d = 1; d <= item.challengeTarget; d++) {
                    const done = !!log[d];
                    rows.push(`
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 8px; ${done ? 'background:rgba(46,204,113,0.1);' : ''} border-radius:6px;">
                            <span style="font-size:0.85rem; ${done ? 'color:var(--accent-green);' : ''}">${d}. gün</span>
                            <button class="btn-ctrl ${done ? 'btn-minus' : 'btn-plus'}" style="min-width:32px;" onclick="toggleChallengeDay(${item.id}, ${d})">${done ? '✓' : '+'}</button>
                        </div>`);
                }
                challengeHtml = `
                <div style="margin-top:10px; border-top:1px solid var(--border-color); padding-top:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="font-size:0.85rem; font-weight:600;">🏆 Meydan Okuma</span>
                        <span style="font-size:0.85rem; color:${finished ? 'var(--accent-green)' : 'var(--text-muted)'};">${finished ? '🎉 Tamamlandı! ' : ''}${doneCount} / ${item.challengeTarget} gün</span>
                    </div>
                    <div style="max-height:220px; overflow-y:auto; display:flex; flex-direction:column; gap:2px;">
                        ${rows.join('')}
                    </div>
                </div>`;
            }

            return `
            <div class="prayer-card ${metToday ? 'done-today' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <strong>${timeLabel}${item.name}</strong>
                    <span class="category-tag" style="background:rgba(241,196,15,0.15); border-color:rgba(241,196,15,0.4); color:var(--accent-gold);">🔥 ${streak} gün</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:6px;">
                    <span style="font-size:0.85rem; color:var(--text-muted);">Bugün: ${todayCount} / ${item.target}</span>
                    <div class="counter-group">
                        <button class="btn-ctrl btn-minus" onclick="changeScheduleCount(${item.id}, -1)">-</button>
                        <span class="counter-value">${todayCount}</span>
                        <button class="btn-ctrl btn-plus" onclick="changeScheduleCount(${item.id}, 1)">+</button>
                    </div>
                </div>
                ${challengeHtml}
                <div class="recipe-actions" style="margin-top:8px;">
                    <button class="btn-action" onclick="editScheduleItem(${item.id})">Düzenle</button>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="deleteScheduleItem(${item.id})">Sil</button>
                </div>
            </div>`;
        }

        function renderSchedule() {
            renderScheduleSourceSelect();

            const listSection = document.getElementById('schedule-list-section');
            const tableWrap = document.getElementById('schedule-table-wrap');
            const toggleBtn = document.getElementById('schedule-view-toggle');
            const today = todayStr();

            document.getElementById('schedule-count').innerText = scheduleItems.length + ' madde';

            if (scheduleViewMode === 'table') {
                listSection.style.display = 'none';
                tableWrap.style.display = 'block';
                toggleBtn.innerText = '📋 Liste Görünümü';
            } else {
                listSection.style.display = 'block';
                tableWrap.style.display = 'none';
                toggleBtn.innerText = '📊 Çizelge Görünümü';
            }

            const timed = scheduleItems.filter(i => i.time).sort((a, b) => a.time.localeCompare(b.time));
            const untimed = scheduleItems.filter(i => !i.time).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

            document.getElementById('schedule-timed-list').innerHTML = timed.length
                ? timed.map(renderScheduleCard).join('')
                : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz saatli madde eklenmedi.</span>';

            document.getElementById('schedule-untimed-list').innerHTML = untimed.length
                ? untimed.map(renderScheduleCard).join('')
                : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz saatsiz alışkanlık eklenmedi.</span>';

            if (scheduleViewMode === 'table') {
                const all = [...timed, ...untimed];

                // Son 7 gün (bugün dahil, en solda en eski gün)
                const days = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    days.push(dateKeyFromDate(d));
                }
                const dayLabels = days.map(d => {
                    const dt = new Date(d + 'T00:00:00');
                    return dt.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', weekday: 'short' });
                });

                const rowsHtml = all.map(i => {
                    const streak = computeScheduleStreak(i);
                    const dayCells = days.map(dayKey => {
                        const count = i.log[dayKey] || 0;
                        const met = count >= i.target;
                        const isToday = dayKey === today;
                        return `
                        <td class="excel-cell ${met ? 'excel-cell-done' : ''}" style="text-align:center; cursor:pointer; ${isToday ? 'outline:2px solid var(--accent-blue); outline-offset:-2px;' : ''}"
                            onclick="changeScheduleCount(${i.id}, 1, '${dayKey}')"
                            oncontextmenu="event.preventDefault(); changeScheduleCount(${i.id}, -1, '${dayKey}');"
                            title="Sol tık: +1, Sağ tık: -1">
                            ${count > 0 ? (i.target > 1 ? `${count}/${i.target}` : '✓') : ''}
                        </td>`;
                    }).join('');

                    return `
                    <tr>
                        <td style="white-space:nowrap;" contenteditable="true" onblur="renameScheduleItem(${i.id}, this.innerText)">${i.time ? `🕐 ${i.time} ` : ''}${i.name}</td>
                        <td style="text-align:center; white-space:nowrap;" contenteditable="true" onblur="retargetScheduleItem(${i.id}, this.innerText)">${i.target}</td>
                        ${dayCells}
                        <td style="text-align:center;">🔥 ${streak}</td>
                        <td style="white-space:nowrap;">
                            <button class="btn-action" style="padding:3px 8px; font-size:0.75rem;" onclick="editScheduleItem(${i.id})">Düzenle</button>
                            <button class="btn-action" style="padding:3px 8px; font-size:0.75rem; color:var(--accent-red)" onclick="deleteScheduleItem(${i.id})">Sil</button>
                        </td>
                    </tr>`;
                }).join('');

                tableWrap.innerHTML = all.length ? `
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:6px;">Hücreye sol tık: +1 işaretle &nbsp;|&nbsp; sağ tık: -1 geri al &nbsp;|&nbsp; Ad/Hedef hücrelerini doğrudan tıklayıp düzenleyebilirsin (Excel gibi).</div>
                    <div style="overflow-x:auto;">
                    <table class="excel-table">
                        <thead>
                            <tr>
                                <th>Ad</th>
                                <th style="width:60px;">Hedef</th>
                                ${dayLabels.map(l => `<th style="width:64px; text-align:center; font-size:0.7rem;">${l}</th>`).join('')}
                                <th style="width:70px; text-align:center;">Streak</th>
                                <th style="width:150px;">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                    </div>` : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz madde eklenmedi.</span>';
            }
        }



        // Sayfa ilk açıldığında kasayı hesapla ve tüm modülleri başlat
