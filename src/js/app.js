let config;
let generatorInstance;

addEventListener('load', function() {  
    fetch('config/config.json')
        .then(res => res.json())
        .then(json => {
            config = json;
            document.getElementById('title-text').textContent = config.appTitle;
            document.getElementById('subtitle-text').textContent = config.appSubtitle;
            initApp(true);
        })
        .catch(err => {
            console.error("Gagal memuat config:", err);
            document.getElementById('title-text').textContent = "Kesalahan Sistem";
        });
});

function initApp(firstLoad = false) {
    const container = document.getElementById('dynamic-content');
    
    // Sembunyikan konten lama
    container.classList.remove('fade-active');

    // Gunakan delay jika bukan pemuatan pertama untuk memberi waktu transisi keluar
    const delay = firstLoad ? 0 : 200;

    setTimeout(() => {
        container.innerHTML = "";
        
        // Buat struktur drop area
        const dropArea = document.createElement('div');
        dropArea.className = 'drop-area-square';
        dropArea.id = 'drop-zone';
        dropArea.innerHTML = `
            <div class="status-overlay">
                <i data-lucide="image-plus"></i>
                <span>${config.messages.status.startup}</span>
            </div>
        `;

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';
        btnGroup.id = 'ui-group';
        btnGroup.style.display = 'none'; // Sembunyikan sampai gambar diproses

        container.appendChild(dropArea);
        container.appendChild(fileInput);
        container.appendChild(btnGroup);

        lucide.createIcons();

        // Aktifkan transisi masuk
        requestAnimationFrame(() => {
            container.classList.add('fade-active');
        });

        // Event Listeners
        dropArea.onclick = () => fileInput.click();
        fileInput.onchange = function() {
            if(this.files && this.files[0]) {
                processImage(this.files[0]);
            }
        };
    }, delay); 
}

function processImage(file) {
    const zone = document.getElementById('drop-zone');
    const uiGroup = document.getElementById('ui-group');

    // Tampilkan status loading
    zone.onclick = null; 
    zone.innerHTML = `
        <div class="status-overlay">
            <i data-lucide="loader-2" class="spin"></i>
            <span>${config.messages.status.processing}</span>
        </div>
    `;
    lucide.createIcons();

    const reader = new FileReader();
    reader.onload = (e) => {
        const userImg = new Image();
        userImg.src = e.target.result;

        userImg.onload = () => {
            const overlayImg = new Image();
            overlayImg.src = config.overlaySource;

            overlayImg.onload = () => {
                // Bersihkan zone dan setel mode preview
                zone.classList.add('no-border');
                zone.innerHTML = "";
                
                const canvas = document.createElement('canvas');
                // Canvas akan mengikuti ukuran CSS 100% dari .drop-area-square
                zone.appendChild(canvas);

                // Inisialisasi Generator (Pastikan class Generator Anda sudah mendukung canvas ini)
                generatorInstance = new Generator(canvas, { width: 1080, height: 1080 });
                generatorInstance.setUserImage(userImg);
                generatorInstance.setOverlayImage(overlayImg);

                // Tampilkan tombol navigasi
                uiGroup.style.display = 'flex';
                uiGroup.innerHTML = "";

                const btnDl = document.createElement('button');
                btnDl.className = 'btn-download';
                btnDl.innerHTML = `<i data-lucide="download"></i> ${config.messages.buttons.download}`;
                btnDl.onclick = () => {
                    const dataUrl = generatorInstance.render();
                    const link = document.createElement('a');
                    link.download = config.profilePictureName || 'twibbon.png';
                    link.href = dataUrl;
                    link.click();
                };

                const btnRe = document.createElement('button');
                btnRe.className = 'btn-reset';
                btnRe.innerHTML = `<i data-lucide="refresh-cw"></i> ${config.messages.buttons.newImage}`;
                btnRe.onclick = () => initApp(); 

                uiGroup.appendChild(btnDl);
                uiGroup.appendChild(btnRe);
                lucide.createIcons();
            };
        };
    };
    reader.readAsDataURL(file);
}