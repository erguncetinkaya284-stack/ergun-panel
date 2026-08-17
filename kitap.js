        // ================= KİTAP =================
        let books = []; // {id, title, pages:[{id,text}], saved, reading, readingIndex}
        let bookIdCounter = 1;
        let bookPageIdCounter = 1;
        let currentReadingBookId = null;

        function addBook() {
            const input = document.getElementById('new-book-title');
            const title = input.value.trim();
            if (!title) { alert('Kitap başlığı boş olamaz.'); return; }
            books.push({ id: bookIdCounter++, title, pages: [], saved: false, reading: false, readingIndex: 0 });
            input.value = '';
            renderBooks();
        }

        function harvestBookForm(bookId) {
            const book = books.find(b => b.id === bookId);
            if (!book) return;
            const titleEl = document.getElementById('book-title-' + bookId);
            if (titleEl) book.title = titleEl.value;
            book.pages.forEach(p => {
                const el = document.getElementById(`book-page-${bookId}-${p.id}`);
                if (el) p.text = el.value;
            });
        }

        function harvestAllOpenBookForms() {
            books.forEach(b => { if (!b.saved) harvestBookForm(b.id); });
        }

        function addBookPage(bookId) {
            harvestBookForm(bookId);
            const book = books.find(b => b.id === bookId);
            if (!book) return;
            book.pages.push({ id: bookPageIdCounter++, text: '' });
            renderBooks();
        }

        function removeBookPage(bookId, pageId) {
            harvestBookForm(bookId);
            const book = books.find(b => b.id === bookId);
            if (!book) return;
            book.pages = book.pages.filter(p => p.id !== pageId);
            renderBooks();
        }

        function saveBook(bookId) {
            harvestBookForm(bookId);
            const book = books.find(b => b.id === bookId);
            if (!book) return;
            book.saved = true;
            renderBooks();
        }

        function editBook(bookId) {
            const book = books.find(b => b.id === bookId);
            if (!book) return;
            book.saved = false;
            renderBooks();
        }

        function removeBook(bookId) {
            if (!confirm('Bu kitap silinecek. Emin misin?')) return;
            books = books.filter(b => b.id !== bookId);
            renderBooks();
        }

        function renderBookEditForm(book) {
            const pagesHtml = book.pages.map((p, idx) => `
                <div style="margin-bottom:8px; position:relative;">
                    <label style="font-size:0.8rem; color:var(--text-muted);">Sayfa ${idx + 1}</label>
                    <textarea class="prayer-note" id="book-page-${book.id}-${p.id}" placeholder="Sayfa metni...">${(p.text || '').replace(/</g, '&lt;')}</textarea>
                    <button class="btn-action" style="color:var(--accent-red); position:absolute; top:0; right:0; padding:2px 8px;" onclick="removeBookPage(${book.id}, ${p.id})">✕</button>
                </div>
            `).join('');

            return `
            <div class="prayer-card">
                <input type="text" id="book-title-${book.id}" value="${(book.title || '').replace(/"/g, '&quot;')}" placeholder="Kitap başlığı" style="width:100%; background:#121212; border:1px solid var(--border-color); color:var(--text-main); padding:8px 10px; border-radius:4px; font-size:1rem; font-weight:600; margin-bottom:10px;">
                <div>${pagesHtml || '<span style="color:var(--text-muted); font-size:0.8rem;">Henüz sayfa yok.</span>'}</div>
                <button class="btn-action" style="margin-top:8px;" onclick="addBookPage(${book.id})">+ Sayfa Ekle</button>
                <button class="btn-action btn-primary" style="margin-top:10px;" onclick="saveBook(${book.id})">Kaydet</button>
            </div>`;
        }

        function renderBookSummary(book) {
            const pageCount = book.pages.filter(p => p.text.trim()).length;
            return `
            <div class="prayer-card">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <strong>📕 ${book.title}</strong>
                    <span style="font-size:0.8rem; color:var(--text-muted);">${pageCount} sayfa</span>
                </div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
                    <button class="btn-action btn-primary" onclick="openBookReader(${book.id})">📖 Oku</button>
                    <button class="btn-action" onclick="addToDailyProgram('${book.title.replace(/'/g, "\\'")}')">📅 Günlük Programa Ekle</button>
                    <button class="btn-action" onclick="editBook(${book.id})">Düzenle</button>
                    <button class="btn-action" style="color:var(--accent-red)" onclick="removeBook(${book.id})">Sil</button>
                </div>
            </div>`;
        }

        function renderBooks() {
            harvestAllOpenBookForms();
            const wrap = document.getElementById('book-list');
            wrap.innerHTML = books.length
                ? books.map(b => b.saved ? renderBookSummary(b) : renderBookEditForm(b)).join('')
                : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz kitap eklenmedi.</span>';
            document.getElementById('book-count').innerText = books.length + ' kitap';
        }

        // --- Tam ekran okuma modu ---
        // Önemli: sayfa metni burada asla dışarı taşmaz; sabit boyutlu bir çerçevenin
        // içinde overflow-y:auto ile kendi içinde kayar, çerçeve sınırının dışına hiç çıkmaz.
        function renderBookReader(book) {
            const pages = book.pages.filter(p => p.text.trim());
            const idx = Math.min(book.readingIndex, Math.max(0, pages.length - 1));
            book.readingIndex = idx;
            const page = pages[idx];
            const prevDisabled = idx === 0;
            const nextDisabled = idx === pages.length - 1;

            return `
            <div id="book-reader-overlay" style="position:fixed; inset:0; background:#0d0d0d; z-index:9999; display:flex; align-items:center; justify-content:center;">
                <button onclick="closeBookReader()" style="position:absolute; top:20px; right:24px; background:none; border:none; color:#e8e4da; font-size:1.8rem; cursor:pointer; line-height:1;">✕</button>
                <button onclick="prevBookPage(${book.id})" ${prevDisabled ? 'disabled' : ''} style="position:absolute; left:16px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.08); border:none; color:#e8e4da; font-size:1.8rem; width:48px; height:48px; border-radius:50%; cursor:pointer; opacity:${prevDisabled ? '0.25' : '1'};">‹</button>
                <button onclick="nextBookPage(${book.id})" ${nextDisabled ? 'disabled' : ''} style="position:absolute; right:16px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.08); border:none; color:#e8e4da; font-size:1.8rem; width:48px; height:48px; border-radius:50%; cursor:pointer; opacity:${nextDisabled ? '0.25' : '1'};">›</button>
                <div style="width:min(700px, 86vw); height:min(760px, 82vh); background:#161616; border:1px solid #2a2a2a; border-radius:10px; padding:40px 46px; overflow-y:auto; overflow-x:hidden; font-family: Georgia, 'Times New Roman', serif; color:#e8e4da; box-shadow:0 10px 40px rgba(0,0,0,0.5); box-sizing:border-box;">
                    <div style="font-size:0.7rem; letter-spacing:2px; text-transform:uppercase; color:#c9a227; margin-bottom:10px;">${book.title}</div>
                    <div style="font-size:1rem; line-height:1.9; white-space:pre-wrap; word-break:break-word; overflow-wrap:break-word;">${(page ? page.text : '').replace(/</g, '&lt;')}</div>
                </div>
                <div style="position:absolute; bottom:18px; left:50%; transform:translateX(-50%); color:#888; font-size:0.8rem;">${pages.length ? (idx + 1) + ' / ' + pages.length : '0 / 0'}</div>
            </div>`;
        }

        function bookReaderKeyHandler(e) {
            if (currentReadingBookId === null) return;
            if (e.key === 'ArrowRight') nextBookPage(currentReadingBookId);
            if (e.key === 'ArrowLeft') prevBookPage(currentReadingBookId);
            if (e.key === 'Escape') closeBookReader();
        }

        function openBookReader(bookId) {
            const book = books.find(b => b.id === bookId);
            if (!book) return;
            const pages = book.pages.filter(p => p.text.trim());
            if (!pages.length) { alert('Bu kitapta henüz sayfa yok.'); return; }
            book.readingIndex = 0;
            currentReadingBookId = bookId;
            const existing = document.getElementById('book-reader-overlay');
            if (existing) existing.remove();
            const wrap = document.createElement('div');
            wrap.innerHTML = renderBookReader(book);
            document.body.appendChild(wrap.firstElementChild);
            document.addEventListener('keydown', bookReaderKeyHandler);
        }

        function closeBookReader() {
            const overlay = document.getElementById('book-reader-overlay');
            if (overlay) overlay.remove();
            document.removeEventListener('keydown', bookReaderKeyHandler);
            currentReadingBookId = null;
        }

        function refreshBookReader(bookId) {
            const book = books.find(b => b.id === bookId);
            const overlay = document.getElementById('book-reader-overlay');
            if (!book || !overlay) return;
            const wrap = document.createElement('div');
            wrap.innerHTML = renderBookReader(book);
            overlay.replaceWith(wrap.firstElementChild);
        }

        function nextBookPage(bookId) {
            const book = books.find(b => b.id === bookId);
            if (!book) return;
            const pages = book.pages.filter(p => p.text.trim());
            if (book.readingIndex < pages.length - 1) book.readingIndex++;
            refreshBookReader(bookId);
        }

        function prevBookPage(bookId) {
            const book = books.find(b => b.id === bookId);
            if (!book) return;
            if (book.readingIndex > 0) book.readingIndex--;
            refreshBookReader(bookId);
        }

        // Tek bir yerden tüm modülleri çizen yardımcı fonksiyon (hem ilk açılışta hem de
        // kaydedilmiş veri yüklendikten sonra tekrar çizim için kullanılır).
