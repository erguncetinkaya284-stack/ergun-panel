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
            snapshotBlog();
            blogTopics.push({ id: blogTopicIdCounter++, title, giris: '', altBasliklar: [] });
            input.value = '';
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
            const totalAlt = blogTopics.reduce((sum, t) => sum + t.altBasliklar.length, 0);
            document.getElementById('blog-count').innerText = `${blogTopics.length} ana başlık, ${totalAlt} alt başlık`;

            wrap.innerHTML = blogTopics.length ? blogTopics.map((topic, idx) => {
                const topicNo = idx + 1;
                const tamamlanan = topic.altBasliklar.filter(a => a.aciklama.trim()).length;
                const toplam = topic.altBasliklar.length;
                const isOpen = blogOpenTopicId === topic.id;

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
                        <button class="btn-action btn-primary" style="margin-top:6px;" onclick="saveAltAciklama(${topic.id}, ${alt.id})">Kaydet</button>
                    </div>`;
                }).join('') || '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz alt başlık eklenmedi.</span>';

                return `
                <div class="prayer-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                        <strong style="cursor:pointer;" onclick="toggleBlogTopicOpen(${topic.id})">${isOpen ? '▼' : '▶'} ${topicNo}. ${topic.title}</strong>
                        <div style="display:flex; gap:4px; align-items:center;">
                            <span style="font-size:0.75rem; color:var(--text-muted);">${tamamlanan}/${toplam} tamamlandı</span>
                            <button class="btn-action" style="color:var(--accent-red)" onclick="removeBlogTopic(${topic.id})">Sil</button>
                        </div>
                    </div>
                    ${isOpen ? `
                        <div style="margin-top:10px;">
                            <h4 style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">Giriş Metni (3-5 cümle)</h4>
                            <textarea id="blog-giris-${topic.id}" rows="3" placeholder="Bu konunun genel tanıtımı, neden önemli olduğu, ne bulacağı..." style="width:100%;">${topic.giris}</textarea>
                            <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
                                <button class="btn-action btn-primary" onclick="saveBlogGiris(${topic.id})">Girişi Kaydet</button>
                                <button class="btn-action" onclick="downloadBlogGiris(${topic.id})">📥 Girişi İndir</button>
                                <button class="btn-action" onclick="downloadBlogTopicZip(${topic.id})">📦 Tümünü .zip İndir</button>
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
