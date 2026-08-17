        // ================= BLOG =================
        const BLOG_PRICE = 50;
        let blogPosts = []; // {id, title, contents:[{id,text}], saved, reading}
        let blogIdCounter = 1;
        let blogContentIdCounter = 1;
        let blogUndoStack = [];

        function snapshotBlog() {
            blogUndoStack.push(JSON.stringify({ blogPosts }));
            if (blogUndoStack.length > 30) blogUndoStack.shift();
        }

        function undoBlogAction() {
            if (!blogUndoStack.length) { alert('Geri alınacak işlem yok.'); return; }
            const prev = JSON.parse(blogUndoStack.pop());
            blogPosts = prev.blogPosts;
            renderBlog();
        }

        function harvestBlogForm(postId) {
            const post = blogPosts.find(p => p.id === postId);
            if (!post) return;
            const titleEl = document.getElementById('blog-title-' + postId);
            if (titleEl) post.title = titleEl.value;
            post.contents.forEach(c => {
                const el = document.getElementById(`blog-content-${postId}-${c.id}`);
                if (el) c.text = el.value;
            });
        }

        function harvestAllOpenBlogForms() {
            blogPosts.forEach(p => { if (!p.saved) harvestBlogForm(p.id); });
        }

        function addBlogPost() {
            const input = document.getElementById('new-blog-title');
            const title = input.value.trim();
            if (!title) { alert('Başlık boş olamaz.'); return; }
            snapshotBlog();
            blogPosts.push({ id: blogIdCounter++, title, contents: [], saved: false, reading: false });
            input.value = '';
            renderBlog();
        }

        function addBlogContent(postId) {
            harvestBlogForm(postId);
            snapshotBlog();
            const post = blogPosts.find(p => p.id === postId);
            if (!post) return;
            post.contents.push({ id: blogContentIdCounter++, text: '' });
            renderBlog();
        }

        function removeBlogContent(postId, contentId) {
            harvestBlogForm(postId);
            snapshotBlog();
            const post = blogPosts.find(p => p.id === postId);
            if (!post) return;
            post.contents = post.contents.filter(c => c.id !== contentId);
            renderBlog();
        }

        function saveBlogPost(postId) {
            harvestBlogForm(postId);
            snapshotBlog();
            const post = blogPosts.find(p => p.id === postId);
            if (!post) return;
            post.saved = true;
            renderBlog();
        }

        function editBlogPost(postId) {
            snapshotBlog();
            const post = blogPosts.find(p => p.id === postId);
            if (!post) return;
            post.saved = false;
            renderBlog();
        }

        function removeBlogPost(postId) {
            harvestAllOpenBlogForms();
            snapshotBlog();
            blogPosts = blogPosts.filter(p => p.id !== postId);
            renderBlog();
        }

        function toggleBlogReading(postId) {
            const post = blogPosts.find(p => p.id === postId);
            if (!post) return;
            post.reading = !post.reading;
            renderBlog();
        }

        function renderBlogReadingView(post) {
            const paragraphs = post.contents.filter(c => c.text.trim()).map(c => `
                <p style="margin:0 0 14px 0; line-height:1.7;">${c.text.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>
            `).join('');
            return `
            <div style="margin-top:14px; background:#0d0d0d; border:1px solid var(--border-color); border-radius:8px; padding:22px; font-family: Georgia, 'Times New Roman', serif; color:#e8e4da;">
                <div style="font-size:0.75rem; letter-spacing:2px; text-transform:uppercase; color:var(--accent-gold); margin-bottom:6px;">Ergün Gazetesi</div>
                <h2 style="font-size:1.6rem; margin:0 0 14px 0; border-bottom:2px solid var(--border-color); padding-bottom:10px;">${post.title}</h2>
                ${paragraphs || '<p style="color:var(--text-muted); font-family: inherit;">Henüz içerik eklenmedi.</p>'}
            </div>`;
        }

        function renderBlogEditForm(post) {
            const contentsHtml = post.contents.map((c, idx) => `
                <div style="margin-bottom:8px; position:relative;">
                    <label style="font-size:0.8rem; color:var(--text-muted);">İçerik ${idx + 1}</label>
                    <textarea class="prayer-note" id="blog-content-${post.id}-${c.id}" placeholder="İçerik metni...">${(c.text || '').replace(/</g, '&lt;')}</textarea>
                    <button class="btn-action" style="color:var(--accent-red); position:absolute; top:0; right:0; padding:2px 8px;" onclick="removeBlogContent(${post.id}, ${c.id})">✕</button>
                </div>
            `).join('');

            return `
            <div class="prayer-card">
                <input type="text" id="blog-title-${post.id}" value="${(post.title || '').replace(/"/g, '&quot;')}" placeholder="Blog başlığı" style="width:100%; background:#121212; border:1px solid var(--border-color); color:var(--text-main); padding:8px 10px; border-radius:4px; font-size:1rem; font-weight:600; margin-bottom:10px;">
                <div>${contentsHtml || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz içerik bölümü yok.</span>'}</div>
                <button class="btn-action" style="margin-top:8px;" onclick="addBlogContent(${post.id})">+ İçerik Ekle</button>
                <button class="btn-action btn-primary" style="margin-top:10px;" onclick="saveBlogPost(${post.id})">Kaydet</button>
            </div>`;
        }

        function renderBlogSummary(post) {
            const readingHtml = post.reading ? renderBlogReadingView(post) : '';
            const sectionCount = post.contents.filter(c => c.text.trim()).length;
            return `
            <div class="prayer-card">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <strong>📰 ${post.title}</strong>
                    <span class="category-tag" style="background:rgba(241,196,15,0.15); border-color:rgba(241,196,15,0.4); color:var(--accent-gold);">${BLOG_PRICE} ₺</span>
                </div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${sectionCount} bölüm</div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
                    <button class="btn-action btn-primary" onclick="toggleBlogReading(${post.id})">${post.reading ? 'Okumayı Kapat' : '📖 Gazete Gibi Oku'}</button>
                    <button class="btn-action" onclick="editBlogPost(${post.id})">Düzenle</button>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeBlogPost(${post.id})">Sil</button>
                </div>
                ${readingHtml}
            </div>`;
        }

        function renderBlog() {
            harvestAllOpenBlogForms();
            const wrap = document.getElementById('blog-list');
            wrap.innerHTML = blogPosts.length
                ? blogPosts.map(p => p.saved ? renderBlogSummary(p) : renderBlogEditForm(p)).join('')
                : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz blog eklenmedi.</span>';
            document.getElementById('blog-count').innerText = blogPosts.length + ' yazı';
        }

