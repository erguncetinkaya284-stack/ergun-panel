        // ================= BLOG (Ana Başlık -> numaralı Alt Başlık -> açıklama) =================
        // blog_icerik_prompti.txt yapısına göre: her Ana Başlık bir giriş metni +
        // numaralandırılmış alt başlık listesi içerir. Alt başlıkların açıklaması
        // (blog metni) talep üzerine tek tek doldurulur. Tamamlanan her parça ayrı
        // bir .txt dosyası olarak indirilebilir, ya da tüm konu tek seferde .zip
        // olarak indirilebilir.
        let blogTopics = []; // {id, title, giris, altBasliklar:[{id, baslik, aciklama}]}
        let blogTopicIdCounter = 1;
        let blogAltIdCounter = 1;
        let blogUndoStack = [];
        let blogOpenTopicId = null;

        function ensureBlogTopicMeta(topic) {
            if (!topic.status) topic.status = 'Taslak';
            if (!topic.category) topic.category = '';
            if (!Array.isArray(topic.tags)) topic.tags = [];
            if (typeof topic.favorite !== 'boolean') topic.favorite = false;
            if (typeof topic.readingMinutes !== 'number') topic.readingMinutes = 0;
        }

        function renderBlogMarkdown(value) {
            const escaped = String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            return escaped
                .replace(/^### (.+)$/gm, '<strong>$1</strong>')
                .replace(/^## (.+)$/gm, '<strong>$1</strong>')
                .replace(/^# (.+)$/gm, '<strong>$1</strong>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/`(.+?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        }

        function isBlogTopicComplete(topic) {
            return !!topic.giris.trim()
                && topic.altBasliklar.length > 0
                && topic.altBasliklar.every(alt => alt.aciklama.trim());
        }

        function snapshotBlog() {
            blogUndoStack.push(JSON.stringify({ blogTopics }));
            if (blogUndoStack.length > 30) blogUndoStack.shift();
        }

        function undoBlogAction() {
            if (!blogUndoStack.length) { alert('Geri alınacak işlem yok.'); return; }
            const prev = JSON.parse(blogUndoStack.pop());
            blogTopics = prev.blogTopics;
            renderBlog();
        }

        function slugify(text) {
            return (text || '')
                .toLocaleLowerCase('tr-TR')
                .replace(/[^a-zçğıöşü0-9]+/gi, '')
                .slice(0, 30) || 'konu';
        }

        function findBlogTopic(topicId) {
            return blogTopics.find(t => t.id === topicId);
        }

        function addBlogTopic() {
            const input = document.getElementById('new-blog-title');
            const title = input.value.trim();
            if (!title) { alert('Ana Başlık boş olamaz.'); return; }
            const category = document.getElementById('new-blog-category').value;
            const tags = document.getElementById('new-blog-tags').value.split(',').map(tag => tag.trim()).filter(Boolean);
            const status = document.getElementById('new-blog-status').value;
            const readingMinutes = Math.max(0, parseInt(document.getElementById('new-blog-reading-minutes').value) || 0);
            snapshotBlog();
            blogTopics.push({ id: blogTopicIdCounter++, title, giris: '', altBasliklar: [], category, tags, status, favorite: false, readingMinutes });
            input.value = '';
            document.getElementById('new-blog-category').value = '';
            document.getElementById('new-blog-tags').value = '';
            document.getElementById('new-blog-status').value = 'Taslak';
            document.getElementById('new-blog-reading-minutes').value = '';
            renderBlog();
        }

        function removeBlogTopic(topicId) {
            if (!confirm('Bu Ana Başlık ve tüm alt başlıkları silinecek. Emin misin?')) return;
            snapshotBlog();
            blogTopics = blogTopics.filter(t => t.id !== topicId);
            if (blogOpenTopicId === topicId) blogOpenTopicId = null;
            renderBlog();
        }

        function toggleBlogTopicOpen(topicId) {
            blogOpenTopicId = (blogOpenTopicId === topicId) ? null : topicId;
            renderBlog();
        }

        function toggleBlogFavorite(topicId) {
            const topic = findBlogTopic(topicId);
            if (!topic) return;
            snapshotBlog();
            ensureBlogTopicMeta(topic);
            topic.favorite = !topic.favorite;
            renderBlog();
        }

        function saveBlogTopicMeta(topicId) {
            const topic = findBlogTopic(topicId);
            if (!topic) return;
            const category = document.getElementById('blog-category-' + topicId);
            const tags = document.getElementById('blog-tags-' + topicId);
            const status = document.getElementById('blog-status-' + topicId);
            const readingMinutes = document.getElementById('blog-reading-minutes-' + topicId);
            if (!category || !tags || !status || !readingMinutes) return;
            snapshotBlog();
            topic.category = category.value;
            topic.tags = tags.value.split(',').map(tag => tag.trim()).filter(Boolean);
            topic.status = status.value;
            topic.readingMinutes = Math.max(0, parseInt(readingMinutes.value) || 0);
            renderBlog();
        }

        function renderBlogFilterOptions() {
            const select = document.getElementById('blog-filter-category');
            if (!select) return;
            const selected = select.value;
            const categories = [...new Set(blogTopics.map(topic => {
                ensureBlogTopicMeta(topic);
                return topic.category;
            }).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));
            select.innerHTML = '<option value="all">Tüm kategoriler</option>' + categories.map(category => `<option value="${category.replace(/"/g, '&quot;')}">${category}</option>`).join('');
            select.value = categories.includes(selected) ? selected : 'all';
        }

        function saveBlogGiris(topicId) {
            const topic = findBlogTopic(topicId);
            if (!topic) return;
            const el = document.getElementById('blog-giris-' + topicId);
            if (!el) return;
            snapshotBlog();
            topic.giris = el.value;
            renderBlog();
        }

        // Alt başlıkları toplu ekler: textarea'ya her satıra bir başlık yapıştırılır
        // (AI'ın ürettiği "1.1, 1.2, ... 1.100" listesi gibi düşünülebilir).
        function bulkAddAltBasliklar(topicId) {
            const topic = findBlogTopic(topicId);
            if (!topic) return;
            const el = document.getElementById('blog-bulk-alt-' + topicId);
            if (!el) return;
            const lines = el.value.split('\n')
                .map(l => l.replace(/^\s*\d+[\.\):]?\s*/, '').trim()) // baştaki "1.", "2)" gibi numaraları temizle
                .filter(l => l.length > 0);
            if (!lines.length) { alert('En az bir alt başlık satırı gir.'); return; }
            snapshotBlog();
            lines.forEach(baslik => {
                topic.altBasliklar.push({ id: blogAltIdCounter++, baslik, aciklama: '' });
            });
            el.value = '';
            renderBlog();
        }

        function removeAltBaslik(topicId, altId) {
            const topic = findBlogTopic(topicId);
            if (!topic) return;
            snapshotBlog();
            topic.altBasliklar = topic.altBasliklar.filter(a => a.id !== altId);
            renderBlog();
        }

        function saveAltAciklama(topicId, altId) {
            const topic = findBlogTopic(topicId);
            if (!topic) return;
            const alt = topic.altBasliklar.find(a => a.id === altId);
            if (!alt) return;
            const el = document.getElementById(`blog-alt-aciklama-${topicId}-${altId}`);
            if (!el) return;
            snapshotBlog();
            alt.aciklama = el.value;
            renderBlog();
        }

        function blogAltNo(topic, altId) {
            const topicNo = blogTopics.findIndex(t => t.id === topic.id) + 1;
            const altIndex = topic.altBasliklar.findIndex(a => a.id === altId) + 1;
            return `${topicNo}.${altIndex}`;
        }

        function downloadTextFile(filename, content) {
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function downloadBlogGiris(topicId) {
            const topic = findBlogTopic(topicId);
            if (!topic) return;
            if (!topic.giris.trim()) { alert('Önce giriş metnini yaz ve kaydet.'); return; }
            downloadTextFile(`${topic.title} giris.txt`, topic.giris);
        }

        function downloadBlogAlt(topicId, altId) {
            const topic = findBlogTopic(topicId);
            if (!topic) return;
            const alt = topic.altBasliklar.find(a => a.id === altId);
            if (!alt || !alt.aciklama.trim()) { alert('Önce bu alt başlığın açıklamasını yaz ve kaydet.'); return; }
            const no = blogAltNo(topic, altId);
            downloadTextFile(`${topic.title} ${no}.${slugify(alt.baslik)}.txt`, alt.aciklama);
        }

        // Tüm konuyu (giriş + tamamlanmış alt başlıklar) tek bir .zip dosyası olarak indirir.
        function downloadBlogTopicZip(topicId) {
            const topic = findBlogTopic(topicId);
            if (!topic) return;
            if (typeof JSZip === 'undefined') { alert('Zip kütüphanesi yüklenemedi, internet bağlantını kontrol et.'); return; }
            const zip = new JSZip();
            let fileCount = 0;
            if (topic.giris.trim()) {
                zip.file(`${topic.title} giris.txt`, topic.giris);
                fileCount++;
            }
            topic.altBasliklar.forEach(alt => {
                if (alt.aciklama.trim()) {
                    const no = blogAltNo(topic, alt.id);
                    zip.file(`${topic.title} ${no}.${slugify(alt.baslik)}.txt`, alt.aciklama);
                    fileCount++;
                }
            });
            if (!fileCount) { alert('İndirilecek doldurulmuş içerik yok (giriş veya en az bir alt başlık açıklaması gerekli).'); return; }
            zip.generateAsync({ type: 'blob' }).then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${topic.title}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }

        function renderBlog() {
            const wrap = document.getElementById('blog-list');
            const search = (document.getElementById('blog-search')?.value || '').trim().toLocaleLowerCase('tr-TR');
            const categoryFilter = document.getElementById('blog-filter-category')?.value || 'all';
            const statusFilter = document.getElementById('blog-filter-status')?.value || 'all';
            const favoriteFilter = document.getElementById('blog-filter-favorite')?.value || 'all';
            blogTopics.forEach(ensureBlogTopicMeta);
            renderBlogFilterOptions();
            const totalAlt = blogTopics.reduce((sum, t) => sum + t.altBasliklar.length, 0);
            document.getElementById('blog-count').innerText = `${blogTopics.length} ana başlık, ${totalAlt} alt başlık`;
            const completedCount = blogTopics.filter(isBlogTopicComplete).length;
            const draftCount = blogTopics.filter(topic => topic.status === 'Taslak').length;
            document.getElementById('blog-stats').innerHTML = `
                <div class="blog-stat"><strong>${blogTopics.length}</strong><span>Toplam yazı</span></div>
                <div class="blog-stat"><strong>${completedCount}</strong><span>Tamamlanan</span></div>
                <div class="blog-stat"><strong>${draftCount}</strong><span>Taslak</span></div>`;

            const visibleTopics = blogTopics.filter(topic => {
                const searchable = `${topic.title} ${topic.giris} ${topic.category} ${topic.tags.join(' ')} ${topic.altBasliklar.map(alt => `${alt.baslik} ${alt.aciklama}`).join(' ')}`.toLocaleLowerCase('tr-TR');
                return (!search || searchable.includes(search))
                    && (categoryFilter === 'all' || topic.category === categoryFilter)
                    && (statusFilter === 'all' || topic.status === statusFilter)
                    && (favoriteFilter !== 'favorites' || topic.favorite);
            });

            wrap.innerHTML = visibleTopics.length ? visibleTopics.map((topic) => {
                const idx = blogTopics.indexOf(topic);
                const topicNo = idx + 1;
                const tamamlanan = topic.altBasliklar.filter(a => a.aciklama.trim()).length;
                const toplam = topic.altBasliklar.length;
                const isOpen = blogOpenTopicId === topic.id;
                const tagsHtml = topic.tags.map(tag => `<span class="category-tag type-tag">${tag}</span>`).join('');
                const readingHtml = topic.readingMinutes ? `⏱️ ${topic.readingMinutes} dk okuma` : '⏱️ Okuma süresi belirtilmedi';

                const altRows = topic.altBasliklar.map(alt => {
                    const no = `${topicNo}.${topic.altBasliklar.indexOf(alt) + 1}`;
                    const done = !!alt.aciklama.trim();
                    return `
                    <div class="prayer-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                            <strong>${done ? '☑' : '☐'} ${no}. ${alt.baslik}</strong>
                            <div style="display:flex; gap:4px;">
                                <button class="btn-action" onclick="downloadBlogAlt(${topic.id}, ${alt.id})">📥</button>
                                <button class="btn-action" style="color:var(--accent-red)" onclick="removeAltBaslik(${topic.id}, ${alt.id})">Sil</button>
                            </div>
                        </div>
                        <textarea id="blog-alt-aciklama-${topic.id}-${alt.id}" rows="4" placeholder="Bu alt başlığın açıklaması (akıcı blog metni)..." style="width:100%; margin-top:6px;">${alt.aciklama}</textarea>
                        ${done ? `<div class="blog-markdown-preview">${renderBlogMarkdown(alt.aciklama)}</div>` : ''}
                        <button class="btn-action btn-primary" style="margin-top:6px;" onclick="saveAltAciklama(${topic.id}, ${alt.id})">Kaydet</button>
                    </div>`;
                }).join('') || '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz alt başlık eklenmedi.</span>';

                return `
                <div class="prayer-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                        <strong style="cursor:pointer;" onclick="toggleBlogTopicOpen(${topic.id})">${isOpen ? '▼' : '▶'} ${topicNo}. ${topic.title}</strong>
                        <div class="blog-topic-actions">
                            <span style="font-size:0.75rem; color:var(--text-muted);">${tamamlanan}/${toplam} tamamlandı</span>
                            <button class="btn-action blog-favorite" onclick="toggleBlogFavorite(${topic.id})" aria-label="Favori">${topic.favorite ? '★' : '☆'}</button>
                            <button class="btn-action" style="color:var(--accent-red)" onclick="removeBlogTopic(${topic.id})">Sil</button>
                        </div>
                    </div>
                    <div class="blog-topic-meta">
                        <span class="category-tag">${topic.status}</span>
                        ${topic.category ? `<span class="category-tag lang-tag">${topic.category}</span>` : ''}
                        ${tagsHtml}
                        <span style="font-size:0.75rem; color:var(--text-muted);">${readingHtml}</span>
                    </div>
                    ${isOpen ? `
                        <div style="margin-top:10px;">
                            <div class="blog-topic-form">
                                <select id="blog-category-${topic.id}">
                                    <option value="">Kategori yok</option>
                                    ${['Kişisel', 'Bilgi', 'Proje', 'Günlük'].map(value => `<option value="${value}" ${topic.category === value ? 'selected' : ''}>${value}</option>`).join('')}
                                </select>
                                <input type="text" id="blog-tags-${topic.id}" value="${topic.tags.join(', ').replace(/"/g, '&quot;')}" placeholder="Etiketler (virgülle ayır)">
                                <select id="blog-status-${topic.id}"><option value="Taslak" ${topic.status === 'Taslak' ? 'selected' : ''}>Taslak</option><option value="Yayında" ${topic.status === 'Yayında' ? 'selected' : ''}>Yayında</option></select>
                                <input type="number" id="blog-reading-minutes-${topic.id}" min="1" value="${topic.readingMinutes || ''}" placeholder="Okuma dk">
                            </div>
                            <button class="btn-action btn-primary" style="margin-top:6px;" onclick="saveBlogTopicMeta(${topic.id})">Yazı Bilgilerini Kaydet</button>
                            <h4 style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">Giriş Metni (3-5 cümle)</h4>
                            <textarea id="blog-giris-${topic.id}" rows="3" placeholder="Bu konunun genel tanıtımı, neden önemli olduğu, ne bulacağı..." style="width:100%;">${topic.giris}</textarea>
                            ${topic.giris.trim() ? `<div class="blog-markdown-preview"><strong>Giriş önizleme</strong><br>${renderBlogMarkdown(topic.giris)}</div>` : ''}
                            <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
                                <button class="btn-action btn-primary" onclick="saveBlogGiris(${topic.id})">Girişi Kaydet</button>
                                <button class="btn-action" onclick="downloadBlogGiris(${topic.id})">📥 Girişi İndir</button>
                                <button class="btn-action" onclick="downloadBlogTopicZip(${topic.id})">📦 Tümünü .zip İndir</button>
                                <button class="btn-action" onclick="addToDailyProgram('Blog: ${topic.title.replace(/'/g, "\\'")} - 30 dakika yazı yaz')">📅 30 dk Yazı Yaz</button>
                            </div>

                            <h4 style="font-size:0.8rem; color:var(--text-muted); margin:14px 0 4px 0;">Alt Başlık Toplu Ekle (her satıra bir başlık)</h4>
                            <textarea id="blog-bulk-alt-${topic.id}" rows="4" placeholder="Protein&#10;Karbonhidrat&#10;Yağlar&#10;..." style="width:100%;"></textarea>
                            <button class="btn-action btn-primary" style="margin-top:6px;" onclick="bulkAddAltBasliklar(${topic.id})">+ Alt Başlıkları Ekle</button>

                            <h4 style="font-size:0.8rem; color:var(--text-muted); margin:14px 0 6px 0;">Alt Başlıklar</h4>
                            <div style="display:flex; flex-direction:column; gap:8px;">${altRows}</div>
                        </div>
                    ` : ''}
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz Ana Başlık eklenmedi.</span>';
        }
