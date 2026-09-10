        // Modül kutusunu aç/kapa (üçgen ikonuna tıklanınca) ve durumu kalıcı olarak kaydet
        const MODULE_IDS = ['module-ibadet', 'module-gunluk', 'module-fitness', 'module-spor', 'module-dovus', 'module-kpss', 'module-yks', 'module-dil', 'module-tarif', 'module-enstruman', 'module-tasarim', 'module-oyun', 'module-tarim', 'module-blog', 'module-kitap', 'module-yazilim', 'module-kiraathane', 'module-cari', 'module-yatirim', 'module-sut', 'module-manav', 'module-et', 'module-tekstil', 'module-teknoloji', 'module-arac', 'module-gayrimenkul'];

        function toggleModule(arrow) {
            const box = arrow.closest('.module-box');
            box.classList.toggle('collapsed');
            saveModuleState(box.id, box.classList.contains('collapsed'));
        }

        // Bugünün tarihini 'YYYY-MM-DD' formatında döner — birçok modül günlük takip için kullanır
        function todayStr() {
            return new Date().toISOString().slice(0, 10);
        }

        // ================= KALICI VERİ SAKLAMA (sayfa yenilense bile veriler silinmez) =================
        // Önce window.storage (Claude artifact depolaması) denenir, yoksa localStorage'a düşülür.
        //
        // ÖNEMLİ (refresh/kilitlenme düzeltmesi): window.storage her ortamda anında yanıt
        // vermeyebilir (örn. sayfa bağımsız bir sunucuda çalıştırılırsa). Bu yüzden her
        // storage çağrısı withTimeout() ile bir süre sınırına bağlanır; süre dolarsa
        // sonsuza kadar beklemek yerine otomatik olarak localStorage'a düşülür.
        function withTimeout(promise, ms) {
            return Promise.race([
                Promise.resolve(promise),
                new Promise(resolve => setTimeout(() => resolve(undefined), ms))
            ]);
        }

        async function persistSet(key, value) {
            if (window.storage) {
                try {
                    const ok = await withTimeout(window.storage.set(key, value, false), 1200);
                    if (ok !== undefined) return;
                    // zaman aşımına uğradı -> aşağıda localStorage'a da yazılır (yedek olarak)
                } catch (e) { /* window.storage kullanılamıyor, localStorage'a düşülüyor */ }
            }
            try { localStorage.setItem(key, value); } catch (e) { /* saklama alanı yok, sessizce geç */ }
        }

        async function persistGet(key) {
            if (window.storage) {
                try {
                    const result = await withTimeout(window.storage.get(key, false), 1200);
                    if (result !== undefined) return result ? result.value : null;
                    // zaman aşımına uğradı -> localStorage'dan okumayı dene
                } catch (e) { /* window.storage kullanılamıyor, localStorage'a düşülüyor */ }
            }
            try { return localStorage.getItem(key); } catch (e) { return null; }
        }

        async function saveModuleState(moduleId, collapsed) {
            await persistSet('collapsed:' + moduleId, collapsed ? '1' : '0');
        }

        async function loadModuleStates() {
            for (const id of MODULE_IDS) {
                const value = await persistGet('collapsed:' + id);
                if (value === '1') {
                    const box = document.getElementById(id);
                    if (box) box.classList.add('collapsed');
                }
            }
        }

        // Kalıcı olarak saklanacak tüm modül verilerinin (kategoriler, projeler, görevler, satışlar, sayaçlar vb.) listesi
        const ALL_STATE_VARS = [
            'scheduleItems','scheduleIdCounter','scheduleViewMode',
            'tasarimSubjects','tasarimSubjectIdCounter','tasarimTopics','tasarimTopicIdCounter','tasarimAnlatimlar','tasarimAnlatimIdCounter','tasarimTechniques',
            'productCatalog','catalogIdCounter','salesTables','tableIdCounter','salesTabs','tabIdCounter','itemIdCounter',
            'timeCategories','typeCategories','recipes','recipeIdCounter',
            'langCategories','topicCategories','langItems','langIdCounter',
            'combatCategories','combatItems','combatIdCounter',
            'instrumentCategories','lessonCategories','instrumentItems','instrumentIdCounter',
            'fitnessCategories','fitnessItems','fitnessIdCounter','bodyMeasurements','measurementIdCounter',
            'sporVariants','sporItems','sporIdCounter',
            'prayerData','cumaData','ramazanModeOn','teravihData','quranDuraks','quranDurakIdCounter','quranRepeatCount','elifbaPages','elifbaPageIdCounter','prayerHistory',
            'tekstilBrands','tekstilSizes','tekstilSeasons','tekstilVariants','tekstilProducts','tekstilIdCounter',
            'aracCategories','aracItems','aracItemIdCounter',
            'etTypes','etMachines','etMachineIdCounter','etStockMap','etPriceMap','etSales','etSaleIdCounter',
            'manavTypes','manavStockMap','manavPriceMap','manavSales','manavSaleIdCounter',
            'sutTypes','sutStockMap','sutPriceMap','sutSales','sutSaleIdCounter',
            'kpssSubjects','kpssSubjectIdCounter','kpssTopics','kpssTopicIdCounter','kpssUnits','kpssUnitIdCounter','kpssQuestionIdCounter','kpssQuizAnswers',
            'yksSubjects','yksSubjectIdCounter','yksTopics','yksTopicIdCounter','yksUnits','yksUnitIdCounter','yksQuestionIdCounter','yksQuizAnswers',
            'blogTopics','blogTopicIdCounter','blogAltIdCounter',
            'tarlalar','tarlaIdCounter','hasatlar','hasatIdCounter','sulamaMap','tohumTypes','tohumStockMap','tohumUseMap','belgeler','belgeIdCounter','havaNotlari','havaNoteIdCounter',
            'cariCustomers','cariCustomerIdCounter','cariTx','cariTxIdCounter',
            'teknolojiCategories','teknolojiItems','teknolojiItemIdCounter',
            'yazilimCategories','yazilimCategoryIdCounter','yazilimProjects','yazilimProjectIdCounter','yazilimTasks','yazilimTaskIdCounter','yazilimChecklistIdCounter',
            'books','bookIdCounter','bookPageIdCounter',
            'siirler','siirIdCounter',
            'suruItems','suruIdCounter','suruTypes',
            'yatirimCategories','yatirimItems','yatirimItemIdCounter','yatirimNotes',
            'evDoluCount','dukkanDoluCount',
            'moduleVisibility','moduleOrder'
        ];

        // Ana sayfadaki modül kartlarının hangilerinin görünür olduğu ve hangi sırada
        // dizileceği — Yönetici panelinden ayarlanır. Varsayılan: hepsi görünür, kod
        // sırasıyla aynı.
        let moduleVisibility = {};
        let moduleOrder = [];

        // NOT (çoklu sayfa uyarlaması): Bu sayfada SADECE bu modülün değişkenleri
        // tanımlı olduğu için, önce depodaki TAM yedeği okuyup diğer modüllerin
        // verisini koruyoruz, sonra sadece bu sayfada var olan değişkenleri
        // üzerine yazıyoruz. Böylece hiçbir modülün verisi kaybolmaz.
        async function saveAllData() {
            try {
                const raw = await persistGet('app-full-data');
                const snapshot = raw ? JSON.parse(raw) : {};
                ALL_STATE_VARS.forEach(name => {
                    try { snapshot[name] = eval(name); } catch (e) { /* bu sayfada tanımlı değil, dokunma */ }
                });
                await persistSet('app-full-data', JSON.stringify(snapshot));
            } catch (e) { /* kaydetme sırasında sorun olursa sessizce geç, uygulama çalışmaya devam eder */ }
        }

        let saveTimer = null;
        function scheduleSave() {
            if (saveTimer) clearTimeout(saveTimer);
            saveTimer = setTimeout(saveAllData, 300);
        }

        async function loadAllData() {
            const raw = await persistGet('app-full-data');
            if (!raw) return;
            try {
                const snapshot = JSON.parse(raw);
                ALL_STATE_VARS.forEach(name => {
                    if (Object.prototype.hasOwnProperty.call(snapshot, name)) {
                        try { eval(name + ' = snapshot["' + name + '"];'); } catch (e) { /* bu sayfada tanımlı değil, geç */ }
                    }
                });
                if (typeof migrateLegacySchedule === 'function') migrateLegacySchedule();
            } catch (e) { /* bozuk/eksik veri varsa sessizce geç, uygulama boş başlar */ }
        }

        // ================= DIŞA AKTAR / İÇE AKTAR (sunucusuz, elle senkron) =================
        async function exportAllData() {
            try {
                // Depodaki TAM yedeği al (diğer sayfalarda kaydedilmiş modül verileri dahil),
                // sonra bu sayfada canlı olan değişkenlerle güncelle -> her sayfadan tam yedek alınabilir.
                const raw = await persistGet('app-full-data');
                const snapshot = raw ? JSON.parse(raw) : {};
                ALL_STATE_VARS.forEach(name => {
                    try { snapshot[name] = eval(name); } catch (e) { /* bu sayfada tanımlı değil, depodaki değer kalır */ }
                });
                const json = JSON.stringify(snapshot);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const dateStr = new Date().toISOString().slice(0, 10);
                a.href = url;
                a.download = `ergun-yedek-${dateStr}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showExportQrOption(json);
            } catch (e) {
                alert('Dışa aktarma sırasında bir sorun oluştu: ' + e.message);
            }
        }

        function showExportQrOption(json) {
            const existing = document.getElementById('export-qr-overlay');
            if (existing) existing.remove();

            const overlay = document.createElement('div');
            overlay.id = 'export-qr-overlay';
            overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';

            const box = document.createElement('div');
            box.style.cssText = 'background:var(--surface-color); border:1px solid var(--border-color); border-radius:10px; padding:24px; max-width:360px; text-align:center;';

            const canGenerateQr = json.length <= 1800 && typeof QRCode !== 'undefined';

            box.innerHTML = `
                <h3 style="margin-bottom:10px;">✅ Dosya indirildi</h3>
                ${canGenerateQr
                    ? `<p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">İstersen bu QR kodu telefonunla okutup içe aktarabilirsin:</p>
                       <div id="qr-canvas-wrap" style="display:flex; justify-content:center; margin-bottom:12px; background:#fff; padding:10px; border-radius:6px;"></div>`
                    : `<p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">
                         ${json.length > 1800
                            ? `Veri miktarı QR koduna sığmayacak kadar büyük (${json.length.toLocaleString('tr-TR')} karakter).`
                            : 'QR kod özelliği için internet bağlantısı gerekiyor, şu an kullanılamıyor.'}
                         Dosyayı WhatsApp'a kendine atarak veya USB ile taşıyarak diğer cihaza aktarabilirsin.
                       </p>`
                }
                <button class="btn-action btn-primary" onclick="document.getElementById('export-qr-overlay').remove()">Tamam</button>
            `;

            overlay.appendChild(box);
            document.body.appendChild(overlay);

            if (canGenerateQr) {
                try {
                    new QRCode(document.getElementById('qr-canvas-wrap'), { text: json, width: 220, height: 220 });
                } catch (e) {
                    document.getElementById('qr-canvas-wrap').innerHTML = '<span style="color:#333; font-size:0.8rem;">QR kod oluşturulamadı.</span>';
                }
            }
        }

        // Eski yedeklerde farklı isimle kaydedilmiş alanlar için eşleme (geriye dönük uyumluluk)
        const LEGACY_STATE_ALIASES = {
            'evDolu': 'evDoluCount',
            'dukkanDolu': 'dukkanDoluCount'
        };

        function importAllData(file) {
            if (!file) return;
            if (!confirm('İçe aktarınca paneldeki mevcut veriler, dosyadaki verilerle değiştirilecek. Devam edilsin mi?')) {
                document.getElementById('import-file-input').value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const snapshot = JSON.parse(e.target.result);

                    // Eski alan adlarını (varsa) güncel isimlere kopyala, mevcut isim boşsa
                    Object.keys(LEGACY_STATE_ALIASES).forEach(oldName => {
                        const newName = LEGACY_STATE_ALIASES[oldName];
                        if (Object.prototype.hasOwnProperty.call(snapshot, oldName) &&
                            !Object.prototype.hasOwnProperty.call(snapshot, newName)) {
                            snapshot[newName] = snapshot[oldName];
                        }
                    });

                    // Yüklenen dosya TÜM modüllerin verisini içerebilir; depoya TAM haliyle yaz
                    // ki diğer sayfalar da (ziyaret edildiklerinde) bu veriyi görsün.
                    await persistSet('app-full-data', JSON.stringify(snapshot));

                    // Bu sayfada tanımlı olan değişkenleri de canlı güncelle (anında görünsün diye)
                    ALL_STATE_VARS.forEach(name => {
                        if (Object.prototype.hasOwnProperty.call(snapshot, name)) {
                            try { eval(name + ' = snapshot["' + name + '"];'); } catch (e) { /* bu sayfada tanımlı değil, geç */ }
                        }
                    });
                    if (typeof scheduleItems !== 'undefined' && !Object.prototype.hasOwnProperty.call(snapshot, 'scheduleItems')) {
                        scheduleItems = [];
                    }
                    if (typeof migrateLegacySchedule === 'function') migrateLegacySchedule();
                    if (typeof renderModule === 'function') renderModule();
                    alert('İçe aktarma tamamlandı. Diğer modüllerin verisi de depoya yazıldı, ilgili sayfayı açtığında görünecek.');
                } catch (err) {
                    alert('Dosya okunamadı ya da bozuk: ' + err.message);
                }
                document.getElementById('import-file-input').value = '';
            };
            reader.onerror = function() {
                alert('Dosya okunurken bir hata oluştu.');
                document.getElementById('import-file-input').value = '';
            };
            reader.readAsText(file);
        }

        // Üst banner'daki arama kutusu: modüllerin içeriğinde arama yapar, eşleşmeyenleri gizler
        function filterModules() {
            const q = document.getElementById('global-search').value.trim().toLowerCase();
            document.querySelectorAll('.module-box').forEach(box => {
                if (!q) { box.style.display = ''; return; }
                const text = box.textContent.toLowerCase();
                box.style.display = text.includes(q) ? '' : 'none';
            });
        }

        // Sayaç artırma/eksiltme fonksiyonu (Gayrimenkul tablosu için)
        let evDoluCount = 0;
        let dukkanDoluCount = 0;

        // ================= OTOMATİK KAYIT (tüm modüller için ortak güvence) =================
        // Bazı modüllerin CRUD fonksiyonları kendi içinde scheduleSave() çağırmıyor olabilir
        // (özellikle çoklu sayfaya bölünmeden önceki koddan miras kalanlar). Bu yüzden her
        // sayfada, arka planda periyodik olarak ve sayfadan ayrılırken otomatik kayıt yapılır —
        // böylece hangi modülde olursan ol, yaptığın değişiklik kaybolmaz.
        setInterval(() => { saveAllData(); }, 2000);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') saveAllData();
        });
        window.addEventListener('pagehide', () => { saveAllData(); });
        window.addEventListener('beforeunload', () => { saveAllData(); });

        // ================= PWA KURULUMU (Ana Ekrana Ekle için) =================
        // Her sayfaya otomatik olarak manifest bağlantısını ve service worker'ı ekler,
        // böylece 27 dosyanın her birine tek tek eklemeye gerek kalmaz.
        (function setupPWA() {
            const manifestLink = document.createElement('link');
            manifestLink.rel = 'manifest';
            manifestLink.href = 'manifest.json';
            document.head.appendChild(manifestLink);

            const themeColor = document.createElement('meta');
            themeColor.name = 'theme-color';
            themeColor.content = '#c0392b';
            document.head.appendChild(themeColor);

            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('sw.js').catch(() => { /* çevrimdışı destek olmadan da site normal çalışır */ });
                });
            }
        })();
