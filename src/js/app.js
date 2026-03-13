let config;

addEventListener('load', function() {  
    fetch('config/config.json')
        .then(res => res.json())
        .then(json => {
            config = json;
            document.getElementById('main-title').textContent = config.appTitle;
            initApp();
        });
});

function initApp() {
    const container = document.getElementById('dynamic-content');
    const subMsg = document.getElementById('sub-msg');
    
    // Reset pesan status
    subMsg.textContent = config.messages.status.startup;
    container.innerHTML = "";

    // 1. Buat Drop Area
    const dropArea = document.createElement('div');
    dropArea.className = 'drop-area-square';
    dropArea.id = 'drop-zone';
    dropArea.innerHTML = `
        <div class="status-overlay" id="status-ui">
            <i data-lucide="image-plus"></i>
            <span>${config.messages.status.startup}</span>
        </div>
    `;

    // 2. Buat Input File Tersembunyi
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // 3. Buat Container Tombol
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';
    btnGroup.id = 'ui-group';
    btnGroup.style.display = 'none';

    // Masukkan ke DOM
    container.appendChild(dropArea);
    container.appendChild(fileInput);
    container.appendChild(btnGroup);

    lucide.createIcons();

    // Event Klik Area (Aktif saat awal)
    dropArea.onclick = () => fileInput.click();

    fileInput.onchange = function() {
        if(this.files && this.files[0]) processImage(this.files[0]);
    };

    function processImage(file) {
        const statusUI = document.getElementById('status-ui');
        const uiGroup = document.getElementById('ui-group');
        const subMsg = document.getElementById('sub-msg');
        const zone = document.getElementById('drop-zone');

        subMsg.textContent = config.messages.status.processing;
        statusUI.innerHTML = `
            <i data-lucide="loader-2" class="spinning"></i>
            <span>${config.messages.status.processing}</span>
        `;
        lucide.createIcons();

        // Simulasi loading sebentar agar transisi smooth
        setTimeout(() => {
            const overlayImg = new Image();
            overlayImg.src = config.overlaySource;

            overlayImg.onload = () => {
                const userImg = new Image();
                userImg.src = URL.createObjectURL(file);

                userImg.onload = () => {
                    const gen = new Generator({
                        width: overlayImg.width,
                        height: overlayImg.height
                    });

                    gen.addLayer(userImg);
                    gen.addLayer(overlayImg, { isOverlay: true });
                    const result = gen.render();

                    // --- TAHAP PENGUNCIAN ---
                    // 1. Hapus isi status, ganti dengan hasil gambar
                    zone.innerHTML = `<img src="${result}" class="preview-img">`;
                    
                    // 2. Tambahkan class 'no-border' (yg ada pointer-events: none)
                    zone.classList.add('no-border'); 
                    
                    // 3. Hapus listener klik via JS sebagai backup
                    zone.onclick = null; 

                    // Tampilkan Tombol
                    subMsg.textContent = config.messages.status.done;
                    uiGroup.innerHTML = "";
                    uiGroup.style.display = 'flex';

                    // Tombol Download
                    const btnDl = document.createElement('button');
                    btnDl.className = 'btn-download';
                    btnDl.innerHTML = `<i data-lucide="download"></i> Unduh Hasil`;
                    btnDl.onclick = () => {
                        const a = document.createElement('a');
                        a.href = result; a.download = config.profilePictureName; a.click();
                    };

                    // Tombol Reset (Untuk mengaktifkan kembali drop area)
                    const btnRe = document.createElement('button');
                    btnRe.className = 'btn-reset';
                    btnRe.innerHTML = `<i data-lucide="refresh-cw"></i> Ganti Foto`;
                    btnRe.onclick = () => initApp(); 

                    uiGroup.appendChild(btnDl);
                    uiGroup.appendChild(btnRe);
                    lucide.createIcons();
                };
            };
        }, 300);
    }
}