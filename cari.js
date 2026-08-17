        // ================= CARİ HESAP (MÜŞTERİ BORÇ/ALACAK) =================
        let cariCustomers = []; // {id, name}
        let cariCustomerIdCounter = 1;
        let cariTx = []; // {id, customerId, type: 'borc'|'tahsilat', amount, note}
        let cariTxIdCounter = 1;

        function addCariCustomer() {
            const input = document.getElementById('new-cari-customer');
            const name = input.value.trim();
            if (!name) { alert('Müşteri adı boş olamaz.'); return; }
            cariCustomers.push({ id: cariCustomerIdCounter++, name });
            input.value = '';
            renderCari();
        }

        function removeCariCustomer(id) {
            if (!confirm('Bu müşteri ve tüm hareketleri silinecek. Emin misin?')) return;
            cariCustomers = cariCustomers.filter(c => c.id !== id);
            cariTx = cariTx.filter(t => t.customerId !== id);
            renderCari();
        }

        function renderCariCustomerOptions() {
            const select = document.getElementById('cari-tx-customer');
            select.innerHTML = cariCustomers.length
                ? cariCustomers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')
                : '<option value="">Önce müşteri ekle</option>';
        }

        function addCariTx() {
            const customerId = parseInt(document.getElementById('cari-tx-customer').value);
            const type = document.getElementById('cari-tx-type').value;
            const amount = parseFloat(document.getElementById('cari-tx-amount').value.replace(',', '.')) || 0;
            const note = document.getElementById('cari-tx-note').value.trim();
            if (!customerId) { alert('Önce bir müşteri seç.'); return; }
            if (!amount || amount <= 0) { alert('Geçerli bir tutar gir.'); return; }
            cariTx.push({ id: cariTxIdCounter++, customerId, type, amount, note });
            document.getElementById('cari-tx-amount').value = '';
            document.getElementById('cari-tx-note').value = '';
            renderCari();
        }

        function removeCariTx(id) {
            cariTx = cariTx.filter(t => t.id !== id);
            renderCari();
        }

        function cariBalance(customerId) {
            return cariTx.filter(t => t.customerId === customerId).reduce((sum, t) => sum + (t.type === 'borc' ? t.amount : -t.amount), 0);
        }

        function renderCariCustomerList() {
            const wrap = document.getElementById('cari-customer-list');
            wrap.innerHTML = cariCustomers.length ? cariCustomers.map(c => {
                const balance = cariBalance(c.id);
                const txs = cariTx.filter(t => t.customerId === c.id).slice().reverse().slice(0, 10);
                return `
                <div class="prayer-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                        <strong>👤 ${c.name}</strong>
                        <span style="font-weight:600; color:${balance > 0 ? 'var(--accent-red)' : (balance < 0 ? 'var(--accent-green)' : 'var(--text-muted)')};">
                            ${balance > 0 ? 'Borcu: ' + balance.toLocaleString('tr-TR') + ' ₺' : (balance < 0 ? 'Bizim Borcumuz: ' + Math.abs(balance).toLocaleString('tr-TR') + ' ₺' : 'Hesap Kapalı')}
                        </span>
                        <button class="btn-action" style="color:var(--accent-red)" onclick="removeCariCustomer(${c.id})">Müşteri Sil</button>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:4px; margin-top:6px;">
                        ${txs.length ? txs.map(t => `
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted); flex-wrap:wrap; gap:4px;">
                                <span>${t.type === 'borc' ? '➕ Borç' : '➖ Tahsilat'}: ${t.amount.toLocaleString('tr-TR')} ₺${t.note ? (' — ' + t.note) : ''}</span>
                                <button class="btn-action" style="color:var(--accent-red); padding:1px 6px;" onclick="removeCariTx(${t.id})">✕</button>
                            </div>
                        `).join('') : '<span style="font-size:0.8rem; color:var(--text-muted);">Henüz hareket yok.</span>'}
                    </div>
                </div>`;
            }).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Henüz müşteri eklenmedi.</span>';
        }

        function renderCari() {
            renderCariCustomerOptions();
            renderCariCustomerList();
            const totalBalance = cariCustomers.reduce((sum, c) => sum + cariBalance(c.id), 0);
            document.getElementById('cari-total').innerText = `Toplam Alacağımız: ${totalBalance.toLocaleString('tr-TR')} ₺`;
            document.getElementById('cari-count').innerText = `${cariCustomers.length} müşteri`;
        }

