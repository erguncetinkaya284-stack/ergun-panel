        function updateRealEstate(btn, change, pricePerUnit) {
            const container = btn.parentElement;
            const span = container.querySelector('.counter-value');
            let val = parseInt(span.innerText) + change;
            if (val < 0) val = 0;
            if (val > 500) val = 500;

            if (span.id === 'ev-dolu') evDoluCount = val;
            if (span.id === 'dukkan-dolu') dukkanDoluCount = val;

            renderGayrimenkul();
        }

        function renderGayrimenkul() {
            document.getElementById('ev-dolu').innerText = evDoluCount;
            document.getElementById('dukkan-dolu').innerText = dukkanDoluCount;
            document.getElementById('ev-gelir').innerText = (evDoluCount * 30000).toLocaleString('tr-TR') + " ₺";
            document.getElementById('dukkan-gelir').innerText = (dukkanDoluCount * 30000).toLocaleString('tr-TR') + " ₺";
            calculateTotalRevenue();
        }

        function calculateTotalRevenue() {
            // İsteğe bağlı üst kasa özeti güncellenebilir
        }

