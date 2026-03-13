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
    
    // Pastikan pesan awal dari config
    subMsg.textContent = config.messages.status.startup;
    container.innerHTML = "";

    // Buat ulang Drop Area
    const dropArea = document.createElement('div');
    dropArea.className = 'drop-area-square';
    dropArea.id = 'drop-zone';
    
    // Status UI di tengah drop area
    dropArea.innerHTML = `
        <div class="status-overlay" id="status-ui">
            <i data-lucide="image-plus"></i>
            <span>${config.messages.status.startup}</span>
        </div>
    `;
    container.appendChild(dropArea);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    container.appendChild(fileInput);

    // Group tombol (Download & Reset)
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';
    btnGroup.id = 'ui-group';
    btnGroup.style.display = 'none';
    container.appendChild(btnGroup);

    lucide.createIcons();

    // Fungsi klik aktif di awal
    dropArea.onclick = () => fileInput.click();

    fileInput.onchange = function() {
        if(this.files && this.files[0]) processImage(this.files[0]);
        // Reset value agar file yang sama bisa dipilih lagi jika di-reset
        this.value = ""; 
    };

    function processImage(file) {
        const statusUI = document.getElementById('status-ui');
        const uiGroup = document.getElementById('ui-group');
        const subMsg = document.getElementById('sub-msg');
        const zone = document.getElementById('drop-zone');

        // Update status ke "Processing"
        subMsg.textContent = config.messages.status.processing;
        statusUI.innerHTML = `
            <i data-lucide="loader-2" class="spinning"></i>
            <span>${config.messages.status.processing}</span>
        `;
        lucide.createIcons();

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

                    // 1. TAMPILKAN HASIL & HAPUS BORDER
                    zone.classList.add('no-border'); 
                    zone.innerHTML = `<img src="${result}" class="preview-img">`;
                    
                    // 2. MATIKAN FUNGSI KLIK (Agar tidak bisa dobel unggah)
                    zone.onclick = null; 
                    
                    subMsg.textContent = config.messages.status.done;
                    uiGroup.innerHTML = "";
                    uiGroup.style.display = 'flex';

                    // Tombol Download
                    const btnDl = document.createElement('button');
                    btnDl.className = 'btn-download';
                    btnDl.innerHTML = `<i data-lucide="download"></i> ${config.messages.buttons.download}`;
                    btnDl.onclick = () => {
                        const a = document.createElement('a');
                        a.href = result; a.download = config.profilePictureName; a.click();
                    };

                    // Tombol Reset (Memanggil initApp untuk mengaktifkan kembali drop area)
                    const btnRe = document.createElement('button');
                    btnRe.className = 'btn-reset';
                    btnRe.innerHTML = `<i data-lucide="refresh-cw"></i> ${config.messages.buttons.newImage}`;
                    btnRe.onclick = () => initApp(); 

                    uiGroup.appendChild(btnDl);
                    uiGroup.appendChild(btnRe);
                    lucide.createIcons();
                };
            };
        }, 150);
    }
}