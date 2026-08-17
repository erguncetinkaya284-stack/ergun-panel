
        function togglePlay(btn) {
            document.querySelectorAll('.song-item').forEach(item => {
                item.classList.remove('playing');
                const b = item.querySelector('button');
                b.innerText = "Oynat";
                b.classList.remove('btn-primary');
            });
            const songItem = btn.closest('.song-item');
            songItem.classList.add('playing');
            btn.innerText = "Çalıyor";
            btn.classList.add('btn-primary');
        }

